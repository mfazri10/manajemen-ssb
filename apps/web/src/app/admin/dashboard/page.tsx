'use client';
import React, { useMemo } from 'react';
import { useQuery, gql } from '@apollo/client';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import {
  Users, GraduationCap, Calendar, Wallet, TrendingUp, TrendingDown, PiggyBank,
  AlertCircle, MapPin, Clock,
} from 'lucide-react';
import { PageLoader } from '@/components/page-states';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';

const GET_SUMMARY = gql`query DashboardSummary { dashboardSummary { totalSiswa totalPelatih totalJadwal totalTagihanBelum totalPemasukan totalPengeluaran saldoKas totalTabungan siswaAktif siswaAlumni } }`;
const GET_ABSENSI = gql`query DashboardAbsensi { absensi { id tanggal status } }`;
const GET_JADWAL = gql`query DashboardJadwal { jadwalLatihan { id tanggal hari waktuMulai lokasi materi status } }`;

interface Summary { totalSiswa: number; totalPelatih: number; totalJadwal: number; totalTagihanBelum: number; totalPemasukan: number; totalPengeluaran: number; saldoKas: number; totalTabungan: number; siswaAktif: number; siswaAlumni: number; }
interface AbsensiItem { id: string; tanggal: string; status: string; }
interface JadwalItem { id: string; tanggal?: string; hari?: string; waktuMulai?: string; lokasi?: string; materi?: string; status: string; }

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
const fmtShort = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString('id', { maximumFractionDigits: 1 })} jt`;
  if (n >= 1_000) return `${(n / 1_000).toLocaleString('id', { maximumFractionDigits: 0 })} rb`;
  return String(n);
};

const STATUS_COLORS: Record<string, string> = {
  hadir: 'var(--chart-1)',
  izin: 'var(--chart-2)',
  sakit: 'var(--chart-3)',
  alpha: 'var(--chart-4)',
};

export default function DashboardPage() {
  const { data, loading, error } = useQuery<{ dashboardSummary: Summary }>(GET_SUMMARY, { fetchPolicy: 'cache-and-network' });
  const { data: absensiData } = useQuery<{ absensi: AbsensiItem[] }>(GET_ABSENSI, { fetchPolicy: 'cache-and-network' });
  const { data: jadwalData } = useQuery<{ jadwalLatihan: JadwalItem[] }>(GET_JADWAL, { fetchPolicy: 'cache-and-network' });
  const s = data?.dashboardSummary;

  // Agregasi absensi per status (donut)
  const absensiByStatus = useMemo(() => {
    const list = absensiData?.absensi || [];
    const counts: Record<string, number> = {};
    list.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });
    return Object.entries(counts).map(([status, value]) => ({ status, value }));
  }, [absensiData]);

  // Tren kehadiran per tanggal (line) — persentase hadir
  const trendKehadiran = useMemo(() => {
    const list = absensiData?.absensi || [];
    const byDate: Record<string, { total: number; hadir: number }> = {};
    list.forEach(a => {
      const key = a.tanggal;
      if (!byDate[key]) byDate[key] = { total: 0, hadir: 0 };
      byDate[key]!.total += 1;
      if (a.status === 'hadir') byDate[key]!.hadir += 1;
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([tanggal, v]) => ({
        tanggal: format(new Date(tanggal), 'dd/MM', { locale: localeID }),
        persen: v.total ? Math.round((v.hadir / v.total) * 100) : 0,
      }));
  }, [absensiData]);

  const keuanganData = useMemo(() => ([
    { nama: 'Pemasukan', nilai: s?.totalPemasukan ?? 0 },
    { nama: 'Pengeluaran', nilai: s?.totalPengeluaran ?? 0 },
    { nama: 'Saldo Kas', nilai: s?.saldoKas ?? 0 },
    { nama: 'Tabungan', nilai: s?.totalTabungan ?? 0 },
  ]), [s]);

  // Jadwal hari ini
  const jadwalHariIni = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return (jadwalData?.jadwalLatihan || []).filter(j => j.tanggal === today).slice(0, 5);
  }, [jadwalData]);

  if (loading && !data) return <PageLoader />;
  if (error) return <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs"><AlertCircle className="w-4 h-4" /><span className="font-bold">{error.message}</span></div>;

  const cards = [
    { label: 'Total Siswa', value: String(s?.totalSiswa ?? 0), icon: Users, sub: `${s?.siswaAktif ?? 0} aktif · ${s?.siswaAlumni ?? 0} alumni`, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { label: 'Total Pelatih', value: String(s?.totalPelatih ?? 0), icon: GraduationCap, color: 'text-green-600', bg: 'bg-green-500/10' },
    { label: 'Jadwal Latihan', value: String(s?.totalJadwal ?? 0), icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-500/10' },
    { label: 'Tagihan Belum Lunas', value: String(s?.totalTagihanBelum ?? 0), icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-500/10' },
    { label: 'Pemasukan', value: fmt(s?.totalPemasukan ?? 0), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { label: 'Pengeluaran', value: fmt(s?.totalPengeluaran ?? 0), icon: TrendingDown, color: 'text-orange-600', bg: 'bg-orange-500/10' },
    { label: 'Saldo Kas', value: fmt(s?.saldoKas ?? 0), icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
    { label: 'Total Tabungan', value: fmt(s?.totalTabungan ?? 0), icon: PiggyBank, color: 'text-pink-600', bg: 'bg-pink-500/10' },
  ];

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight">Dashboard</h2>
        <p className="text-xs text-muted-foreground font-medium">Ringkasan data akademi Anda.</p>
      </div>

      {/* Kartu ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-xl shadow-2xs hover:shadow-md transition-shadow p-5">
            <div className="flex items-center justify-between pb-2">
              <span className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">{c.label}</span>
              <div className={`p-2 rounded-lg ${c.bg}`}><c.icon className={`w-4 h-4 ${c.color}`} /></div>
            </div>
            <div className="text-xl font-black text-foreground">{c.value}</div>
            {c.sub && <p className="text-5xs text-muted-foreground font-medium mt-1">{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* Baris grafik: keuangan + kehadiran */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl shadow-2xs p-5">
          <h3 className="font-black text-sm text-foreground mb-4">Arus Keuangan</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={keuanganData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="nama" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => fmtShort(Number(v))} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={50} />
                <Tooltip formatter={(v) => fmt(Number(v))} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
                <Bar dataKey="nilai" radius={[6, 6, 0, 0]}>
                  {keuanganData.map((_, i) => {
                    const fill = 'var(--chart-' + ((i % 5) + 1) + ')';
                    return <Cell key={i} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-2xs p-5">
          <h3 className="font-black text-sm text-foreground mb-4">Tren Kehadiran (%)</h3>
          {trendKehadiran.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-2xs text-muted-foreground font-semibold">Belum ada data absensi.</div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendKehadiran} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="tanggal" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Kehadiran']} />
                  <Line type="monotone" dataKey="persen" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Baris bawah: donut absensi + jadwal hari ini */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl shadow-2xs p-5">
          <h3 className="font-black text-sm text-foreground mb-4">Komposisi Absensi</h3>
          {absensiByStatus.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-2xs text-muted-foreground font-semibold">Belum ada data absensi.</div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={absensiByStatus} dataKey="value" nameKey="status" innerRadius={55} outerRadius={80} paddingAngle={3}>
                    {absensiByStatus.map((entry, i) => {
                      const fill = STATUS_COLORS[entry.status] || ('var(--chart-' + ((i % 5) + 1) + ')');
                      return <Cell key={i} fill={fill} />;
                    })}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11, textTransform: 'capitalize' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl shadow-2xs p-5">
          <h3 className="font-black text-sm text-foreground mb-4">Jadwal Hari Ini</h3>
          {jadwalHariIni.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-2xs text-muted-foreground font-semibold">Tidak ada jadwal latihan hari ini.</div>
          ) : (
            <div className="space-y-2.5">
              {jadwalHariIni.map(j => (
                <div key={j.id} className="p-3 bg-background border border-border rounded-xl flex items-start gap-3">
                  <span className="p-2 bg-primary/10 text-primary rounded-lg mt-0.5"><Clock className="w-4 h-4" /></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-2xs font-bold text-foreground truncate">{j.materi || 'Latihan'}</p>
                    <p className="text-4xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0" /> {j.lokasi || '-'} · {j.waktuMulai || '-'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
