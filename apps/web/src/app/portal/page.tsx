'use client';

import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Loader2, AlertCircle, User, Calendar, CheckCircle, Wallet, FileText } from 'lucide-react';

const GET_PORTAL_ANAK = gql`query PortalAnak { portalAnak { id namaLengkap tanggalLahir jenisKelamin kelompokUmurNama posisiNama status fotoUrl } }`;
const GET_PORTAL_JADWAL = gql`query PortalJadwal { portalJadwal { id hari waktu lokasi namaKelompok } }`;
const GET_PORTAL_ABSENSI = gql`query PortalAbsensi { portalAbsensi { id tanggal status keterangan } }`;
const GET_PORTAL_SPP = gql`query PortalSpp { portalSpp { id bulan jumlah status tanggalBayar } }`;
const GET_PORTAL_RAPOR = gql`query PortalRapor { portalRapor { id semester nilai teknik fisik mental catatan } }`;

interface AnakData { id: string; namaLengkap: string; tanggalLahir: string; jenisKelamin: string; kelompokUmurNama: string; posisiNama: string; status: string; fotoUrl?: string; }
interface JadwalData { id: string; hari: string; waktu: string; lokasi: string; namaKelompok: string; }
interface AbsensiData { id: string; tanggal: string; status: string; keterangan?: string; }
interface SppData { id: string; bulan: string; jumlah: number; status: string; tanggalBayar?: string; }
interface RaporData { id: string; semester: string; nilai: number; teknik: number; fisik: number; mental: number; catatan?: string; }

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const tabs = [
  { key: 'info', label: 'Info Anak', icon: User },
  { key: 'jadwal', label: 'Jadwal', icon: Calendar },
  { key: 'absensi', label: 'Absensi', icon: CheckCircle },
  { key: 'spp', label: 'SPP', icon: Wallet },
  { key: 'rapor', label: 'Rapor', icon: FileText },
];

