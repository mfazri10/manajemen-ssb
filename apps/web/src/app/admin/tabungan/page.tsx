'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const GET = gql`query GetTabungan { tabungan { id siswaId tanggal tipe jumlah keterangan } }`;
const GET_SISWA = gql`query GetSiswaTab { siswa { id namaLengkap } }`;
const CREATE = gql`mutation CreateTab($siswaId:ID!,$tanggal:String!,$tipe:String!,$jumlah:Float!,$keterangan:String) { createTabungan(siswaId:$siswaId,tanggal:$tanggal,tipe:$tipe,jumlah:$jumlah,keterangan:$keterangan) { id } }`;
const DELETE = gql`mutation DeleteTab($id:ID!) { deleteTabungan(id:$id) }`;

interface TabData { id: string; siswaId: string; tanggal: string; tipe: string; jumlah: number; keterangan?: string; }

export default function AdminTabunganPage() {
  const { data, loading, error, refetch } = useQuery<{ tabungan: TabData[] }>(GET, { fetchPolicy: 'cache-and-network' });
  const { data: siswaData } = useQuery<{ siswa: { id: string; namaLengkap: string }[] }>(GET_SISWA);
  const [createTab] = useMutation(CREATE);
  const [deleteTab] = useMutation(DELETE);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [f, setF] = useState({ siswaId: '', tanggal: new Date().toISOString().split('T')[0], tipe: 'simpan', jumlah: '', keterangan: '' });
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));
  const siswaMap = Object.fromEntries((siswaData?.siswa || []).map(s => [s.id, s.namaLengkap]));

  const handleDelete = async (i: TabData) => { if (!confirm('Hapus?')) return; try { await deleteTab({ variables: { id: i.id } }); toast.success('Dihapus.'); refetch(); } catch (e: any) { toast.error(e?.message); } };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try { await createTab({ variables: { ...f, jumlah: parseFloat(f.jumlah), keterangan: f.keterangan || undefined } }); toast.success('Ditambahkan.'); setDialogOpen(false); refetch(); } catch (e: any) { toast.error(e?.message); } finally { setSubmitting(false); }
  };

  const columns: ColumnDef<TabData>[] = [
    { header: 'Siswa', cell: i => siswaMap[i.siswaId] || '-', className: 'font-extrabold text-sm' },
    { header: 'Tanggal', accessorKey: 'tanggal', className: 'text-xs' },
    { header: 'Tipe', cell: i => <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${i.tipe === 'simpan' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>{i.tipe}</span> },
    { header: 'Jumlah', cell: i => `Rp ${Number(i.jumlah).toLocaleString('id')}`, className: 'text-xs font-bold' },
    { header: 'Keterangan', cell: i => i.keterangan || '-', className: 'text-xs' },
    { header: '', className: 'text-right w-12', cell: i => <Button onClick={() => handleDelete(i)} variant="ghost" size="sm" className="h-8 px-2 bg-destructive/10 border border-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></Button> },
  ];

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">Tabungan Siswa <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">Keuangan</span></h2>
        <p className="text-xs text-muted-foreground font-medium">Kelola simpanan dan penarikan tabungan siswa.</p>
      </div>
      {error ? <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs"><AlertCircle className="w-4 h-4" /><span className="font-bold">{error.message}</span></div> : (
        <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
          <DataTable data={data?.tabungan || []} columns={columns} loading={loading} searchPlaceholder="Cari..." searchKeys={['siswaId']} emptyMessage="Belum ada data." actions={<Button onClick={() => { setF({ siswaId: '', tanggal: new Date().toISOString().split('T')[0], tipe: 'simpan', jumlah: '', keterangan: '' }); setDialogOpen(true); }} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"><Plus className="w-3.5 h-3.5" /><span>Tambah</span></Button>} />
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">Tambah Tabungan</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Siswa</label><select value={f.siswaId} onChange={e => set('siswaId', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required><option value="">-- Pilih --</option>{(siswaData?.siswa || []).map(s => <option key={s.id} value={s.id}>{s.namaLengkap}</option>)}</select></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tanggal</label><input type="date" value={f.tanggal} onChange={e => set('tanggal', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required /></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tipe</label><select value={f.tipe} onChange={e => set('tipe', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"><option value="simpan">Simpan</option><option value="tarik">Tarik</option></select></div>
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
    </div>
  );
}
