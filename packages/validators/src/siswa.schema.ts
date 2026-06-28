import { z } from 'zod';

export const CreateSiswaSchema = z.object({
  namaLengkap: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  namaPanggilan: z.string().max(50).optional(),
  tanggalLahir: z.string().date('Format tanggal tidak valid (YYYY-MM-DD)'),
  tempatLahir: z.string().max(50).optional(),
  jenisKelamin: z.enum(['L', 'P']).optional(),
  agama: z.string().max(20).optional(),
  nisn: z.string().max(20).optional(),
  nik: z.string().max(20).optional(),
  posisiId: z.string().uuid().optional(),
  kelompokUmurId: z.string().uuid().optional(),
  tinggiBadan: z.number().positive().optional(),
  beratBadan: z.number().positive().optional(),
  status: z.enum(['aktif', 'alumni', 'nonaktif', 'pending']).default('pending'),
  klubSebelumnya: z.string().max(100).optional(),
  provinsi: z.string().max(50).optional(),
  kabupaten: z.string().max(50).optional(),
  kecamatan: z.string().max(50).optional(),
  desa: z.string().max(50).optional(),
  alamatLengkap: z.string().optional(),
  catatan: z.string().optional(),
});

export const UpdateSiswaSchema = CreateSiswaSchema.partial();

export const CreateOrangTuaSchema = z.object({
  namaOrangTua: z.string().min(2).max(100),
  hpOrangTua: z.string().min(10).max(20),
  hpAyah: z.string().max(20).optional(),
  hpIbu: z.string().max(20).optional(),
  email: z.string().email().optional(),
  hubungan: z.string().max(30).optional(),
});

export type CreateSiswaInput = z.infer<typeof CreateSiswaSchema>;
export type UpdateSiswaInput = z.infer<typeof UpdateSiswaSchema>;
export type CreateOrangTuaInput = z.infer<typeof CreateOrangTuaSchema>;
