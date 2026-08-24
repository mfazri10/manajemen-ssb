'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Loader2, AlertCircle, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

const GET_KAT = gql`query GetMateriKat { materiKategori { id nama urutan } }`;
const GET_MATERI = gql`query GetMateri { materiLatihan { id kategoriId kelompokUmurId judul deskripsi durasiMenit level tipe instruksi } }`;
const CREATE_MATERI = gql`mutation CM($judul:String!,$kategoriId:ID,$kelompokUmurId:ID,$deskripsi:String,$durasiMenit:Int,$level:String,$tipe:String,$instruksi:String) { createMateriLatihan(judul:$judul,kategoriId:$kategoriId,kelompokUmurId:$kelompokUmurId,deskripsi:$deskripsi,durasiMenit:$durasiMenit,level:$level,tipe:$tipe,instruksi:$instruksi) { id } }`;
const UPDATE_MATERI = gql`mutation UM($id:ID!,$judul:String,$kategoriId:ID,$kelompokUmurId:ID,$deskripsi:String,$durasiMenit:Int,$level:String,$tipe:String,$instruksi:String) { updateMateriLatihan(id:$id,judul:$judul,kategoriId:$kategoriId,kelompokUmurId:$kelompokUmurId,deskripsi:$deskripsi,durasiMenit:$durasiMenit,level:$level,tipe:$tipe,instruksi:$instruksi) { id } }`;
const DELETE_MATERI = gql`mutation DM($id:ID!) { deleteMateriLatihan(id:$id) }`;
const CREATE_KAT = gql`mutation CK($nama:String!,$urutan:Int) { createMateriKategori(nama:$nama,urutan:$urutan) { id } }`;
const DELETE_KAT = gql`mutation DK($id:ID!) { deleteMateriKategori(id:$id) }`;
const GET_KU = gql`query GetKU { kelompokUmur { id nama } }`;

const LEVEL = ['pemula', 'menengah', 'lanjutan'];
const TIPE = ['teknik', 'fisik', 'taktik', 'mental', 'permainan'];
const LEVEL_COLOR: Record<string, string> = { pemula: 'bg-green-500/10 text-green-600', menengah: 'bg-amber-500/10 text-amber-600', lanjutan: 'bg-red-500/10 text-red-600' };

