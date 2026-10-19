import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, Clock, PackageX, Receipt, ShoppingBag, Truck, UserPlus, Wallet } from 'lucide-react';
import { api } from '../../lib/api';
import type { Dashboard, DashboardPeriod } from '../../lib/types';
import { formatDate, formatNumber, formatPrice, formatPriceCompact } from '../../lib/format';
import { onImageError, productImage } from '../../lib/assets';
import { AdminPageHeader } from '../../components/admin/AdminLayout';
import { ChartCard, ColumnChart, DataTableView, HBarList, StatTile, type ColumnDatum } from '../../components/admin/charts';
import { ErrorState, PageLoader, StatusBadge } from '../../components/ui';

const PERIODOS: { dias: DashboardPeriod; label: string; anterior: string }[] = [
  { dias: 7, label: '7 días', anterior: 'semana anterior' },
  { dias: 30, label: '30 días', anterior: 'período anterior' },
  { dias: 90, label: '90 días', anterior: 'trimestre anterior' },
  { dias: 365, label: '12 meses', anterior: 'año anterior' },
];

function parseDay(fecha: string) {
  const [y, m, d] = fecha.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toColumns(data: Dashboard): ColumnDatum[] {
  const { grano } = data.periodo;
  return data.serie.map((p) => {
    const date = parseDay(p.fecha);
    const label =
      grano === 'month'
        ? date.toLocaleDateString('es-CL', { month: 'short', year: '2-digit' })
        : date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
    const fullLabel =
      grano === 'month'
        ? date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
        : grano === 'week'
          ? `Semana del ${date.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}`
          : date.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
    return { label, fullLabel, value: p.ventas, detail: `${p.pedidos} pedido${p.pedidos === 1 ? '' : 's'}` };
  });
}

function AttentionCard({ to, icon, title, value, detail, tone }: { to: string; icon: ReactNode; title: string; value: number; detail: string; tone: 'warning' | 'info' | 'critical' }) {
  const tones = {
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
    critical: 'border-red-200 bg-red-50 text-red-800',
  };
  const idle = value === 0;
  return (
    <Link
      to={to}
      className={`group flex items-center gap-4 rounded-2xl border p-4 transition hover:shadow-md ${idle ? 'border-gray-200 bg-white text-gray-500' : tones[tone]}`}
    >
      <span className="shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{formatNumber(value)}</p>
        <p className="truncate text-xs">{idle ? 'Todo al día' : detail}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 opacity-0 transition group-hover:opacity-100" />
    </Link>
  );
}

export function DashboardPage() {
  const [dias, setDias] = useState<DashboardPeriod>(30);
  const periodo = PERIODOS.find((p) => p.dias === dias)!;
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'dashboard', dias],
    queryFn: () => api<Dashboard>(`/admin/dashboard?dias=${dias}`),
    // Al cambiar de período se mantiene el contenido anterior (atenuado) mientras carga.
    placeholderData: keepPreviousData,
  });

  const filtros = (
    <div role="group" aria-label="Período" className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
      {PERIODOS.map((p) => (
        <button
          key={p.dias}
          type="button"
          onClick={() => setDias(p.dias)}
          aria-pressed={p.dias === dias}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${p.dias === dias ? 'bg-lib-blue text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );

  if (isPending) return <PageLoader label="Cargando el resumen..." />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  const { kpis, atencion } = data;
  const columns = toColumns(data);

  return (
    <>
      <AdminPageHeader title="Dashboard" subtitle={`Resumen de los últimos ${periodo.label}`}>
        {filtros}
      </AdminPageHeader>

      <div className={`space-y-6 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
        <section aria-label="Indicadores" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile label="Ventas" value={formatPrice(kpis.ventas)} current={kpis.ventas} previous={kpis.ventasAnterior} icon={<Wallet className="h-5 w-5" />} periodLabel={periodo.anterior} />
          <StatTile label="Pedidos" value={formatNumber(kpis.pedidos)} current={kpis.pedidos} previous={kpis.pedidosAnterior} icon={<ShoppingBag className="h-5 w-5" />} periodLabel={periodo.anterior} />
          <StatTile
            label="Ticket promedio"
            value={formatPrice(kpis.ticketPromedio)}
            current={kpis.ticketPromedio}
            previous={kpis.ticketPromedioAnterior}
            icon={<Receipt className="h-5 w-5" />}
            periodLabel={periodo.anterior}
          />
          <StatTile
            label="Clientes nuevos"
            value={formatNumber(kpis.clientesNuevos)}
            current={kpis.clientesNuevos}
            previous={kpis.clientesNuevosAnterior}
            icon={<UserPlus className="h-5 w-5" />}
            periodLabel={periodo.anterior}
          />
        </section>
        <p className="-mt-3 text-xs text-gray-500">
          Ventas y ticket promedio consideran solo pedidos pagados, enviados o entregados. Pedidos excluye los cancelados.
        </p>

        <section aria-labelledby="atencion-titulo">
          <h2 id="atencion-titulo" className="mb-3 font-semibold text-gray-900">
            Requiere atención
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AttentionCard
              to="/admin/pedidos?estado=pendiente"
              icon={<Clock className="h-7 w-7" />}
              title="Pagos por confirmar"
              value={atencion.pagosPorConfirmar}
              detail={`${formatPrice(atencion.montoPorConfirmar)} en espera`}
              tone="warning"
            />
            <AttentionCard to="/admin/pedidos?estado=pagado" icon={<Truck className="h-7 w-7" />} title="Pedidos por enviar" value={atencion.porEnviar} detail="Pagados, listos para despachar" tone="info" />
            <AttentionCard to="/admin/productos?stock=agotado" icon={<PackageX className="h-7 w-7" />} title="Productos agotados" value={atencion.sinStock} detail="Activos sin unidades" tone="critical" />
            <AttentionCard to="/admin/productos?stock=bajo" icon={<AlertTriangle className="h-7 w-7" />} title="Stock bajo" value={atencion.stockBajo} detail="Menos de 10 unidades" tone="warning" />
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <ChartCard
              title="Ventas"
              subtitle={`${formatPrice(kpis.ventas)} en los últimos ${periodo.label} · ${data.periodo.grano === 'month' ? 'por mes' : data.periodo.grano === 'week' ? 'por semana' : 'por día'}`}
              table={<DataTableView headers={['Período', 'Ventas', 'Pedidos']} rows={data.serie.map((p, i) => [columns[i].fullLabel, formatPrice(p.ventas), p.pedidos])} />}
            >
              <ColumnChart data={columns} formatValue={formatPrice} formatAxis={formatPriceCompact} ariaLabel={`Ventas de los últimos ${periodo.label}`} />
            </ChartCard>
          </div>
          <ChartCard
            title="Ventas por categoría"
            subtitle="Ingresos del período"
            table={<DataTableView headers={['Categoría', 'Ingresos']} rows={data.porCategoria.map((c) => [c.categoria, formatPrice(c.ingresos)])} />}
          >
            <HBarList items={data.porCategoria.map((c) => ({ label: c.categoria, value: c.ingresos }))} formatValue={formatPriceCompact} empty="Aún no hay ventas en este período." />
          </ChartCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard
            title="Productos más vendidos"
            subtitle="Por ingresos del período"
            table={<DataTableView headers={['Producto', 'Unidades', 'Ingresos']} rows={data.topProductos.map((p) => [p.nombre, p.unidades, formatPrice(p.ingresos)])} />}
          >
            <HBarList
              items={data.topProductos.map((p) => ({ label: p.nombre, value: p.ingresos, detail: `${p.unidades} unidad${p.unidades === 1 ? '' : 'es'}` }))}
              formatValue={formatPriceCompact}
              empty="Aún no hay ventas en este período."
            />
          </ChartCard>

          <section className="card p-5" aria-labelledby="stock-titulo">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 id="stock-titulo" className="font-semibold text-gray-900">
                  Stock crítico
                </h2>
                <p className="text-sm text-gray-500">Productos activos con menos de 10 unidades</p>
              </div>
              <Link to="/admin/productos?stock=bajo" className="text-sm font-medium text-lib-blue hover:underline">
                Ver todos
              </Link>
            </div>
            {data.stockCritico.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-500">Todos los productos tienen stock suficiente.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {data.stockCritico.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 py-2">
                    <img src={productImage(p.imagen)} onError={onImageError} alt="" className="h-10 w-10 rounded-lg border bg-white object-contain p-0.5" />
                    <span className="min-w-0 flex-1 truncate text-sm text-gray-800">{p.nombre}</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}
                    >
                      {p.stock === 0 ? <PackageX className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                      {p.stock === 0 ? 'Agotado' : `${p.stock} u.`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section className="card overflow-hidden" aria-labelledby="ultimos-titulo">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 id="ultimos-titulo" className="font-semibold text-gray-900">
              Últimos pedidos
            </h2>
            <Link to="/admin/pedidos" className="text-sm font-medium text-lib-blue hover:underline">
              Ver todos
            </Link>
          </div>
          {data.ultimosPedidos.length === 0 ? (
            <p className="px-5 pb-8 text-center text-sm text-gray-500">Aún no hay pedidos.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs text-gray-600 uppercase">
                  <tr>
                    <th className="px-5 py-2">Pedido</th>
                    <th className="px-5 py-2">Cliente</th>
                    <th className="px-5 py-2">Fecha</th>
                    <th className="px-5 py-2">Estado</th>
                    <th className="px-5 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.ultimosPedidos.map((o) => (
                    <tr key={o.id} className="hover:bg-blue-50/40">
                      <td className="px-5 py-2.5">
                        <Link to={`/admin/pedidos?ver=${o.id}`} className="font-semibold text-lib-blue hover:underline">
                          #{o.id}
                        </Link>
                      </td>
                      <td className="px-5 py-2.5">{o.cliente}</td>
                      <td className="px-5 py-2.5 whitespace-nowrap text-gray-600">{formatDate(o.fecha, true)}</td>
                      <td className="px-5 py-2.5">
                        <StatusBadge status={o.estado} />
                      </td>
                      <td className="px-5 py-2.5 text-right font-semibold tabular-nums">{formatPrice(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
