import { z } from 'zod';

export const CreateSppTagihanSchema = z.object({
  siswaId: z.string().uuid(),
  bulan: z.number().int().min(1).max(12),
  tahun: z.number().int().min(2020).max(2100),
  jumlah: z.number().positive('Jumlah harus lebih dari 0'),
  jatuhTempo: z.string().date().optional(),
  status: z.enum(['lunas', 'belum', 'dispensasi']).default('belum'),
});

export const CreateSppPembayaranSchema = z.object({
  tagihanId: z.string().uuid(),
  tanggalBayar: z.string().date(),
  jumlah: z.number().positive(),
  metode: z.enum(['tunai', 'transfer', 'qris', 'lainnya']).optional(),
  buktiUrl: z.string().url().optional(),
  keterangan: z.string().optional(),
});

export const CreateBukuKasSchema = z.object({
  tanggal: z.string().date(),
  tipe: z.enum(['masuk', 'keluar']),
  kategori: z.string().max(50).optional(),
  jumlah: z.number().positive(),
  keterangan: z.string().optional(),
});

export type CreateSppTagihanInput = z.infer<typeof CreateSppTagihanSchema>;
export type CreateSppPembayaranInput = z.infer<typeof CreateSppPembayaranSchema>;
export type CreateBukuKasInput = z.infer<typeof CreateBukuKasSchema>;