export default function AdminMateriPage() {
  const { data: katData, refetch: refetchKat } = useQuery<{ materiKategori: any[] }>(GET_KAT);
  const { data, loading, error, refetch } = useQuery<{ materiLatihan: any[] }>(GET_MATERI, { fetchPolicy: 'cache-and-network' });
  const { data: kuData } = useQuery<{ kelompokUmur: { id: string; nama: string }[] }>(GET_KU);
  const [create] = useMutation(CREATE_MATERI);
  const [update] = useMutation(UPDATE_MATERI);
  const [del] = useMutation(DELETE_MATERI);
  const [createKat] = useMutation(CREATE_KAT);
  const [deleteKat] = useMutation(DELETE_KAT);
  const { ask, dialog } = useConfirmDialog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [katDialogOpen, setKatDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const empty = { judul: '', kategoriId: '', kelompokUmurId: '', deskripsi: '', durasiMenit: '', level: 'pemula', tipe: 'teknik', instruksi: '' };
  const [f, setF] = useState(empty);
  const [katNama, setKatNama] = useState('');
  const katMap = Object.fromEntries((katData?.materiKategori || []).map(k => [k.id, k.nama]));
  const kuMap = Object.fromEntries((kuData?.kelompokUmur || []).map(k => [k.id, k.nama]));
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  const handleOpenCreate = () => { setFormMode('create'); setSelected(null); setF(empty); setDialogOpen(true); };
  const handleOpenEdit = (i: any) => { setFormMode('edit'); setSelected(i); setF({ judul: i.judul, kategoriId: i.kategoriId || '', kelompokUmurId: i.kelompokUmurId || '', deskripsi: i.deskripsi || '', durasiMenit: i.durasiMenit?.toString() || '', level: i.level, tipe: i.tipe, instruksi: i.instruksi || '' }); setDialogOpen(true); };
  const handleDelete = (i: any) => ask({
    title: 'Hapus materi?',
    description: `Materi "${i.judul}" akan dihapus permanen.`,
    onConfirm: async () => { try { await del({ variables: { id: i.id } }); toast.success('Dihapus.'); refetch(); } catch (e: any) { toast.error(e?.message); } },
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const vars: Record<string, unknown> = { judul: f.judul };
      if (f.kategoriId) vars.kategoriId = f.kategoriId;
      if (f.kelompokUmurId) vars.kelompokUmurId = f.kelompokUmurId;
      if (f.deskripsi) vars.deskripsi = f.deskripsi;
      if (f.durasiMenit) vars.durasiMenit = parseInt(f.durasiMenit);
      if (f.level) vars.level = f.level;
      if (f.tipe) vars.tipe = f.tipe;
      if (f.instruksi) vars.instruksi = f.instruksi;
      if (formMode === 'create') { await create({ variables: vars }); toast.success('Ditambahkan.'); }
      else { await update({ variables: { id: selected.id, ...vars } }); toast.success('Diperbarui.'); }
      setDialogOpen(false); refetch();
    } catch (e: any) { toast.error(e?.message); } finally { setSubmitting(false); }
  };

  const columns: ColumnDef<any>[] = [
    { header: 'Judul', accessorKey: 'judul', className: 'font-extrabold text-sm' },
    { header: 'Kategori', cell: i => katMap[i.kategoriId || ''] || '-', className: 'text-xs' },
    { header: 'Tipe', accessorKey: 'tipe', className: 'text-xs' },
    { header: 'Level', cell: i => <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${LEVEL_COLOR[i.level] || ''}`}>{i.level}</span> },
    { header: 'Durasi', cell: i => i.durasiMenit ? `${i.durasiMenit} mnt` : '-', className: 'text-xs' },
    { header: 'Kelompok', cell: i => kuMap[i.kelompokUmurId || ''] || '-', className: 'text-xs' },
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
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2"><BookOpen className="w-6 h-6 text-primary" /> Materi Latihan</h2>
        <p className="text-xs text-muted-foreground font-medium">Kelola kurikulum dan materi latihan akademi.</p>
      </div>
      {error ? <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs"><AlertCircle className="w-4 h-4" /><span className="font-bold">{error.message}</span></div> : (
        <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
          <DataTable data={data?.materiLatihan || []} columns={columns} loading={loading} searchPlaceholder="Cari..." searchKeys={['judul']} emptyMessage="Belum ada materi." actions={
            <div className="flex gap-2">
              <Button onClick={() => { setKatNama(''); setKatDialogOpen(true); }} className="bg-muted hover:bg-muted/80 text-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer border border-border">Kategori</Button>
              <Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"><Plus className="w-3.5 h-3.5" /><span>Tambah Materi</span></Button>
            </div>
          } />
        </div>
      )}
      {/* Materi Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-lg rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">{formMode === 'create' ? 'Tambah Materi' : 'Ubah Materi'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Judul</label><input type="text" value={f.judul} onChange={e => set('judul', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Kategori</label><select value={f.kategoriId} onChange={e => set('kategoriId', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"><option value="">-- Pilih --</option>{(katData?.materiKategori || []).map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}</select></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Kelompok Umur</label><select value={f.kelompokUmurId} onChange={e => set('kelompokUmurId', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"><option value="">-- Semua --</option>{(kuData?.kelompokUmur || []).map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tipe</label><select value={f.tipe} onChange={e => set('tipe', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium">{TIPE.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Level</label><select value={f.level} onChange={e => set('level', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium">{LEVEL.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Durasi (mnt)</label><input type="number" min="0" value={f.durasiMenit} onChange={e => set('durasiMenit', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium" /></div>
            </div>
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Deskripsi</label><textarea value={f.deskripsi} onChange={e => set('deskripsi', e.target.value)} rows={2} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Instruksi</label><textarea value={f.instruksi} onChange={e => set('instruksi', e.target.value)} rows={3} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
            <DialogFooter className="pt-4 border-t border-border"><Button type="button" onClick={() => setDialogOpen(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer mr-2">Batal</Button><Button type="submit" disabled={submitting} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2">{submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}<span>{formMode === 'create' ? 'Tambah' : 'Simpan'}</span></Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Kategori Dialog */}
      <Dialog open={katDialogOpen} onOpenChange={setKatDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-sm rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">Kategori Materi</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {(katData?.materiKategori || []).map(k => (
              <div key={k.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <span className="text-xs font-bold">{k.nama}</span>
                <Button onClick={() => { deleteKat({ variables: { id: k.id } }).then(() => { toast.success('Dihapus.'); refetchKat(); }); }} variant="ghost" size="sm" className="h-6 px-2 bg-destructive/10 text-destructive rounded-lg cursor-pointer"><Trash2 className="w-3 h-3" /></Button>
              </div>
            ))}
            <div className="flex gap-2">
              <input type="text" value={katNama} onChange={e => setKatNama(e.target.value)} placeholder="Nama kategori" className="flex-1 px-3 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium" />
              <Button onClick={() => { if (katNama) { createKat({ variables: { nama: katNama } }).then(() => { toast.success('Ditambahkan.'); setKatNama(''); refetchKat(); }); } }} className="bg-primary text-primary-foreground font-bold rounded-xl px-3 text-2xs cursor-pointer">Tambah</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {dialog}
    </div>
  );
}
