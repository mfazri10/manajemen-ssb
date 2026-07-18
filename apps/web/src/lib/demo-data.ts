export interface DemoSiswa {
  id: string;
  namaLengkap: string;
  tanggalLahir: string;
  kelompokUmur: string;
  noHpOrangTua: string;
  status: string;
}

export interface DemoJadwal {
  id: string;
  hari: string;
  waktuMulai: string;
  waktuSelesai: string;
  lokasi: string;
  materi?: string;
}

export interface DemoSPP {
  id: string;
  namaSiswa: string;
  bulan: string;
  jumlah: number;
  status: 'lunas' | 'belum';
}

export interface DemoLapangan {
  id: string;
  nama: string;
  tipe: string;
  hargaPerJam: number;
  status: string;
}

export interface DemoBooking {
  id: string;
  lapangan: string;
  namaPemesan: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  totalHarga: number;
  status: string;
}

export interface DemoMember {
  id: string;
  noMember: string;
  namaLengkap: string;
  noHp: string;
  paket: string;
  status: string;
}

export interface DemoKelas {
  id: string;
  nama: string;
  instruktur: string;
  jam: string;
  hari: string;
}

export function getDemoData(productType: string) {
  const type = productType.toLowerCase();

  if (type === 'gor' || type.startsWith('venue_') || ['futsal', 'badminton'].includes(type)) {
    // GOR / Venue Booking dummy data
    const lapangans: DemoLapangan[] = [
      { id: 'l1', nama: 'Lapangan Futsal A (Vinyl)', tipe: 'Futsal', hargaPerJam: 120000, status: 'aktif' },
      { id: 'l2', nama: 'Lapangan Futsal B (Sintetis)', tipe: 'Futsal', hargaPerJam: 100000, status: 'aktif' },
      { id: 'l3', nama: 'Lapangan Badminton 1', tipe: 'Badminton', hargaPerJam: 50000, status: 'aktif' },
    ];

    const bookings: DemoBooking[] = [
      { id: 'b1', lapangan: 'Lapangan Futsal A (Vinyl)', namaPemesan: 'Rian Hidayat', tanggal: '2026-07-19', jamMulai: '15:00', jamSelesai: '17:00', totalHarga: 240000, status: 'konfirmasi' },
      { id: 'b2', lapangan: 'Lapangan Badminton 1', namaPemesan: 'Irfan Hakim', tanggal: '2026-07-19', jamMulai: '19:00', jamSelesai: '21:00', totalHarga: 100000, status: 'konfirmasi' },
      { id: 'b3', lapangan: 'Lapangan Futsal B (Sintetis)', namaPemesan: 'Budi Santoso', tanggal: '2026-07-20', jamMulai: '16:00', jamSelesai: '18:00', totalHarga: 200000, status: 'pending' },
    ];

    return { lapangans, bookings, members: [], kelases: [], siswas: [], jadwals: [], spps: [] };
  }

  if (['gym', 'fitness', 'yoga', 'pilates', 'crossfit', 'zumba', 'muaythai_mma', 'dance_studio', 'functional', 'senam_aerobik', 'calisthenics', 'renang_dewasa'].includes(type)) {
    // Gym / Studio Membership dummy data
    const members: DemoMember[] = [
      { id: 'm1', noMember: 'GYM-0091', namaLengkap: 'Denny Sumargo', noHp: '0812998811', paket: '1 Bulan (Regular)', status: 'aktif' },
      { id: 'm2', noMember: 'GYM-0092', namaLengkap: 'Agnes Monica', noHp: '0812776655', paket: '3 Bulan (VIP)', status: 'aktif' },
      { id: 'm3', noMember: 'GYM-0093', namaLengkap: 'Deddy Corbuzier', noHp: '0812554433', paket: '1 Tahun (Platinum)', status: 'aktif' },
    ];

    const kelases: DemoKelas[] = [
      { id: 'k1', nama: 'Vinyasa Flow Yoga', instruktur: 'Susi Yoga', jam: '08:00 - 09:30', hari: 'Senin' },
      { id: 'k2', nama: 'Weight Training Basics', instruktur: 'Coach Ade', jam: '16:00 - 17:00', hari: 'Rabu' },
      { id: 'k3', nama: 'Muay Thai Beginner', instruktur: 'Kru Jack', jam: '19:00 - 20:30', hari: 'Jumat' },
    ];

    return { members, kelases, lapangans: [], bookings: [], siswas: [], jadwals: [], spps: [] };
  }

  // Default: Akademi / Sekolah Olahraga (SSB)
  const siswas: DemoSiswa[] = [
    { id: 's1', namaLengkap: 'Bagas Adi Nugroho', tanggalLahir: '2014-04-12', kelompokUmur: 'U-12', noHpOrangTua: '08123456789', status: 'aktif' },
    { id: 's2', namaLengkap: 'Ronaldo Junior', tanggalLahir: '2016-09-08', kelompokUmur: 'U-10', noHpOrangTua: '08129988776', status: 'aktif' },
    { id: 's3', namaLengkap: 'Lionel Budi', tanggalLahir: '2012-01-20', kelompokUmur: 'U-14', noHpOrangTua: '08124433221', status: 'aktif' },
  ];

  const jadwals: DemoJadwal[] = [
    { id: 'j1', hari: 'Senin', waktuMulai: '15:30', waktuSelesai: '17:30', lokasi: 'Lapangan Utama A', materi: 'Passing & Control dasar' },
    { id: 'j2', hari: 'Kamis', waktuMulai: '15:30', waktuSelesai: '17:30', lokasi: 'Lapangan Utama A', materi: 'Shooting & Finishing' },
    { id: 'j3', hari: 'Sabtu', waktuMulai: '08:00', waktuSelesai: '10:00', lokasi: 'Lapangan B', materi: 'Internal Sparring' },
  ];

  const spps: DemoSPP[] = [
    { id: 'sp1', namaSiswa: 'Bagas Adi Nugroho', bulan: 'Juli 2026', jumlah: 150000, status: 'lunas' },
    { id: 'sp2', namaSiswa: 'Ronaldo Junior', bulan: 'Juli 2026', jumlah: 150000, status: 'belum' },
    { id: 'sp3', namaSiswa: 'Lionel Budi', bulan: 'Juli 2026', jumlah: 150000, status: 'lunas' },
  ];

  return { siswas, jadwals, spps, lapangans: [], bookings: [], members: [], kelases: [] };
}
