import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, BarChart3, Minus, Table2 } from 'lucide-react';

/*
 * Gráficos del panel, en SVG/HTML propio (sin librerías):
 * - marcas delgadas (barras de máx. 24px, punta redondeada de 4px y base recta),
 * - grilla y ejes en líneas finas y discretas,
 * - un solo color de serie (azul de la marca, validado contra el fondo blanco),
 * - textos siempre en tinta gris/negra, nunca del color de la serie,
 * - detalle al pasar el cursor o con el teclado, y vista de tabla como alternativa accesible.
 */
const SERIES = '#3182ce';
const SERIES_HOVER = '#2563a8';
const GRID = '#e5e7eb';
const AXIS_TEXT = '#6b7280';

// ------------------------------------------------------------------ Stat tile

export function StatTile({
  label,
  value,
  current,
  previous,
  icon,
  periodLabel,
}: {
  label: string;
  value: string;
  current: number;
  previous: number;
  icon: ReactNode;
  periodLabel: string;
}) {
  let delta: ReactNode;
  if (previous === 0 && current === 0) {
    delta = (
      <span className="inline-flex items-center gap-1 text-gray-500">
        <Minus className="h-4 w-4" /> Sin movimiento
      </span>
    );
  } else if (previous === 0) {
    delta = <span className="text-gray-500">Sin datos del {periodLabel} para comparar</span>;
  } else {
    const pct = ((current - previous) / previous) * 100;
    const up = pct >= 0;
    delta = (
      <span className={`inline-flex items-center gap-1 font-semibold ${up ? 'text-green-700' : 'text-red-700'}`}>
        {up ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        {up ? '+' : ''}
        {pct.toLocaleString('es-CL', { maximumFractionDigits: 1 })}%
        <span className="font-normal text-gray-500">vs {periodLabel}</span>
      </span>
    );
  }

  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <span className="rounded-lg bg-blue-50 p-2 text-lib-blue">{icon}</span>
      </div>
      <p className="text-3xl font-semibold text-gray-900">{value}</p>
      <p className="mt-2 text-sm">{delta}</p>
    </div>
  );
}

// ------------------------------------------------------------------ Chart card

