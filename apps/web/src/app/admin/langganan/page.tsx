'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, AlertCircle, CreditCard, Check } from 'lucide-react';
import { toast } from 'sonner';

const GET_PAKET = gql`query PaketLangganan { paketLangganan { id nama harga durasiBulan maxSiswa maxPelatih fitur aktif } }`;
const GET_LANGGANAN = gql`query LanggananAkademi($id: ID!) { langgananAkademi(akademiId: $id) { id paketId tanggalMulai tanggalBerakhir status } }`;
const SUBSCRIBE = gql`mutation SubscribePaket($akademiId: ID!, $paketId: ID!) { subscribePaket(akademiId: $akademiId, paketId: $paketId) { id status } }`;

interface PaketData { id: string; nama: string; harga: number; durasiBulan: number; maxSiswa: number; maxPelatih: number; fitur: string; aktif: boolean; }
interface LanggananData { id: string; paketId: string; tanggalMulai: string; tanggalBerakhir: string; status: string; }

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const paketColors: Record<string, { bg: string; border: string; badge: string }> = {
  free: { bg: 'bg-gray-500/5', border: 'border-gray-500/20', badge: 'bg-gray-500/10 text-gray-600' },
  starter: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', badge: 'bg-blue-500/10 text-blue-600' },
  growth: { bg: 'bg-green-500/5', border: 'border-green-500/20', badge: 'bg-green-500/10 text-green-600' },
  pro: { bg: 'bg-purple-500/5', border: 'border-purple-500/20', badge: 'bg-purple-500/10 text-purple-600' },
};

export default function LanggananPage() {
  const { data: paketData, loading: paketLoading, error: paketError } = useQuery<{ paketLangganan: PaketData[] }>(GET_PAKET, { fetchPolicy: 'cache-and-network' });
  const { data: langgananData, loading: langgananLoading } = useQuery<{ langgananAkademi: LanggananData[] }>(GET_LANGGANAN, { variables: { id: 'current' }, fetchPolicy: 'cache-and-network' });
  const [subscribePaket] = useMutation(SUBSCRIBE);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPaket, setSelectedPaket] = useState<PaketData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const currentLangganan = langgananData?.langgananAkademi?.[0];
  const paketList = paketData?.paketLangganan || [];

  const handleSubscribe = async () => {
    if (!selectedPaket) return;
    setSubmitting(true);
    try {
      await subscribePaket({ variables: { akademiId: 'current', paketId: selectedPaket.id } });
      toast.success(`Berhasil berlangganan paket ${selectedPaket.nama}.`);
      setDialogOpen(false);
    } catch (err: any) { toast.error(err?.message || 'Gagal berlangganan.'); }
    finally { setSubmitting(false); }
  };

  const handleOpenSubscribe = (paket: PaketData) => {
    setSelectedPaket(paket);
    setDialogOpen(true);
  };

  // Payment history (using langganan data as proxy)
  const paymentColumns: ColumnDef<LanggananData>[] = [
    { header: 'Paket ID', cell: l => l.paketId, className: 'font-mono text-xs' },
    { header: 'Mulai', cell: l => l.tanggalMulai ? new Date(l.tanggalMulai).toLocaleDateString('id-ID') : '-', className: 'text-xs' },
    { header: 'Berakhir', cell: l => l.tanggalBerakhir ? new Date(l.tanggalBerakhir).toLocaleDateString('id-ID') : '-', className: 'text-xs' },
    { header: 'Status', cell: l => (
      <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${l.status === 'aktif' ? 'bg-green-500/10 text-green-600' : l.status === 'expired' ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-600'}`}>{l.status}</span>
    ), className: 'text-xs' },
  ];

  if (paketError) return <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs"><AlertCircle className="w-4 h-4" /><span className="font-bold">{paketError.message}</span></div>;

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          Langganan <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">MVP</span>
        </h2>
        <p className="text-xs text-muted-foreground font-medium">Kelola langganan paket akademi Anda.</p>
      </div>

      {/* Current subscription status */}
      {currentLangganan && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Langganan Aktif</p>
              <p className="text-lg font-black text-foreground mt-1">Paket {paketList.find(p => p.id === currentLangganan.paketId)?.nama || currentLangganan.paketId}</p>
              <p className="text-xs text-muted-foreground mt-1">Berlaku hingga {currentLangganan.tanggalBerakhir ? new Date(currentLangganan.tanggalBerakhir).toLocaleDateString('id-ID') : '-'}</p>
            </div>
            <span className={`text-2xs font-bold px-3 py-1 rounded-full ${currentLangganan.status === 'aktif' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>{currentLangganan.status}</span>
          </div>
        </div>
      )}

      {/* Package cards */}
      <div className="space-y-2">
        <h3 className="text-sm font-black text-foreground">Paket Tersedia</h3>
        {paketLoading ? <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div> :
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {paketList.filter(p => p.aktif).map(paket => {
            const colors = paketColors[paket.nama.toLowerCase()] || paketColors.free;
            const isCurrent = currentLangganan?.paketId === paket.id;
            return (
              <div key={paket.id} className={`${colors.bg} border ${colors.border} rounded-xl p-5 shadow-2xs hover:shadow-md transition-shadow space-y-3`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-foreground capitalize">{paket.nama}</h4>
                  {isCurrent && <span className="text-5xs font-bold px-2 py-0.5 bg-green-500/10 text-green-600 rounded-full">Aktif</span>}
                </div>
                <p className="text-xl font-black text-foreground">{paket.harga === 0 ? 'Gratis' : fmt(paket.harga)}<span className="text-xs text-muted-foreground font-medium">/{paket.durasiBulan}bln</span></p>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p>Max Siswa: <span className="font-bold text-foreground">{paket.maxSiswa}</span></p>
                  <p>Max Pelatih: <span className="font-bold text-foreground">{paket.maxPelatih}</span></p>
                  {paket.fitur && <p className="text-5xs">{paket.fitur}</p>}
                </div>
                {!isCurrent && (
                  <Button onClick={() => handleOpenSubscribe(paket)} className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-lg gap-1.5 h-9 text-xs cursor-pointer">
                    <CreditCard className="w-3.5 h-3.5" /><span>Langganan</span>
                  </Button>
                )}
              </div>
            );
          })}
        </div>}
      </div>

      {/* Payment / subscription history */}
      <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
        <h3 className="text-sm font-black text-foreground mb-4">Riwayat Langganan</h3>
        <DataTable data={langgananData?.langgananAkademi || []} columns={paymentColumns} loading={langgananLoading} emptyMessage="Belum ada riwayat langganan." />
      </div>

      {/* Subscribe Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">Konfirmasi Langganan</DialogTitle></DialogHeader>
          {selectedPaket && (
            <div className="space-y-4">
              <div className="p-4 bg-background border border-border rounded-xl space-y-2">
                <p className="text-sm font-black text-foreground">Paket {selectedPaket.nama}</p>
                <p className="text-lg font-black text-primary">{selectedPaket.harga === 0 ? 'Gratis' : fmt(selectedPaket.harga)}</p>
                <p className="text-xs text-muted-foreground">Durasi: {selectedPaket.durasiBulan} bulan · Max {selectedPaket.maxSiswa} siswa · Max {selectedPaket.maxPelatih} pelatih</p>
              </div>
              <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
                <Button type="button" onClick={() => setDialogOpen(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer">Batal</Button>
                <Button onClick={handleSubscribe} disabled={submitting} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2">
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}<Check className="w-3.5 h-3.5" /><span>Konfirmasi</span>
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
