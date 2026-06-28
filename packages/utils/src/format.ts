/**
 * Format angka ke format Rupiah
 * @example formatRupiah(150000) => "Rp150.000"
 */
export function formatRupiah(amount: number, short = false): string {
  if (short && amount >= 1_000_000) {
    return `Rp${(amount / 1_000_000).toFixed(1)}jt`;
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format nomor HP Indonesia (tambahkan +62 jika perlu)
 * @example formatHP("08123456789") => "+6281234567890"
 */
export function formatHP(hp: string): string {
  const cleaned = hp.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    return '+62' + cleaned.slice(1);
  }
  if (cleaned.startsWith('62')) {
    return '+' + cleaned;
  }
  return '+62' + cleaned;
}

/**
 * Singkat nama panjang
 * @example singkatNama("Muhammad Rizki Fauzan") => "M. Rizki Fauzan"
 */
export function singkatNama(nama: string): string {
  const parts = nama.trim().split(' ');
  if (parts.length <= 2) return nama;
  return parts[0]!.charAt(0) + '. ' + parts.slice(1).join(' ');
}

/**
 * Generate inisial untuk avatar
 * @example getInisial("Rizki Fauzan") => "RF"
 */
export function getInisial(nama: string): string {
  return nama
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join('');
}

/**
 * Format nama bulan Indonesia
 */
export const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
] as const;

export function getNamaBulan(bulan: number): string {
  return NAMA_BULAN[bulan - 1] ?? '-';
}
