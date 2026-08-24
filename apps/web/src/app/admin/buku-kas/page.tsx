'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Loader2, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { exportToCsv } from '@/lib/export-csv';

const GET = gql`query GetBukuKas { bukuKas { id tanggal tipe kategori jumlah keterangan } }`;
const CREATE = gql`mutation CreateKas($tanggal:String!,$tipe:String!,$jumlah:Float!,$kategori:String,$keterangan:String) { createBukuKas(tanggal:$tanggal,tipe:$tipe,jumlah:$jumlah,kategori:$kategori,keterangan:$keterangan) { id } }`;
const DELETE = gql`mutation DeleteKas($id:ID!) { deleteBukuKas(id:$id) }`;

interface KasData { id: string; tanggal: string; tipe: string; kategori?: string; jumlah: number; keterangan?: string; }

export default function AdminBukuKasPage() {
  const { data, loading, error, refetch } = useQuery<{ bukuKas: KasData[] }>(GET, { fetchPolicy: 'cache-and-network' });
  const [createKas] = useMutation(CREATE);
  const [deleteKas] = useMutation(DELETE);
  const { ask, dialog } = useConfirmDialog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const empty = { tanggal: new Date().toISOString().split('T')[0], tipe: 'masuk', kategori: '', jumlah: '', keterangan: '' };
  const [f, setF] = useState(empty);
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  const handleDelete = (item: KasData) => ask({
    title: 'Hapus transaksi kas?',
    description: `Transaksi ${item.kategori || item.keterangan || item.tanggal} akan dihapus permanen.`,
    onConfirm: async () => { try { await deleteKas({ variables: { id: item.id } }); toast.success('Dihapus.'); refetch(); } catch (e: any) { toast.error(e?.message); } },
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const vars: Record<string, unknown> = { tanggal: f.tanggal, tipe: f.tipe, jumlah: parseFloat(f.jumlah) };
      if (f.kategori) vars.kategori = f.kategori;
      if (f.keterangan) vars.keterangan = f.keterangan;
      await createKas({ variables: vars }); toast.success('Ditambahkan.'); setDialogOpen(false); refetch(); setF(empty);
    } catch (e: any) { toast.error(e?.message); } finally { setSubmitting(false); }
  };

  const totalMasuk = (data?.bukuKas || []).filter(k => k.tipe === 'masuk').reduce((s, k) => s + Number(k.jumlah), 0);
  const totalKeluar = (data?.bukuKas || []).filter(k => k.tipe === 'keluar').reduce((s, k) => s + Number(k.jumlah), 0);
  const kasListExport = (data?.bukuKas || []).map(k => ({ tanggal: k.tanggal, tipe: k.tipe, kategori: k.kategori || '', jumlah: k.jumlah, keterangan: k.keterangan || '' }));

  const columns: ColumnDef<KasData>[] = [
    { header: 'Tanggal', accessorKey: 'tanggal', className: 'text-xs' },
    { header: 'Tipe', cell: i => <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${i.tipe === 'masuk' ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>{i.tipe}</span> },
    { header: 'Kategori', cell: i => i.kategori || '-', className: 'text-xs' },
    { header: 'Jumlah', cell: i => `Rp ${Number(i.jumlah).toLocaleString('id')}`, className: 'text-xs font-bold' },
    { header: 'Keterangan', cell: i => i.keterangan || '-', className: 'text-xs' },
    { header: '', className: 'text-right w-12', cell: i => <Button onClick={() => handleDelete(i)} variant="ghost" size="sm" className="h-8 px-2 bg-destructive/10 border border-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></Button> },
  ];

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">Buku Kas <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">Keuangan</span></h2>
        <p className="text-xs text-muted-foreground font-medium">Catat pemasukan dan pengeluaran akademi.</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4"><p className="text-3xs font-bold text-green-600 uppercase">Pemasukan</p><p className="text-xl font-black text-green-600">Rp {totalMasuk.toLocaleString('id')}</p></div>
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4"><p className="text-3xs font-bold text-destructive uppercase">Pengeluaran</p><p className="text-xl font-black text-destructive">Rp {totalKeluar.toLocaleString('id')}</p></div>
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4"><p className="text-3xs font-bold text-primary uppercase">Saldo</p><p className="text-xl font-black text-primary">Rp {(totalMasuk - totalKeluar).toLocaleString('id')}</p></div>
      </div>
      {error ? <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs"><AlertCircle className="w-4 h-4" /><span className="font-bold">{error.message}</span></div> : (
        <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
          <DataTable data={data?.bukuKas || []} columns={columns} loading={loading} searchPlaceholder="Cari..." searchKeys={['kategori', 'keterangan']} emptyMessage="Belum ada data." actions={<div className="flex items-center gap-2"><Button onClick={() => exportToCsv('buku-kas', kasListExport)} variant="ghost" className="border border-border bg-background hover:bg-muted text-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"><Download className="w-3.5 h-3.5" /><span>Export CSV</span></Button><Button onClick={() => { setF(empty); setDialogOpen(true); }} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"><Plus className="w-3.5 h-3.5" /><span>Tambah</span></Button></div>} />
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">Tambah Transaksi</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tanggal</label><input type="date" value={f.tanggal} onChange={e => set('tanggal', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required /></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tipe</label><select value={f.tipe} onChange={e => set('tipe', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"><option value="masuk">Masuk</option><option value="keluar">Keluar</option></select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Kategori</label><input type="text" value={f.kategori} onChange={e => set('kategori', e.target.value)} placeholder="SPP, Donasi, dll" className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Jumlah (Rp)</label><input type="number" value={f.jumlah} onChange={e => set('jumlah', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required /></div>
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
