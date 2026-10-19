/**
 * Descarga una tabla como CSV para abrir en Excel.
 * Usa ";" como separador y BOM UTF-8, que es lo que Excel en español (Chile) espera
 * para separar columnas y mostrar bien los acentos.
 */
export function downloadCsv<T>(fileName: string, rows: T[], columns: { header: string; value: (row: T) => string | number | null | undefined }[]) {
  const escape = (value: string | number | null | undefined) => {
    let text = value === null || value === undefined ? '' : String(value);
    // Evita que Excel interprete el texto como fórmula (inyección de fórmulas en CSV).
    if (/^[=+\-@\t\r]/.test(text) && typeof value !== 'number') text = `'${text}`;
    return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const lines = [columns.map((c) => escape(c.header)).join(';'), ...rows.map((row) => columns.map((c) => escape(c.value(row))).join(';'))];
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Fecha en formato de planilla (2026-10-19 14:05). */
export function csvDate(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
