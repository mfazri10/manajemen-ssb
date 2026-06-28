/**
 * Hitung usia dari tanggal lahir
 * Platform-agnostic — bisa dipakai di web, api, dan mobile
 */
export function calculateAge(tanggalLahir: string): {
  years: number;
  months: number;
  label: string;
} {
  const dob = new Date(tanggalLahir);
  const today = new Date();
  const diffMs = today.getTime() - dob.getTime();
  const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
  const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
  const label = years < 1 ? `${months} bulan` : `${years} tahun`;
  return { years, months, label };
}

/**
 * Tentukan kelompok umur berdasarkan tanggal lahir
 * Contoh: "U-12", "U-15"
 */
export function getKelompokUmur(tanggalLahir: string): string {
  const { years } = calculateAge(tanggalLahir);
  const ku = Math.ceil(years / 2) * 2;
  const clamped = Math.min(Math.max(ku, 6), 18);
  return `U-${clamped}`;
}

/**
 * Format tanggal ke format Indonesia
 * @example formatTanggal("2010-05-12") => "12 Mei 2010"
 */
export function formatTanggal(
  tanggal: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = typeof tanggal === 'string' ? new Date(tanggal) : tanggal;
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  });
}

/**
 * Format tanggal singkat
 * @example formatTanggalSingkat("2010-05-12") => "12/05/2010"
 */
export function formatTanggalSingkat(tanggal: string | Date): string {
  const date = typeof tanggal === 'string' ? new Date(tanggal) : tanggal;
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Cek apakah tanggal sudah lewat
 */
export function isOverdue(tanggal: string): boolean {
  return new Date(tanggal) < new Date();
}

/**
 * Format waktu (HH:MM)
 */
export function formatWaktu(waktu: string): string {
  const [jam, menit] = waktu.split(':');
  return `${jam}:${menit ?? '00'}`;
}
