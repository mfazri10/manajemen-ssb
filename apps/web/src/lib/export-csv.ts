/**
 * Utilitas export CSV sisi klien (tanpa dependensi tambahan).
 * Menambahkan BOM UTF-8 agar karakter tampil benar di Excel.
 */

export interface CsvColumn {
  key: string;
  header: string;
}

function escapeCell(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value);
  if (/[",\n;]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Buat dan unduh file CSV dari data baris.
 * @param filename nama file (tanpa .csv)
 * @param rows data mentah
 * @param columns daftar kolom (key + header). Bila dikosongkan, kunci baris pertama dipakai.
 */
export function exportToCsv(filename: string, rows: Record<string, unknown>[], columns?: CsvColumn[]) {
  if (!rows.length) return;

  const cols: CsvColumn[] =
    columns && columns.length > 0
      ? columns
      : Object.keys(rows[0]!).map((k) => ({ key: k, header: k }));

  const headerLine = cols.map((c) => escapeCell(c.header)).join(',');
  const dataLines = rows.map((row) => cols.map((c) => escapeCell(row[c.key])).join(','));
  const csv = '﻿' + [headerLine, ...dataLines].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
