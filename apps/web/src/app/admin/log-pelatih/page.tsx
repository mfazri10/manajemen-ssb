'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Loader2, AlertCircle, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

const GET = gql`query GetLogPelatih { logPelatih { id pelatihId jadwalId tanggal kegiatan materiId catatan durasiMenit } }`;
const GET_PELATIH = gql`query GetPelatihLog { pelatih { id nama } }`;
const CREATE = gql`mutation CLP($pelatihId:ID!,$tanggal:String!,$kegiatan:String!,$jadwalId:ID,$materiId:ID,$catatan:String,$durasiMenit:Int) { createLogPelatih(pelatihId:$pelatihId,tanggal:$tanggal,kegiatan:$kegiatan,jadwalId:$jadwalId,materiId:$materiId,catatan:$catatan,durasiMenit:$durasiMenit) { id } }`;
const DELETE = gql`mutation DLP($id:ID!) { deleteLogPelatih(id:$id) }`;

export default function AdminLogPelatihPage() {
  const { data, loading, error, refetch } = useQuery<{ logPelatih: any[] }>(GET, { fetchPolicy: 'cache-and-network' });
  const { data: pelatihData } = useQuery<{ pelatih: { id: string; nama: string }[] }>(GET_PELATIH);
  const [create] = useMutation(CREATE);
  const [del] = useMutation(DELETE);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const empty = { pelatihId: '', tanggal: new Date().toISOString().split('T')[0], kegiatan: '', catatan: '', durasiMenit: '' };
  const [f, setF] = useState(empty);
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));
  const pelatihMap = Object.fromEntries((pelatihData?.pelatih || []).map(p => [p.id, p.nama]));

  const handleDelete = async (i: any) => { if (!confirm('Hapus?')) return; try { await del({ variables: { id: i.id } }); toast.success('Dihapus.'); refetch(); } catch (e: any) { toast.error(e?.message); } };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const vars: Record<string, unknown> = { pelatihId: f.pelatihId, tanggal: f.tanggal, kegiatan: f.kegiatan };
      if (f.catatan) vars.catatan = f.catatan;
      if (f.durasiMenit) vars.durasiMenit = parseInt(f.durasiMenit);
      await create({ variables: vars }); toast.success('Ditambahkan.'); setDialogOpen(false); refetch();
    } catch (e: any) { toast.error(e?.message); } finally { setSubmitting(false); }
  };

  const columns: ColumnDef<any>[] = [
    { header: 'Pelatih', cell: i => pelatihMap[i.pelatihId] || '-', className: 'font-extrabold text-sm' },
    { header: 'Tanggal', accessorKey: 'tanggal', className: 'text-xs' },
    { header: 'Kegiatan', accessorKey: 'kegiatan', className: 'text-xs font-bold' },
    { header: 'Durasi', cell: i => i.durasiMenit ? `${i.durasiMenit} mnt` : '-', className: 'text-xs' },
    { header: 'Catatan', cell: i => i.catatan || '-', className: 'text-xs' },
    { header: 'Aksi', className: 'text-right w-12', cell: i => <Button onClick={() => handleDelete(i)} variant="ghost" size="sm" className="h-8 px-2 bg-destructive/10 border border-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></Button> },
  ];

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2"><ClipboardList className="w-6 h-6 text-primary" /> Log Pelatih</h2>
        <p className="text-xs text-muted-foreground font-medium">Catatan kegiatan harian pelatih.</p>
      </div>
      {error ? <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs"><AlertCircle className="w-4 h-4" /><span className="font-bold">{error.message}</span></div> : (
        <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
          <DataTable data={data?.logPelatih || []} columns={columns} loading={loading} searchPlaceholder="Cari..." searchKeys={['kegiatan']} emptyMessage="Belum ada log." actions={<Button onClick={() => { setF(empty); setDialogOpen(true); }} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"><Plus className="w-3.5 h-3.5" /><span>Tambah Log</span></Button>} />
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">Tambah Log Pelatih</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Pelatih</label><select value={f.pelatihId} onChange={e => set('pelatihId', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium" required><option value="">-- Pilih --</option>{(pelatihData?.pelatih || []).map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}</select></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tanggal</label><input type="date" value={f.tanggal} onChange={e => set('tanggal', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium" required /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Kegiatan</label><input type="text" value={f.kegiatan} onChange={e => set('kegiatan', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium" required /></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Durasi (mnt)</label><input type="number" min="0" value={f.durasiMenit} onChange={e => set('durasiMenit', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium" /></div>
            </div>
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Catatan</label><textarea value={f.catatan} onChange={e => set('catatan', e.target.value)} rows={3} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
            <DialogFooter className="pt-4 border-t border-border"><Button type="button" onClick={() => setDialogOpen(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer mr-2">Batal</Button><Button type="submit" disabled={submitting} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2">{submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}<span>Tambah</span></Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
