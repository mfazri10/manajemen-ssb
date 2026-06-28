import { z } from 'zod';

export const CreatePelatihSchema = z.object({
  namaLengkap: z.string().min(2).max(100),
  noHp: z.string().max(20).optional(),
  email: z.string().email().optional(),
  tempatLahir: z.string().max(50).optional(),
  tanggalLahir: z.string().date().optional(),
  status: z.enum(['aktif', 'nonaktif']).default('aktif'),
  provinsi: z.string().max(50).optional(),
  kabupaten: z.string().max(50).optional(),
  kecamatan: z.string().max(50).optional(),
  desa: z.string().max(50).optional(),
  catatan: z.string().optional(),
});

export const UpdatePelatihSchema = CreatePelatihSchema.partial();

export const CreatePelatihLisensiSchema = z.object({
  lisensi: z.enum(['d_nasional', 'c_afc', 'b_afc', 'a_afc', 'pro_afc', 'fisik', 'kiper', 'futsal', 'lainnya']),
  lisensiLainnya: z.string().max(100).optional(),
});

export type CreatePelatihInput = z.infer<typeof CreatePelatihSchema>;
export type UpdatePelatihInput = z.infer<typeof UpdatePelatihSchema>;
export type CreatePelatihLisensiInput = z.infer<typeof CreatePelatihLisensiSchema>;
