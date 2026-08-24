'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

const GET = gql`query GetPelanggaranSiswa { pelanggaranSiswa { id siswaId masterPelanggaranId tanggal keterangan } }`;
const GET_SISWA = gql`query GetSiswaPlg { siswa { id namaLengkap } }`;
const GET_MASTER = gql`query GetMasterPlg { masterPelanggaran { id nama poin } }`;
const CREATE = gql`mutation CreatePlg($siswaId:ID!,$tanggal:String!,$masterPelanggaranId:ID,$keterangan:String) { createPelanggaranSiswa(siswaId:$siswaId,tanggal:$tanggal,masterPelanggaranId:$masterPelanggaranId,keterangan:$keterangan) { id } }`;
const DELETE = gql`mutation DeletePlg($id:ID!) { deletePelanggaranSiswa(id:$id) }`;

interface PlgData { id: string; siswaId: string; masterPelanggaranId?: string; tanggal: string; keterangan?: string; }

export default function AdminPelanggaranPage() {
  const { data, loading, error, refetch } = useQuery<{ pelanggaranSiswa: PlgData[] }>(GET, { fetchPolicy: 'cache-and-network' });
  const { data: siswaData } = useQuery<{ siswa: { id: string; namaLengkap: string }[] }>(GET_SISWA);
  const { data: masterData } = useQuery<{ masterPelanggaran: { id: string; nama: string; poin?: number }[] }>(GET_MASTER);
  const [createPlg] = useMutation(CREATE);
  const [deletePlg] = useMutation(DELETE);
  const { ask, dialog } = useConfirmDialog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [f, setF] = useState({ siswaId: '', tanggal: new Date().toISOString().split('T')[0], masterPelanggaranId: '', keterangan: '' });
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));
  const siswaMap = Object.fromEntries((siswaData?.siswa || []).map(s => [s.id, s.namaLengkap]));
  const masterMap = Object.fromEntries((masterData?.masterPelanggaran || []).map(m => [m.id, m.nama]));

  const handleDelete = (i: PlgData) => ask({
    title: 'Hapus data pelanggaran?',
    description: `Data pelanggaran ${siswaMap[i.siswaId] || i.siswaId} tanggal ${i.tanggal} akan dihapus permanen.`,
    onConfirm: async () => { try { await deletePlg({ variables: { id: i.id } }); toast.success('Dihapus.'); refetch(); } catch (e: any) { toast.error(e?.message); } },
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const vars: Record<string, unknown> = { siswaId: f.siswaId, tanggal: f.tanggal };
      if (f.masterPelanggaranId) vars.masterPelanggaranId = f.masterPelanggaranId;
      if (f.keterangan) vars.keterangan = f.keterangan;
      await createPlg({ variables: vars }); toast.success('Ditambahkan.'); setDialogOpen(false); refetch();
    } catch (e: any) { toast.error(e?.message); } finally { setSubmitting(false); }
  };

  const columns: ColumnDef<PlgData>[] = [
    { header: 'Siswa', cell: i => siswaMap[i.siswaId] || '-', className: 'font-extrabold text-sm' },
    { header: 'Tanggal', accessorKey: 'tanggal', className: 'text-xs' },
    { header: 'Pelanggaran', cell: i => masterMap[i.masterPelanggaranId || ''] || '-', className: 'text-xs font-bold text-destructive' },
    { header: 'Keterangan', cell: i => i.keterangan || '-', className: 'text-xs' },
    { header: '', className: 'text-right w-12', cell: i => <Button onClick={() => handleDelete(i)} variant="ghost" size="sm" className="h-8 px-2 bg-destructive/10 border border-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></Button> },
  ];

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">Pelanggaran Siswa <span className="text-3xs px-2.5 py-0.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-full font-black uppercase">Disiplin</span></h2>
        <p className="text-xs text-muted-foreground font-medium">Catat pelanggaran siswa terkait disiplin dan etika.</p>
      </div>
      {error ? <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs"><AlertCircle className="w-4 h-4" /><span className="font-bold">{error.message}</span></div> : (
        <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
          <DataTable data={data?.pelanggaranSiswa || []} columns={columns} loading={loading} searchPlaceholder="Cari..." searchKeys={['siswaId']} emptyMessage="Belum ada pelanggaran." actions={<Button onClick={() => { setF({ siswaId: '', tanggal: new Date().toISOString().split('T')[0], masterPelanggaranId: '', keterangan: '' }); setDialogOpen(true); }} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"><Plus className="w-3.5 h-3.5" /><span>Tambah</span></Button>} />
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">Catat Pelanggaran</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Siswa</label><select value={f.siswaId} onChange={e => set('siswaId', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required><option value="">-- Pilih --</option>{(siswaData?.siswa || []).map(s => <option key={s.id} value={s.id}>{s.namaLengkap}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tanggal</label><input type="date" value={f.tanggal} onChange={e => set('tanggal', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required /></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Jenis Pelanggaran</label><select value={f.masterPelanggaranId} onChange={e => set('masterPelanggaranId', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"><option value="">-- Pilih --</option>{(masterData?.masterPelanggaran || []).map(m => <option key={m.id} value={m.id}>{m.nama} ({m.poin} poin)</option>)}</select></div>
            </div>
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Keterangan</label><textarea value={f.keterangan} onChange={e => set('keterangan', e.target.value)} rows={2} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
            <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <Button type="button" onClick={() => setDialogOpen(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer">Batal</Button>
              <Button type="submit" disabled={submitting} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2">{submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}<span>Simpan</span></Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {dialog}
    </div>
  );
}