export default function PortalPage() {
  const [activeTab, setActiveTab] = useState('info');

  const { data: anakData, loading: anakLoading, error: anakError } = useQuery<{ portalAnak: AnakData[] }>(GET_PORTAL_ANAK, { fetchPolicy: 'cache-and-network' });
  const { data: jadwalData, loading: jadwalLoading } = useQuery<{ portalJadwal: JadwalData[] }>(GET_PORTAL_JADWAL, { skip: activeTab !== 'jadwal' });
  const { data: absensiData, loading: absensiLoading } = useQuery<{ portalAbsensi: AbsensiData[] }>(GET_PORTAL_ABSENSI, { skip: activeTab !== 'absensi' });
  const { data: sppData, loading: sppLoading } = useQuery<{ portalSpp: SppData[] }>(GET_PORTAL_SPP, { skip: activeTab !== 'spp' });
  const { data: raporData, loading: raporLoading } = useQuery<{ portalRapor: RaporData[] }>(GET_PORTAL_RAPOR, { skip: activeTab !== 'rapor' });

  const anak = anakData?.portalAnak?.[0];

  if (anakLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (anakError) return <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs"><AlertCircle className="w-4 h-4" /><span className="font-bold">{anakError.message}</span></div>;

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight">Portal Orang Tua</h2>
        <p className="text-xs text-muted-foreground font-medium">Informasi lengkap putra/putri Anda di akademi.</p>
      </div>

      {/* Child info card */}
      {anak && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-2xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
            {anak.fotoUrl ? <img src={anak.fotoUrl} alt={anak.namaLengkap} className="w-full h-full object-cover" /> : <span className="text-lg font-black text-primary">{anak.namaLengkap.charAt(0)}</span>}
          </div>
          <div>
            <h3 className="text-lg font-black text-foreground">{anak.namaLengkap}</h3>
            <p className="text-xs text-muted-foreground font-medium">{anak.kelompokUmurNama} · {anak.posisiNama} · <span className={`font-bold ${anak.status === 'aktif' ? 'text-green-600' : 'text-amber-600'}`}>{anak.status}</span></p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-2xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              <Icon className="w-3.5 h-3.5" /><span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-2xs min-h-[200px]">
        {activeTab === 'info' && anak && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><span className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Nama Lengkap</span><p className="text-sm font-bold text-foreground">{anak.namaLengkap}</p></div>
            <div className="space-y-1"><span className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tanggal Lahir</span><p className="text-sm font-bold text-foreground">{anak.tanggalLahir}</p></div>
            <div className="space-y-1"><span className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Jenis Kelamin</span><p className="text-sm font-bold text-foreground">{anak.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p></div>
            <div className="space-y-1"><span className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Kelompok Umur</span><p className="text-sm font-bold text-foreground">{anak.kelompokUmurNama}</p></div>
            <div className="space-y-1"><span className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Posisi</span><p className="text-sm font-bold text-foreground">{anak.posisiNama}</p></div>
            <div className="space-y-1"><span className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Status</span><p className="text-sm font-bold text-foreground">{anak.status}</p></div>
          </div>
        )}

        {activeTab === 'jadwal' && (
          jadwalLoading ? <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div> :
          (jadwalData?.portalJadwal?.length ?? 0) === 0 ? <p className="text-xs text-muted-foreground text-center py-8">Belum ada jadwal.</p> :
          <div className="space-y-2">
            {jadwalData!.portalJadwal.map(j => (
              <div key={j.id} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                <div><p className="text-xs font-bold text-foreground">{j.namaKelompok}</p><p className="text-5xs text-muted-foreground">{j.lokasi}</p></div>
                <div className="text-right"><p className="text-xs font-bold text-primary">{j.hari}</p><p className="text-5xs text-muted-foreground">{j.waktu}</p></div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'absensi' && (
          absensiLoading ? <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div> :
          (absensiData?.portalAbsensi?.length ?? 0) === 0 ? <p className="text-xs text-muted-foreground text-center py-8">Belum ada data absensi.</p> :
          <div className="space-y-2">
            {absensiData!.portalAbsensi.map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                <p className="text-xs font-bold text-foreground">{a.tanggal}</p>
                <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${a.status === 'hadir' ? 'bg-green-500/10 text-green-600' : a.status === 'izin' ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'}`}>{a.status}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'spp' && (
          sppLoading ? <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div> :
          (sppData?.portalSpp?.length ?? 0) === 0 ? <p className="text-xs text-muted-foreground text-center py-8">Belum ada tagihan SPP.</p> :
          <div className="space-y-2">
            {sppData!.portalSpp.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                <div><p className="text-xs font-bold text-foreground">{s.bulan}</p><p className="text-5xs text-muted-foreground">{fmt(s.jumlah)}</p></div>
                <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${s.status === 'lunas' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>{s.status}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'rapor' && (
          raporLoading ? <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div> :
          (raporData?.portalRapor?.length ?? 0) === 0 ? <p className="text-xs text-muted-foreground text-center py-8">Belum ada data rapor.</p> :
          <div className="space-y-3">
            {raporData!.portalRapor.map(r => (
              <div key={r.id} className="p-4 bg-background border border-border rounded-lg space-y-2">
                <div className="flex items-center justify-between"><p className="text-sm font-bold text-foreground">Semester {r.semester}</p><p className="text-sm font-black text-primary">{r.nilai}</p></div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center"><span className="text-5xs text-muted-foreground block">Teknik</span><span className="text-xs font-bold">{r.teknik}</span></div>
                  <div className="text-center"><span className="text-5xs text-muted-foreground block">Fisik</span><span className="text-xs font-bold">{r.fisik}</span></div>
                  <div className="text-center"><span className="text-5xs text-muted-foreground block">Mental</span><span className="text-xs font-bold">{r.mental}</span></div>
                </div>
                {r.catatan && <p className="text-xs text-muted-foreground">{r.catatan}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
