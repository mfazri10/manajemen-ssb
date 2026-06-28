import { pgSchema, uuid, varchar, date, integer, decimal, timestamp, boolean, time, text, unique } from 'drizzle-orm/pg-core';
import { users } from './public';

export const getTenantSchema = (slug: string) => {
  const tenant = pgSchema(`tenant_${slug}`);

  // Master Data
  const kelompokUmur = tenant.table('kelompok_umur', {
    id: uuid('id').primaryKey().defaultRandom(),
    nama: varchar('nama', { length: 30 }).notNull(),
    usiaMin: integer('usia_min'),
    usiaMax: integer('usia_max'),
    createdAt: timestamp('created_at').defaultNow(),
  });

  const masterPosisi = tenant.table('master_posisi', {
    id: uuid('id').primaryKey().defaultRandom(),
    kode: varchar('kode', { length: 10 }).notNull(),
    nama: varchar('nama', { length: 50 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  });

  const masterPelanggaran = tenant.table('master_pelanggaran', {
    id: uuid('id').primaryKey().defaultRandom(),
    nama: varchar('nama', { length: 100 }).notNull(),
    poin: integer('poin').default(0),
    createdAt: timestamp('created_at').defaultNow(),
  });

  // Siswa & Orang Tua
  const siswa = tenant.table('siswa', {
    id: uuid('id').primaryKey().defaultRandom(),
    kelompokUmurId: uuid('kelompok_umur_id').references(() => kelompokUmur.id, { onDelete: 'set null' }),
    nisn: varchar('nisn', { length: 20 }),
    nik: varchar('nik', { length: 20 }),
    namaLengkap: varchar('nama_lengkap', { length: 100 }).notNull(),
    namaPanggilan: varchar('nama_panggilan', { length: 50 }),
    tempatLahir: varchar('tempat_lahir', { length: 50 }),
    tanggalLahir: date('tanggal_lahir').notNull(),
    jenisKelamin: varchar('jenis_kelamin', { length: 1 }), // 'L' atau 'P'
    agama: varchar('agama', { length: 20 }),
    posisiId: uuid('posisi_id').references(() => masterPosisi.id, { onDelete: 'set null' }),
    tinggiBadan: decimal('tinggi_badan', { precision: 5, scale: 1 }),
    beratBadan: decimal('berat_badan', { precision: 5, scale: 1 }),
    fotoUrl: text('foto_url'),
    status: varchar('status', { length: 20 }).default('pending'), // 'aktif', 'alumni', 'nonaktif', 'pending'
    klubSebelumnya: varchar('klub_sebelumnya', { length: 100 }),
    provinsi: varchar('provinsi', { length: 50 }),
    kabupaten: varchar('kabupaten', { length: 50 }),
    kecamatan: varchar('kecamatan', { length: 50 }),
    desa: varchar('desa', { length: 50 }),
    alamatLengkap: text('alamat_lengkap'),
    catatan: text('catatan'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  });

  const orangTua = tenant.table('orang_tua', {
    id: uuid('id').primaryKey().defaultRandom(),
    siswaId: uuid('siswa_id').unique().notNull().references(() => siswa.id, { onDelete: 'cascade' }),
    namaOrangTua: varchar('nama_orang_tua', { length: 100 }).notNull(),
    hpOrangTua: varchar('hp_orang_tua', { length: 20 }).notNull(),
    hpAyah: varchar('hp_ayah', { length: 20 }),
    hpIbu: varchar('hp_ibu', { length: 20 }),
    email: varchar('email', { length: 100 }),
    hubungan: varchar('hubungan', { length: 30 }),
    createdAt: timestamp('created_at').defaultNow(),
  });

  const dokumenSiswa = tenant.table('dokumen_siswa', {
    id: uuid('id').primaryKey().defaultRandom(),
    siswaId: uuid('siswa_id').notNull().references(() => siswa.id, { onDelete: 'cascade' }),
    jenis: varchar('jenis', { length: 20 }).notNull(), // 'akta', 'kk', 'nisn', 'kartu_pelajar', 'raport'
    fileUrl: text('file_url').notNull(),
    namaFile: varchar('nama_file', { length: 255 }),
    uploadedAt: timestamp('uploaded_at').defaultNow(),
  });

  // Pelatih
  const pelatih = tenant.table('pelatih', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }), // link ke public.users
    namaLengkap: varchar('nama_lengkap', { length: 100 }).notNull(),
    noHp: varchar('no_hp', { length: 20 }),
    email: varchar('email', { length: 100 }),
    tempatLahir: varchar('tempat_lahir', { length: 50 }),
    tanggalLahir: date('tanggal_lahir'),
    fotoUrl: text('foto_url'),
    status: varchar('status', { length: 20 }).default('aktif'), // 'aktif', 'nonaktif'
    provinsi: varchar('provinsi', { length: 50 }),
    kabupaten: varchar('kabupaten', { length: 50 }),
    kecamatan: varchar('kecamatan', { length: 50 }),
    desa: varchar('desa', { length: 50 }),
    catatan: text('catatan'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  });

  const pelatihLisensi = tenant.table('pelatih_lisensi', {
    id: uuid('id').primaryKey().defaultRandom(),
    pelatihId: uuid('pelatih_id').notNull().references(() => pelatih.id, { onDelete: 'cascade' }),
    lisensi: varchar('lisensi', { length: 20 }).notNull(), // 'd_nasional', 'c_afc', 'b_afc', 'a_afc', 'pro_afc', 'fisik', 'kiper', 'futsal', 'lainnya'
    lisensiLainnya: varchar('lisensi_lainnya', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow(),
  });

  const pelatihJabatan = tenant.table('pelatih_jabatan', {
    id: uuid('id').primaryKey().defaultRandom(),
    pelatihId: uuid('pelatih_id').notNull().references(() => pelatih.id, { onDelete: 'cascade' }),
    kelompokUmurId: uuid('kelompok_umur_id').references(() => kelompokUmur.id, { onDelete: 'set null' }),
    jabatan: varchar('jabatan', { length: 30 }).notNull(), // 'pelatih_ku', 'pelatih_kiper', 'pelatih_fisik', 'asisten', 'kepala_pelatih', 'koordinator'
    createdAt: timestamp('created_at').defaultNow(),
  });

  // Jadwal & Absensi
  const jadwalLatihan = tenant.table('jadwal_latihan', {
    id: uuid('id').primaryKey().defaultRandom(),
    kelompokUmurId: uuid('kelompok_umur_id').references(() => kelompokUmur.id, { onDelete: 'set null' }),
    hari: varchar('hari', { length: 10 }), // 'senin','selasa',...
    waktuMulai: time('waktu_mulai'),
    waktuSelesai: time('waktu_selesai'),
    lokasi: varchar('lokasi', { length: 200 }),
    materi: text('materi'),
    tanggal: date('tanggal'),
    status: varchar('status', { length: 20 }).default('aktif'), // 'aktif', 'batal', 'selesai'
    createdAt: timestamp('created_at').defaultNow(),
  });

  const absensi = tenant.table('absensi', {
    id: uuid('id').primaryKey().defaultRandom(),
    jadwalId: uuid('jadwal_id').notNull().references(() => jadwalLatihan.id, { onDelete: 'cascade' }),
    siswaId: uuid('siswa_id').notNull().references(() => siswa.id, { onDelete: 'cascade' }),
    tanggal: date('tanggal').notNull(),
    status: varchar('status', { length: 10 }).notNull(), // 'hadir', 'izin', 'sakit', 'alpha'
    keterangan: text('keterangan'),
    createdAt: timestamp('created_at').defaultNow(),
  }, (t) => [
    unique().on(t.jadwalId, t.siswaId, t.tanggal)
  ]);

  // Keuangan
  const sppTagihan = tenant.table('spp_tagihan', {
    id: uuid('id').primaryKey().defaultRandom(),
    siswaId: uuid('siswa_id').notNull().references(() => siswa.id, { onDelete: 'cascade' }),
    bulan: integer('bulan').notNull(),
    tahun: integer('tahun').notNull(),
    jumlah: decimal('jumlah', { precision: 12, scale: 2 }).notNull(),
    status: varchar('status', { length: 20 }).default('belum'), // 'lunas', 'belum', 'dispensasi'
    jatuhTempo: date('jatuh_tempo'),
    createdAt: timestamp('created_at').defaultNow(),
  }, (t) => [
    unique().on(t.siswaId, t.bulan, t.tahun)
  ]);

  const sppPembayaran = tenant.table('spp_pembayaran', {
    id: uuid('id').primaryKey().defaultRandom(),
    tagihanId: uuid('tagihan_id').notNull().references(() => sppTagihan.id, { onDelete: 'cascade' }),
    tanggalBayar: date('tanggal_bayar').notNull(),
    jumlah: decimal('jumlah', { precision: 12, scale: 2 }).notNull(),
    metode: varchar('metode', { length: 20 }), // 'tunai', 'transfer', 'qris', 'lainnya'
    buktiUrl: text('bukti_url'),
    keterangan: text('keterangan'),
    createdAt: timestamp('created_at').defaultNow(),
  });

  const bukuKas = tenant.table('buku_kas', {
    id: uuid('id').primaryKey().defaultRandom(),
    tanggal: date('tanggal').notNull(),
    tipe: varchar('tipe', { length: 10 }).notNull(), // 'masuk', 'keluar'
    kategori: varchar('kategori', { length: 50 }),
    jumlah: decimal('jumlah', { precision: 12, scale: 2 }).notNull(),
    keterangan: text('keterangan'),
    createdAt: timestamp('created_at').defaultNow(),
  });

  const tabungan = tenant.table('tabungan', {
    id: uuid('id').primaryKey().defaultRandom(),
    siswaId: uuid('siswa_id').notNull().references(() => siswa.id, { onDelete: 'cascade' }),
    tanggal: date('tanggal').notNull(),
    tipe: varchar('tipe', { length: 10 }).notNull(), // 'simpan', 'tarik'
    jumlah: decimal('jumlah', { precision: 12, scale: 2 }).notNull(),
    keterangan: text('keterangan'),
    createdAt: timestamp('created_at').defaultNow(),
  });

  // Evaluasi & Penilaian
  const tesFisik = tenant.table('tes_fisik', {
    id: uuid('id').primaryKey().defaultRandom(),
    siswaId: uuid('siswa_id').notNull().references(() => siswa.id, { onDelete: 'cascade' }),
    kelompokUmurId: uuid('kelompok_umur_id').references(() => kelompokUmur.id, { onDelete: 'set null' }),
    tanggal: date('tanggal').notNull(),
    jenisTes: varchar('jenis_tes', { length: 50 }).notNull(),
    nilai: decimal('nilai', { precision: 8, scale: 2 }).notNull(),
    satuan: varchar('satuan', { length: 20 }),
    catatan: text('catatan'),
    createdAt: timestamp('created_at').defaultNow(),
  });

  const evaluasi = tenant.table('evaluasi', {
    id: uuid('id').primaryKey().defaultRandom(),
    siswaId: uuid('siswa_id').notNull().references(() => siswa.id, { onDelete: 'cascade' }),
    pelatihId: uuid('pelatih_id').references(() => pelatih.id, { onDelete: 'set null' }),
    semester: varchar('semester', { length: 10 }).notNull(),
    tahunAjaran: varchar('tahun_ajaran', { length: 10 }).notNull(),
    teknik: integer('teknik'),
    fisik: integer('fisik'),
    taktik: integer('taktik'),
    mental: integer('mental'),
    catatanPelatih: text('catatan_pelatih'),
    createdAt: timestamp('created_at').defaultNow(),
  }, (t) => [
    unique().on(t.siswaId, t.semester, t.tahunAjaran)
  ]);

  const seleksi = tenant.table('seleksi', {
    id: uuid('id').primaryKey().defaultRandom(),
    nama: varchar('nama', { length: 100 }).notNull(),
    tanggal: date('tanggal'),
    lokasi: varchar('lokasi', { length: 200 }),
    keterangan: text('keterangan'),
    createdAt: timestamp('created_at').defaultNow(),
  });

  const seleksiPeserta = tenant.table('seleksi_peserta', {
    id: uuid('id').primaryKey().defaultRandom(),
    seleksiId: uuid('seleksi_id').notNull().references(() => /**** */ seleksi.id, { onDelete: 'cascade' }),
    siswaId: uuid('siswa_id').notNull().references(() => siswa.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 20 }).default('daftar'), // 'daftar', 'lulus', 'tidak_lulus'
    nilai: decimal('nilai', { precision: 5, scale: 2 }),
    catatan: text('catatan'),
    createdAt: timestamp('created_at').defaultNow(),
  }, (t) => [
    unique().on(t.seleksiId, t.siswaId)
  ]);

  const pelanggaran = tenant.table('pelanggaran', {
    id: uuid('id').primaryKey().defaultRandom(),
    siswaId: uuid('siswa_id').notNull().references(() => siswa.id, { onDelete: 'cascade' }),
    masterPelanggaranId: uuid('master_pelanggaran_id').references(() => masterPelanggaran.id, { onDelete: 'set null' }),
    tanggal: date('tanggal').notNull(),
    keterangan: text('keterangan'),
    createdAt: timestamp('created_at').defaultNow(),
  });

  // Komunikasi
  const pengumuman = tenant.table('pengumuman', {
    id: uuid('id').primaryKey().defaultRandom(),
    judul: varchar('judul', { length: 200 }).notNull(),
    isi: text('isi').notNull(),
    target: varchar('target', { length: 20 }).default('semua'), // 'semua', 'siswa', 'orang_tua', 'pelatih'
    kelompokUmurId: uuid('kelompok_umur_id').references(() => kelompokUmur.id, { onDelete: 'set null' }),
    tanggal: date('tanggal'),
    createdAt: timestamp('created_at').defaultNow(),
  });

  const notifikasi = tenant.table('notifikasi', {
    id: uuid('id').primaryKey().defaultRandom(),
    penerimaUserId: text('penerima_user_id'), // ref ke public.users.id
    judul: varchar('judul', { length: 200 }).notNull(),
    isi: text('isi').notNull(),
    tipe: varchar('tipe', { length: 20 }).default('info'), // 'info', 'pengumuman', 'spp', 'jadwal', 'absensi', 'turnamen'
    target: varchar('target', { length: 20 }).default('semua'), // 'semua', 'siswa', 'orang_tua', 'pelatih', 'per_siswa'
    siswaId: uuid('siswa_id').references(() => siswa.id, { onDelete: 'cascade' }),
    isRead: boolean('is_read').default(false),
    sentVia: varchar('sent_via', { length: 20 }).default('in_app'), // 'in_app', 'push', 'wa', 'email'
    createdAt: timestamp('created_at').defaultNow(),
  });

  // Turnamen & Pertandingan
  const turnamen = tenant.table('turnamen', {
    id: uuid('id').primaryKey().defaultRandom(),
    nama: varchar('nama', { length: 200 }).notNull(),
    tanggalMulai: date('tanggal_mulai'),
    tanggalSelesai: date('tanggal_selesai'),
    lokasi: varchar('lokasi', { length: 200 }),
    kategoriUmur: varchar('kategori_umur', { length: 30 }),
    hasil: text('hasil'),
    createdAt: timestamp('created_at').defaultNow(),
  });

  const turnamenPeserta = tenant.table('turnamen_peserta', {
    id: uuid('id').primaryKey().defaultRandom(),
    turnamenId: uuid('turnamen_id').notNull().references(() => turnamen.id, { onDelete: 'cascade' }),
    siswaId: uuid('siswa_id').notNull().references(() => siswa.id, { onDelete: 'cascade' }),
    posisi: varchar('posisi', { length: 20 }),
    gol: integer('gol').default(0),
    kartuKuning: integer('kartu_kuning').default(0),
    kartuMerah: integer('kartu_merah').default(0),
    menitBermain: integer('menit_bermain'),
    catatan: text('catatan'),
    createdAt: timestamp('created_at').defaultNow(),
  }, (t) => [
    unique().on(t.turnamenId, t.siswaId)
  ]);

  const match = tenant.table('match', {
    id: uuid('id').primaryKey().defaultRandom(),
    turnamenId: uuid('turnamen_id').notNull().references(() => turnamen.id, { onDelete: 'cascade' }),
    babak: varchar('babak', { length: 30 }).default('penyisihan'), // 'penyisihan', 'perempat_final', ...
    matchNo: integer('match_no'),
    tanggal: date('tanggal'),
    waktu: time('waktu'),
    lokasi: varchar('lokasi', { length: 200 }),
    timHome: varchar('tim_home', { length: 100 }),
    timAway: varchar('tim_away', { length: 100 }),
    skorHome: integer('skor_home').default(0),
    skorAway: integer('skor_away').default(0),
    status: varchar('status', { length: 20 }).default('belum'), // 'belum', 'berlangsung', 'selesai', 'batal'
    catatan: text('catatan'),
    createdAt: timestamp('created_at').defaultNow(),
  });

  const matchLineup = tenant.table('match_lineup', {
    id: uuid('id').primaryKey().defaultRandom(),
    matchId: uuid('match_id').notNull().references(() => match.id, { onDelete: 'cascade' }),
    siswaId: uuid('siswa_id').notNull().references(() => siswa.id, { onDelete: 'cascade' }),
    tim: varchar('tim', { length: 10 }), // 'home', 'away'
    posisi: varchar('posisi', { length: 20 }),
    status: varchar('status', { length: 20 }).default('starter'), // 'starter', 'cadangan', 'masuk', 'keluar'
    menitMasuk: integer('menit_masuk'),
    menitKeluar: integer('menit_keluar'),
    createdAt: timestamp('created_at').defaultNow(),
  }, (t) => [
    unique().on(t.matchId, t.siswaId, t.tim)
  ]);

  const matchEvent = tenant.table('match_event', {
    id: uuid('id').primaryKey().defaultRandom(),
    matchId: uuid('match_id').notNull().references(() => match.id, { onDelete: 'cascade' }),
    siswaId: uuid('siswa_id').references(() => siswa.id, { onDelete: 'set null' }),
    tipe: varchar('tipe', { length: 20 }).notNull(), // 'gol', 'assist', 'kartu_kuning', 'kartu_merah', 'substitusi', 'own_goal'
    menit: integer('menit'),
    keterangan: text('keterangan'),
    createdAt: timestamp('created_at').defaultNow(),
  });

  // Kurikulum & Materi
  const materiKategori = tenant.table('materi_kategori', {
    id: uuid('id').primaryKey().defaultRandom(),
    nama: varchar('nama', { length: 100 }).notNull(),
    urutan: integer('urutan').default(0),
    createdAt: timestamp('created_at').defaultNow(),
  });

  const materiLatihan = tenant.table('materi_latihan', {
    id: uuid('id').primaryKey().defaultRandom(),
    kategoriId: uuid('kategori_id').references(() => materiKategori.id, { onDelete: 'set null' }),
    kelompokUmurId: uuid('kelompok_umur_id').references(() => kelompokUmur.id, { onDelete: 'set null' }),
    judul: varchar('judul', { length: 200 }).notNull(),
    deskripsi: text('deskripsi'),
    durasiMenit: integer('durasi_menit'),
    level: varchar('level', { length: 20 }).default('pemula'), // 'pemula', 'menengah', 'lanjutan'
    tipe: varchar('tipe', { length: 20 }).default('teknik'), // 'teknik', 'fisik', 'taktik', 'mental', 'permainan'
    instruksi: text('instruksi'),
    createdAt: timestamp('created_at').defaultNow(),
  });

  const logPelatih = tenant.table('log_pelatih', {
    id: uuid('id').primaryKey().defaultRandom(),
    pelatihId: uuid('pelatih_id').notNull().references(() => pelatih.id, { onDelete: 'cascade' }),
    jadwalId: uuid('jadwal_id').references(() => jadwalLatihan.id, { onDelete: 'set null' }),
    tanggal: date('tanggal').notNull(),
    kegiatan: varchar('kegiatan', { length: 200 }).notNull(),
    materiId: uuid('materi_id').references(() => materiLatihan.id, { onDelete: 'set null' }),
    catatan: text('catatan'),
    durasiMenit: integer('durasi_menit'),
    createdAt: timestamp('created_at').defaultNow(),
  });

  // Inventaris
  const inventaris = tenant.table('inventaris', {
    id: uuid('id').primaryKey().defaultRandom(),
    nama: varchar('nama', { length: 100 }).notNull(),
    kategori: varchar('kategori', { length: 50 }), // 'jersey','bola','cone','rompi','gawang','medis','lainnya'
    jumlah: integer('jumlah').default(0).notNull(),
    satuan: varchar('satuan', { length: 20 }).default('pcs'),
    kondisi: varchar('kondisi', { length: 20 }).default('baik'), // 'baik','rusak_ringan','rusak_berat'
    keterangan: text('keterangan'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  });

  const inventarisDistribusi = tenant.table('inventaris_distribusi', {
    id: uuid('id').primaryKey().defaultRandom(),
    inventarisId: uuid('inventaris_id').notNull().references(() => inventaris.id, { onDelete: 'cascade' }),
    siswaId: uuid('siswa_id').references(() => siswa.id, { onDelete: 'set null' }),
    jumlah: integer('jumlah').default(1).notNull(),
    tanggal: date('tanggal').defaultNow().notNull(),
    status: varchar('status', { length: 20 }).default('dipinjam'), // 'dipinjam','dikembalikan','hilang','milik'
    keterangan: text('keterangan'),
    createdAt: timestamp('created_at').defaultNow(),
  });

  const inventarisMutasi = tenant.table('inventaris_mutasi', {
    id: uuid('id').primaryKey().defaultRandom(),
    inventarisId: uuid('inventaris_id').notNull().references(() => inventaris.id, { onDelete: 'cascade' }),
    tipe: varchar('tipe', { length: 10 }).notNull(), // 'masuk','keluar'
    jumlah: integer('jumlah').notNull(),
    tanggal: date('tanggal').defaultNow().notNull(),
    keterangan: text('keterangan'),
    createdAt: timestamp('created_at').defaultNow(),
  });

  return {
    kelompokUmur,
    masterPosisi,
    masterPelanggaran,
    siswa,
    orangTua,
    dokumenSiswa,
    pelatih,
    pelatihLisensi,
    pelatihJabatan,
    jadwalLatihan,
    absensi,
    sppTagihan,
    sppPembayaran,
    bukuKas,
    tabungan,
    tesFisik,
    evaluasi,
    seleksi,
    seleksiPeserta,
    pelanggaran,
    pengumuman,
    notifikasi,
    turnamen,
    turnamenPeserta,
    match,
    matchLineup,
    matchEvent,
    materiKategori,
    materiLatihan,
    logPelatih,
    inventaris,
    inventarisDistribusi,
    inventarisMutasi,
  };
};
