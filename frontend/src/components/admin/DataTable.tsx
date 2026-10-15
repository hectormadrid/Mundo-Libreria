import { useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from 'lucide-react';

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  /** Valor para ordenar; si se omite, la columna no es ordenable. */
  sortValue?: (row: T) => string | number | null;
  className?: string;
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string | number;
  /** Texto en el que busca el filtro. */
  searchText: (row: T) => string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  toolbar?: ReactNode;
}

const PAGE_SIZES = [10, 25, 50];

function normalize(text: string) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Tabla con búsqueda, orden por columna y paginación en el navegador. */
export function DataTable<T>({ rows, columns, rowKey, searchText, searchPlaceholder = 'Buscar...', emptyMessage = 'No hay registros.', toolbar }: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ index: number; dir: 1 | -1 } | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    let result = q ? rows.filter((row) => normalize(searchText(row)).includes(q)) : rows;
    if (sort) {
      const getValue = columns[sort.index].sortValue!;
      result = [...result].sort((a, b) => {
        const va = getValue(a) ?? '';
        const vb = getValue(b) ?? '';
        if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * sort.dir;
        return String(va).localeCompare(String(vb), 'es', { numeric: true }) * sort.dir;
      });
    }
    return result;
  }, [rows, query, sort, columns, searchText]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * pageSize, current * pageSize);

  const toggleSort = (index: number) => {
    setSort((s) => (s?.index === index ? (s.dir === 1 ? { index, dir: -1 } : null) : { index, dir: 1 }));
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            className="input pl-9"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            aria-label="Buscar en la tabla"
          />
        </div>
        {toolbar}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold tracking-wide text-gray-600 uppercase">
            <tr>
              {columns.map((col, i) => (
                <th key={col.header} className={`px-4 py-3 whitespace-nowrap ${col.className ?? ''}`} aria-sort={sort?.index === i ? (sort.dir === 1 ? 'ascending' : 'descending') : undefined}>
                  {col.sortValue ? (
                    <button type="button" onClick={() => toggleSort(i)} className="inline-flex items-center gap-1 uppercase hover:text-lib-blue">
                      {col.header}
                      {sort?.index === i && (sort.dir === 1 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visible.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-500">
                  {query ? 'Ningún registro coincide con la búsqueda.' : emptyMessage}
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr key={rowKey(row)} className="hover:bg-blue-50/40">
                  {columns.map((col) => (
                    <td key={col.header} className={`px-4 py-3 align-middle ${col.className ?? ''}`}>
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 p-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>Mostrar</span>
          <select
            className="rounded border border-gray-300 px-2 py-1"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            aria-label="Registros por página"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>
            · {filtered.length} registro{filtered.length === 1 ? '' : 's'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="rounded border p-1.5 disabled:opacity-40" onClick={() => setPage(current - 1)} disabled={current <= 1} aria-label="Página anterior">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span>
            Página {current} de {pages}
          </span>
          <button type="button" className="rounded border p-1.5 disabled:opacity-40" onClick={() => setPage(current + 1)} disabled={current >= pages} aria-label="Página siguiente">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
