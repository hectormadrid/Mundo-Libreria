import { Router } from 'express';
import { all, one } from '../db.js';
import { HttpError, queryStr, send } from '../http.js';
import { imageUrl } from '../uploads.js';

/** Rutas de resumen del panel. Se montan dentro del router de administración (requieren sesión de admin). */
export const dashboardRouter = Router();

// Todas las fechas se agrupan en hora de Chile: Supabase guarda en UTC.
const TZ = `'America/Santiago'`;
// Ventas confirmadas: el dinero ya está pagado (o el pedido avanzó después del pago).
const CONFIRMADOS = `('pagado', 'enviado', 'entregado')`;

/** Períodos del dashboard: días hacia atrás (incluido hoy) y agrupación del gráfico. */
const PERIODOS: Record<string, { dias: number; grano: 'day' | 'week' | 'month' }> = {
  '7': { dias: 7, grano: 'day' },
  '30': { dias: 30, grano: 'day' },
  '90': { dias: 90, grano: 'week' },
  '365': { dias: 365, grano: 'month' },
};

/** Contadores para las insignias del menú: lo que requiere acción. */
dashboardRouter.get('/counts', async (_req, res) => {
  send(
    res,
    await one(`
      SELECT
        (SELECT count(*) FROM pedidos WHERE estado = 'pendiente') AS "pedidosPendientes",
        (SELECT count(*) FROM pedidos WHERE estado = 'pagado') AS "porEnviar",
        (SELECT count(*) FROM productos WHERE activo AND stock < 10) AS "stockBajo"`),
  );
});

