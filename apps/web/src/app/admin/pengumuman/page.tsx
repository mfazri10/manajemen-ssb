'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

const GET = gql`query GetPengumuman { pengumuman { id judul isi target kelompokUmurId tanggal } }`;
const CREATE = gql`mutation CreatePengumuman($judul:String!,$isi:String!,$target:String,$kelompokUmurId:ID,$tanggal:String) { createPengumuman(judul:$judul,isi:$isi,target:$target,kelompokUmurId:$kelompokUmurId,tanggal:$tanggal) { id } }`;
const UPDATE = gql`mutation UpdatePengumuman($id:ID!,$judul:String,$isi:String,$target:String,$tanggal:String) { updatePengumuman(id:$id,judul:$judul,isi:$isi,target:$target,tanggal:$tanggal) { id } }`;
const DELETE = gql`mutation DeletePengumuman($id:ID!) { deletePengumuman(id:$id) }`;

interface Data { id: string; judul: string; isi: string; target: string; kelompokUmurId?: string; tanggal?: string; }

export default function AdminPengumumanPage() {
  const { data, loading, error, refetch } = useQuery<{ pengumuman: Data[] }>(GET, { fetchPolicy: 'cache-and-network' });
  const [create] = useMutation(CREATE);
  const [update] = useMutation(UPDATE);
  const [del] = useMutation(DELETE);
  const { ask, dialog } = useConfirmDialog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<Data | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const empty = { judul: '', isi: '', target: 'semua', tanggal: new Date().toISOString().split('T')[0] };
  const [f, setF] = useState(empty);
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  const handleOpenCreate = () => { setFormMode('create'); setSelected(null); setF(empty); setDialogOpen(true); };
  const handleOpenEdit = (i: Data) => { setFormMode('edit'); setSelected(i); setF({ judul: i.judul, isi: i.isi, target: i.target, tanggal: i.tanggal || '' }); setDialogOpen(true); };
  const handleDelete = (i: Data) => ask({
    title: 'Hapus pengumuman?',
    description: `Pengumuman "${i.judul}" akan dihapus permanen.`,
    onConfirm: async () => { try { await del({ variables: { id: i.id } }); toast.success('Dihapus.'); refetch(); } catch (e: any) { toast.error(e?.message); } },
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const vars: Record<string, unknown> = { judul: f.judul, isi: f.isi };
      if (f.target) vars.target = f.target;
      if (f.tanggal) vars.tanggal = f.tanggal;
      if (formMode === 'create') { await create({ variables: vars }); toast.success('Ditambahkan.'); }
      else { await update({ variables: { id: selected!.id, ...vars } }); toast.success('Diperbarui.'); }
      setDialogOpen(false); refetch();
    } catch (e: any) { toast.error(e?.message); } finally { setSubmitting(false); }
  };

  const targetColor: Record<string, string> = { semua: 'bg-blue-500/10 text-blue-600', siswa: 'bg-green-500/10 text-green-600', orang_tua: 'bg-amber-500/10 text-amber-600', pelatih: 'bg-purple-500/10 text-purple-600' };

  const columns: ColumnDef<Data>[] = [
    { header: 'Judul', accessorKey: 'judul', className: 'font-extrabold text-sm' },
    { header: 'Target', cell: i => <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${targetColor[i.target] || ''}`}>{i.target}</span> },
    { header: 'Tanggal', cell: i => i.tanggal || '-', className: 'text-xs' },
    { header: 'Isi', cell: i => i.isi.length > 50 ? i.isi.slice(0, 50) + '...' : i.isi, className: 'text-xs' },
    { header: 'Aksi', className: 'text-right w-24', cell: i => (
      <div className="flex items-center justify-end gap-2">
        <Button onClick={() => handleOpenEdit(i)} variant="ghost" size="sm" className="h-8 px-2 bg-background border border-border hover:bg-muted rounded-lg cursor-pointer"><Edit2 className="w-3.5 h-3.5 text-primary" /></Button>
        <Button onClick={() => handleDelete(i)} variant="ghost" size="sm" className="h-8 px-2 bg-destructive/10 border border-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></Button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">Pengumuman <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">Komunikasi</span></h2>
        <p className="text-xs text-muted-foreground font-medium">Broadcast pengumuman ke siswa, orang tua, atau pelatih.</p>
      </div>
      {error ? <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs"><AlertCircle className="w-4 h-4" /><span className="font-bold">{error.message}</span></div> : (
        <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
          <DataTable data={data?.pengumuman || []} columns={columns} loading={loading} searchPlaceholder="Cari..." searchKeys={['judul']} emptyMessage="Belum ada pengumuman." actions={<Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"><Plus className="w-3.5 h-3.5" /><span>Buat Pengumuman</span></Button>} />
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-lg rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">{formMode === 'create' ? 'Buat Pengumuman' : 'Ubah Pengumuman'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Judul</label><input type="text" value={f.judul} onChange={e => set('judul', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Target</label><select value={f.target} onChange={e => set('target', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium">{['semua', 'siswa', 'orang_tua', 'pelatih'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}</select></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tanggal</label><input type="date" value={f.tanggal} onChange={e => set('tanggal', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
            </div>
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Isi Pengumuman</label><textarea value={f.isi} onChange={e => set('isi', e.target.value)} rows={5} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required /></div>
            <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <Button type="button" onClick={() => setDialogOpen(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer">Batal</Button>
              <Button type="submit" disabled={submitting} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2">{submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}<span>{formMode === 'create' ? 'Kirim' : 'Simpan'}</span></Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {dialog}
    </div>
  );
}
