'use client';
import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Users, GraduationCap, Calendar, Wallet, TrendingUp, TrendingDown, PiggyBank, AlertCircle, Loader2 } from 'lucide-react';

const GET_SUMMARY = gql`query DashboardSummary { dashboardSummary { totalSiswa totalPelatih totalJadwal totalTagihanBelum totalPemasukan totalPengeluaran saldoKas totalTabungan siswaAktif siswaAlumni } }`;

interface Summary { totalSiswa: number; totalPelatih: number; totalJadwal: number; totalTagihanBelum: number; totalPemasukan: number; totalPengeluaran: number; saldoKas: number; totalTabungan: number; siswaAktif: number; siswaAlumni: number; }

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function DashboardPage() {
  const { data, loading, error } = useQuery<{ dashboardSummary: Summary }>(GET_SUMMARY, { fetchPolicy: 'cache-and-network' });
  const s = data?.dashboardSummary;

  if (loading && !data) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
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
    </div>
  );
}