dashboardRouter.get('/dashboard', async (req, res) => {
  const periodo = PERIODOS[queryStr(req, 'dias') || '30'];
  if (!periodo) throw HttpError.badRequest('Período no válido.');
  const { dias, grano } = periodo;

  // Inicio del período: medianoche (hora de Chile) de hace `dias - 1` días. El período anterior
  // tiene la misma duración y termina donde empieza este, para comparar.
  const LIMITES = `
    lim AS (
      SELECT date_trunc('day', now() AT TIME ZONE ${TZ}) - ($1::int - 1) * interval '1 day' AS inicio,
             date_trunc('day', now() AT TIME ZONE ${TZ}) AS hoy
    )`;

  const [kpis, serie, topProductos, porCategoria, atencion, stockCritico, ultimosPedidos] = await Promise.all([
    one(
      `WITH ${LIMITES},
       p AS (SELECT total, estado, creado_en AT TIME ZONE ${TZ} AS local FROM pedidos)
       SELECT
         coalesce(sum(total) FILTER (WHERE local >= inicio AND estado IN ${CONFIRMADOS}), 0) AS ventas,
         coalesce(sum(total) FILTER (WHERE local >= inicio - $1 * interval '1 day' AND local < inicio AND estado IN ${CONFIRMADOS}), 0) AS "ventasAnterior",
         count(*) FILTER (WHERE local >= inicio AND estado IN ${CONFIRMADOS}) AS confirmados,
         count(*) FILTER (WHERE local >= inicio - $1 * interval '1 day' AND local < inicio AND estado IN ${CONFIRMADOS}) AS "confirmadosAnterior",
         count(*) FILTER (WHERE local >= inicio AND estado <> 'cancelado') AS pedidos,
         count(*) FILTER (WHERE local >= inicio - $1 * interval '1 day' AND local < inicio AND estado <> 'cancelado') AS "pedidosAnterior",
         (SELECT count(*) FROM clientes, lim l WHERE creado_en AT TIME ZONE ${TZ} >= l.inicio) AS "clientesNuevos",
         (SELECT count(*) FROM clientes, lim l
           WHERE creado_en AT TIME ZONE ${TZ} >= l.inicio - $1 * interval '1 day' AND creado_en AT TIME ZONE ${TZ} < l.inicio) AS "clientesNuevosAnterior"
       FROM p, lim`,
      [dias],
    ),
    all(
      `WITH ${LIMITES},
       b AS (SELECT generate_series(date_trunc($2::text, inicio), date_trunc($2::text, hoy), ('1 ' || $2::text)::interval) AS bucket FROM lim),
       v AS (
         SELECT date_trunc($2::text, creado_en AT TIME ZONE ${TZ}) AS bucket,
                sum(total) FILTER (WHERE estado IN ${CONFIRMADOS}) AS ventas,
                count(*) FILTER (WHERE estado <> 'cancelado') AS pedidos
         FROM pedidos, lim
         WHERE creado_en AT TIME ZONE ${TZ} >= date_trunc($2::text, inicio)
         GROUP BY 1
       )
       SELECT to_char(b.bucket, 'YYYY-MM-DD') AS fecha, coalesce(v.ventas, 0) AS ventas, coalesce(v.pedidos, 0) AS pedidos
       FROM b LEFT JOIN v USING (bucket) ORDER BY b.bucket`,
      [dias, grano],
    ),
    all(
      `WITH ${LIMITES}
       SELECT i.producto_id AS id, max(i.nombre_producto) AS nombre,
              sum(i.cantidad) AS unidades, sum(i.cantidad * i.precio_unitario) AS ingresos
       FROM pedido_items i JOIN pedidos p ON p.id = i.pedido_id, lim
       WHERE p.estado IN ${CONFIRMADOS} AND p.creado_en AT TIME ZONE ${TZ} >= lim.inicio
       GROUP BY i.producto_id
       ORDER BY ingresos DESC, unidades DESC
       LIMIT 5`,
      [dias],
    ),
    all(
      `WITH ${LIMITES}
       SELECT coalesce(c.nombre, 'Sin categoría') AS categoria, sum(i.cantidad * i.precio_unitario) AS ingresos
       FROM pedido_items i
       JOIN pedidos p ON p.id = i.pedido_id
       LEFT JOIN productos pr ON pr.id = i.producto_id
       LEFT JOIN categorias c ON c.id = pr.categoria_id, lim
       WHERE p.estado IN ${CONFIRMADOS} AND p.creado_en AT TIME ZONE ${TZ} >= lim.inicio
       GROUP BY 1
       ORDER BY ingresos DESC`,
      [dias],
    ),
    one(`
      SELECT
        (SELECT count(*) FROM pedidos WHERE estado = 'pendiente') AS "pagosPorConfirmar",
        (SELECT coalesce(sum(total), 0) FROM pedidos WHERE estado = 'pendiente') AS "montoPorConfirmar",
        (SELECT count(*) FROM pedidos WHERE estado = 'pagado') AS "porEnviar",
        (SELECT count(*) FROM productos WHERE activo AND stock = 0) AS "sinStock",
        (SELECT count(*) FROM productos WHERE activo AND stock BETWEEN 1 AND 9) AS "stockBajo"`),
    all(`SELECT id, nombre, stock, imagen FROM productos WHERE activo AND stock < 10 ORDER BY stock, nombre LIMIT 8`),
    all(
      `SELECT p.id, p.total, p.estado, p.creado_en, p.metodo_pago, c.nombre AS cliente
       FROM pedidos p JOIN clientes c ON c.id = p.cliente_id
       ORDER BY p.creado_en DESC, p.id DESC LIMIT 6`,
    ),
  ]);

  send(res, {
    periodo: { dias, grano },
    kpis: {
      ventas: kpis!.ventas,
      ventasAnterior: kpis!.ventasAnterior,
      pedidos: kpis!.pedidos,
      pedidosAnterior: kpis!.pedidosAnterior,
      ticketPromedio: kpis!.confirmados ? Math.round(kpis!.ventas / kpis!.confirmados) : 0,
      ticketPromedioAnterior: kpis!.confirmadosAnterior ? Math.round(kpis!.ventasAnterior / kpis!.confirmadosAnterior) : 0,
      clientesNuevos: kpis!.clientesNuevos,
      clientesNuevosAnterior: kpis!.clientesNuevosAnterior,
    },
    serie,
    topProductos,
    porCategoria,
    atencion,
    stockCritico: stockCritico.map((p) => ({ ...p, imagen: imageUrl(p.imagen) })),
    ultimosPedidos: ultimosPedidos.map((p) => ({
      id: p.id,
      total: p.total,
      estado: p.estado,
      fecha: p.creado_en,
      metodoPago: p.metodo_pago,
      cliente: p.cliente,
    })),
  });
});