export function ChartCard({
  title,
  subtitle,
  table,
  children,
}: {
  title: string;
  subtitle?: string;
  /** Vista de tabla equivalente (alternativa accesible al gráfico). */
  table?: ReactNode;
  children: ReactNode;
}) {
  const [showTable, setShowTable] = useState(false);
  return (
    <figure className="card p-5">
      <figcaption className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {table && (
          <button
            type="button"
            onClick={() => setShowTable(!showTable)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            aria-pressed={showTable}
          >
            {showTable ? <BarChart3 className="h-3.5 w-3.5" /> : <Table2 className="h-3.5 w-3.5" />}
            {showTable ? 'Ver gráfico' : 'Ver tabla'}
          </button>
        )}
      </figcaption>
      {showTable && table ? table : children}
    </figure>
  );
}

export function DataTableView({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <div className="max-h-72 overflow-auto rounded-lg border border-gray-100">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 bg-gray-50 text-left text-xs text-gray-600 uppercase">
          <tr>
            {headers.map((h, i) => (
              <th key={h} className={`px-3 py-2 ${i > 0 ? 'text-right' : ''}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 tabular-nums">
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, i) => (
                <td key={i} className={`px-3 py-1.5 ${i > 0 ? 'text-right' : ''}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ------------------------------------------------------------------ Columnas (serie temporal)

function niceMax(value: number): number {
  if (value <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(value)));
  const n = value / exp;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return nice * exp;
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

export interface ColumnDatum {
  /** Etiqueta corta del eje (p. ej. "15 oct"). */
  label: string;
  /** Etiqueta completa para el detalle (p. ej. "miércoles 15 de octubre"). */
  fullLabel: string;
  value: number;
  /** Línea secundaria del detalle (p. ej. "3 pedidos"). */
  detail?: string;
}

export function ColumnChart({ data, formatValue, formatAxis, ariaLabel }: { data: ColumnDatum[]; formatValue: (v: number) => string; formatAxis: (v: number) => string; ariaLabel: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const tooltipId = useId();

  const PLOT_H = 200;
  const AXIS_H = 28;
  const LEFT = 56;
  const RIGHT = 8;
  const TOP = 8;

  const max = useMemo(() => niceMax(Math.max(0, ...data.map((d) => d.value))), [data]);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const plotW = Math.max(0, width - LEFT - RIGHT);
  const slot = data.length ? plotW / data.length : 0;
  const barW = Math.max(2, Math.min(24, slot * 0.6));
  const y = (v: number) => TOP + PLOT_H - (v / max) * PLOT_H;
  // Mostrar como máximo ~8 etiquetas en el eje X para que no se encimen.
  const labelEvery = Math.max(1, Math.ceil(data.length / Math.max(1, Math.floor(plotW / 64))));

  const activeDatum = active !== null ? data[active] : null;
  const tipLeft = active !== null ? Math.min(Math.max(LEFT + slot * active + slot / 2, 90), width - 90) : 0;

  return (
    <div ref={ref} className="relative" onMouseLeave={() => setActive(null)}>
      {width > 0 && (
        <svg width={width} height={TOP + PLOT_H + AXIS_H} role="img" aria-label={ariaLabel} className="block overflow-visible">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={LEFT} x2={width - RIGHT} y1={y(t)} y2={y(t)} stroke={t === 0 ? '#d1d5db' : GRID} strokeWidth={1} shapeRendering="crispEdges" />
              <text x={LEFT - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill={AXIS_TEXT} className="tabular-nums">
                {formatAxis(t)}
              </text>
            </g>
          ))}

          {data.map((d, i) => {
            const x = LEFT + slot * i + (slot - barW) / 2;
            const h = Math.max(0, TOP + PLOT_H - y(d.value));
            const r = Math.min(4, barW / 2, h);
            const isActive = active === i;
            return (
              <g key={i}>
                {h > 0 && (
                  // Punta redondeada (4px) y base recta, apoyada en la línea base.
                  <path
                    d={`M${x},${TOP + PLOT_H} V${y(d.value) + r} Q${x},${y(d.value)} ${x + r},${y(d.value)} H${x + barW - r} Q${x + barW},${y(d.value)} ${x + barW},${y(d.value) + r} V${TOP + PLOT_H} Z`}
                    fill={isActive ? SERIES_HOVER : SERIES}
                  />
                )}
                {i % labelEvery === 0 && (
                  <text x={LEFT + slot * i + slot / 2} y={TOP + PLOT_H + 18} textAnchor="middle" fontSize={11} fill={AXIS_TEXT}>
                    {d.label}
                  </text>
                )}
                {/* Zona de detección: toda la columna, más grande que la barra. */}
                <rect
                  x={LEFT + slot * i}
                  y={TOP}
                  width={slot}
                  height={PLOT_H}
                  fill="transparent"
                  tabIndex={0}
                  role="button"
                  aria-label={`${d.fullLabel}: ${formatValue(d.value)}${d.detail ? `, ${d.detail}` : ''}`}
                  aria-describedby={isActive ? tooltipId : undefined}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className="cursor-default outline-none focus-visible:fill-blue-100/40"
                />
              </g>
            );
          })}
        </svg>
      )}

      {activeDatum && (
        <div
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-lg"
          style={{ left: tipLeft }}
        >
          <p className="font-semibold text-gray-900">{formatValue(activeDatum.value)}</p>
          {activeDatum.detail && <p className="text-gray-600">{activeDatum.detail}</p>}
          <p className="text-xs text-gray-500">{activeDatum.fullLabel}</p>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ Barras horizontales (ranking)

export function HBarList({ items, formatValue, empty }: { items: { label: string; value: number; detail?: string }[]; formatValue: (v: number) => string; empty: string }) {
  if (!items.length) return <p className="py-10 text-center text-sm text-gray-500">{empty}</p>;
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-gray-800" title={item.label}>
              {item.label}
            </span>
            {item.detail && <span className="shrink-0 text-xs text-gray-500">{item.detail}</span>}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 flex-1 overflow-hidden rounded-r bg-gray-100">
              <div className="h-full rounded-r" style={{ width: `${(item.value / max) * 100}%`, background: SERIES }} />
            </div>
            {/* Valor en la punta, en tinta de texto (no del color de la serie). */}
            <span className="w-20 shrink-0 text-right text-sm font-semibold text-gray-900 tabular-nums">{formatValue(item.value)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
