'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Loader2, AlertCircle, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

const GET = gql`query GetInventaris { inventaris { id nama kategori jumlah satuan kondisi keterangan } }`;
const CREATE = gql`mutation CreateInv($nama:String!,$kategori:String,$jumlah:Int,$satuan:String,$kondisi:String,$keterangan:String) { createInventaris(nama:$nama,kategori:$kategori,jumlah:$jumlah,satuan:$satuan,kondisi:$kondisi,keterangan:$keterangan) { id } }`;
const UPDATE = gql`mutation UpdateInv($id:ID!,$nama:String,$kategori:String,$jumlah:Int,$satuan:String,$kondisi:String,$keterangan:String) { updateInventaris(id:$id,nama:$nama,kategori:$kategori,jumlah:$jumlah,satuan:$satuan,kondisi:$kondisi,keterangan:$keterangan) { id } }`;
const DELETE = gql`mutation DeleteInv($id:ID!) { deleteInventaris(id:$id) }`;

interface Data { id: string; nama: string; kategori?: string; jumlah: number; satuan: string; kondisi: string; keterangan?: string; }

const KATEGORI = ['jersey', 'bola', 'cone', 'rompi', 'gawang', 'medis', 'lainnya'];
const KONDISI = ['baik', 'rusak_ringan', 'rusak_berat'];
const KONDISI_COLOR: Record<string, string> = { baik: 'bg-green-500/10 text-green-600', rusak_ringan: 'bg-amber-500/10 text-amber-600', rusak_berat: 'bg-destructive/10 text-destructive' };

export default function AdminInventarisPage() {
  const { data, loading, error, refetch } = useQuery<{ inventaris: Data[] }>(GET, { fetchPolicy: 'cache-and-network' });
  const [create] = useMutation(CREATE);
  const [update] = useMutation(UPDATE);
  const [del] = useMutation(DELETE);
  const { ask, dialog } = useConfirmDialog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<Data | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const empty = { nama: '', kategori: '', jumlah: '', satuan: 'pcs', kondisi: 'baik', keterangan: '' };
  const [f, setF] = useState(empty);
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  const handleOpenCreate = () => { setFormMode('create'); setSelected(null); setF(empty); setDialogOpen(true); };
  const handleOpenEdit = (i: Data) => { setFormMode('edit'); setSelected(i); setF({ nama: i.nama, kategori: i.kategori || '', jumlah: i.jumlah.toString(), satuan: i.satuan, kondisi: i.kondisi, keterangan: i.keterangan || '' }); setDialogOpen(true); };
  const handleDelete = (i: Data) => ask({
    title: 'Hapus inventaris?',
    description: `Barang "${i.nama}" akan dihapus permanen.`,
    onConfirm: async () => { try { await del({ variables: { id: i.id } }); toast.success('Dihapus.'); refetch(); } catch (e: any) { toast.error(e?.message); } },
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const vars: Record<string, unknown> = { nama: f.nama };
      if (f.kategori) vars.kategori = f.kategori;
      if (f.jumlah) vars.jumlah = parseInt(f.jumlah);
      if (f.satuan) vars.satuan = f.satuan;
      if (f.kondisi) vars.kondisi = f.kondisi;
      if (f.keterangan) vars.keterangan = f.keterangan;
      if (formMode === 'create') { await create({ variables: vars }); toast.success('Ditambahkan.'); }
      else { await update({ variables: { id: selected!.id, ...vars } }); toast.success('Diperbarui.'); }
      setDialogOpen(false); refetch();
    } catch (e: any) { toast.error(e?.message); } finally { setSubmitting(false); }
  };

  const columns: ColumnDef<Data>[] = [
    { header: 'Nama Barang', accessorKey: 'nama', className: 'font-extrabold text-sm' },
    { header: 'Kategori', cell: i => i.kategori || '-', className: 'text-xs' },
    { header: 'Jumlah', cell: i => `${i.jumlah} ${i.satuan}`, className: 'text-xs font-bold' },
    { header: 'Kondisi', cell: i => <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${KONDISI_COLOR[i.kondisi] || ''}`}>{i.kondisi.replace('_', ' ')}</span> },
    { header: 'Keterangan', cell: i => i.keterangan || '-', className: 'text-xs' },
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
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2"><Package className="w-6 h-6 text-primary" /> Inventaris <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">Aset</span></h2>
        <p className="text-xs text-muted-foreground font-medium">Kelola peralatan dan perlengkapan akademi.</p>
      </div>
      {error ? <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs"><AlertCircle className="w-4 h-4" /><span className="font-bold">{error.message}</span></div> : (
        <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
          <DataTable data={data?.inventaris || []} columns={columns} loading={loading} searchPlaceholder="Cari..." searchKeys={['nama', 'kategori']} emptyMessage="Belum ada inventaris." actions={<Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"><Plus className="w-3.5 h-3.5" /><span>Tambah Barang</span></Button>} />
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">{formMode === 'create' ? 'Tambah Barang' : 'Ubah Barang'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Nama Barang</label><input type="text" value={f.nama} onChange={e => set('nama', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Kategori</label><select value={f.kategori} onChange={e => set('kategori', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"><option value="">-- Pilih --</option>{KATEGORI.map(k => <option key={k} value={k}>{k}</option>)}</select></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Kondisi</label><select value={f.kondisi} onChange={e => set('kondisi', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium">{KONDISI.map(k => <option key={k} value={k}>{k.replace('_', ' ')}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Jumlah</label><input type="number" value={f.jumlah} onChange={e => set('jumlah', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Satuan</label><input type="text" value={f.satuan} onChange={e => set('satuan', e.target.value)} placeholder="pcs, set, kg" className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
            </div>
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Keterangan</label><textarea value={f.keterangan} onChange={e => set('keterangan', e.target.value)} rows={2} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
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
