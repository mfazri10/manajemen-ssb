'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Loader2, AlertCircle, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

const GET = gql`query GetTurnamen { turnamen { id nama tanggalMulai tanggalSelesai lokasi kategoriUmur hasil } }`;
const CREATE = gql`mutation CreateTurnamen($nama:String!,$tanggalMulai:String,$tanggalSelesai:String,$lokasi:String,$kategoriUmur:String) { createTurnamen(nama:$nama,tanggalMulai:$tanggalMulai,tanggalSelesai:$tanggalSelesai,lokasi:$lokasi,kategoriUmur:$kategoriUmur) { id } }`;
const UPDATE = gql`mutation UpdateTurnamen($id:ID!,$nama:String,$tanggalMulai:String,$tanggalSelesai:String,$lokasi:String,$kategoriUmur:String,$hasil:String) { updateTurnamen(id:$id,nama:$nama,tanggalMulai:$tanggalMulai,tanggalSelesai:$tanggalSelesai,lokasi:$lokasi,kategoriUmur:$kategoriUmur,hasil:$hasil) { id } }`;
const DELETE = gql`mutation DeleteTurnamen($id:ID!) { deleteTurnamen(id:$id) }`;

interface Data { id: string; nama: string; tanggalMulai?: string; tanggalSelesai?: string; lokasi?: string; kategoriUmur?: string; hasil?: string; }

export default function AdminTurnamenPage() {
  const { data, loading, error, refetch } = useQuery<{ turnamen: Data[] }>(GET, { fetchPolicy: 'cache-and-network' });
  const [create] = useMutation(CREATE);
  const [update] = useMutation(UPDATE);
  const [del] = useMutation(DELETE);
  const { ask, dialog } = useConfirmDialog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<Data | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const empty = { nama: '', tanggalMulai: '', tanggalSelesai: '', lokasi: '', kategoriUmur: '', hasil: '' };
  const [f, setF] = useState(empty);
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  const handleOpenCreate = () => { setFormMode('create'); setSelected(null); setF(empty); setDialogOpen(true); };
  const handleOpenEdit = (i: Data) => { setFormMode('edit'); setSelected(i); setF({ nama: i.nama, tanggalMulai: i.tanggalMulai || '', tanggalSelesai: i.tanggalSelesai || '', lokasi: i.lokasi || '', kategoriUmur: i.kategoriUmur || '', hasil: i.hasil || '' }); setDialogOpen(true); };
  const handleDelete = (i: Data) => ask({
    title: 'Hapus turnamen?',
    description: `Turnamen "${i.nama}" akan dihapus permanen.`,
    onConfirm: async () => { try { await del({ variables: { id: i.id } }); toast.success('Dihapus.'); refetch(); } catch (e: any) { toast.error(e?.message); } },
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const vars: Record<string, unknown> = { nama: f.nama };
      for (const [k, v] of Object.entries({ tanggalMulai: f.tanggalMulai, tanggalSelesai: f.tanggalSelesai, lokasi: f.lokasi, kategoriUmur: f.kategoriUmur, hasil: f.hasil })) { if (v) vars[k] = v; }
      if (formMode === 'create') { await create({ variables: vars }); toast.success('Ditambahkan.'); }
      else { await update({ variables: { id: selected!.id, ...vars } }); toast.success('Diperbarui.'); }
      setDialogOpen(false); refetch();
    } catch (e: any) { toast.error(e?.message); } finally { setSubmitting(false); }
  };

  const columns: ColumnDef<Data>[] = [
    { header: 'Nama Turnamen', accessorKey: 'nama', className: 'font-extrabold text-sm' },
    { header: 'Tanggal', cell: i => i.tanggalMulai ? `${i.tanggalMulai}${i.tanggalSelesai ? ' - ' + i.tanggalSelesai : ''}` : '-', className: 'text-xs' },
    { header: 'Lokasi', cell: i => i.lokasi || '-', className: 'text-xs' },
    { header: 'Kategori', cell: i => i.kategoriUmur || '-', className: 'text-xs' },
    { header: 'Hasil', cell: i => i.hasil || '-', className: 'text-xs' },
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
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2"><Trophy className="w-6 h-6 text-primary" /> Turnamen <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">Kompetisi</span></h2>
        <p className="text-xs text-muted-foreground font-medium">Kelola turnamen dan kompetisi yang diikuti akademi.</p>
      </div>
      {error ? <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs"><AlertCircle className="w-4 h-4" /><span className="font-bold">{error.message}</span></div> : (
        <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
          <DataTable data={data?.turnamen || []} columns={columns} loading={loading} searchPlaceholder="Cari..." searchKeys={['nama', 'lokasi']} emptyMessage="Belum ada turnamen." actions={<Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"><Plus className="w-3.5 h-3.5" /><span>Tambah Turnamen</span></Button>} />
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-lg rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">{formMode === 'create' ? 'Tambah Turnamen' : 'Ubah Turnamen'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Nama Turnamen</label><input type="text" value={f.nama} onChange={e => set('nama', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tanggal Mulai</label><input type="date" value={f.tanggalMulai} onChange={e => set('tanggalMulai', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tanggal Selesai</label><input type="date" value={f.tanggalSelesai} onChange={e => set('tanggalSelesai', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Lokasi</label><input type="text" value={f.lokasi} onChange={e => set('lokasi', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Kategori Umur</label><input type="text" value={f.kategoriUmur} onChange={e => set('kategoriUmur', e.target.value)} placeholder="U-12, U-14, dll" className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
            </div>
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Hasil</label><textarea value={f.hasil} onChange={e => set('hasil', e.target.value)} rows={2} placeholder="Juara 1, Peringkat 3, dll" className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
            <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <Button type="button" onClick={() => setDialogOpen(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer">Batal</Button>
              <Button type="submit" disabled={submitting} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2">{submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}<span>{formMode === 'create' ? 'Tambah' : 'Simpan'}</span></Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {dialog}
    </div>
  );
}
