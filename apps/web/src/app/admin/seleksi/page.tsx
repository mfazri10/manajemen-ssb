'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Loader2, AlertCircle, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

const GET = gql`query GetSeleksi { seleksi { id nama tanggal lokasi keterangan } }`;
const GET_PESERTA = gql`query GetSeleksiP($seleksiId:ID!) { seleksiPeserta(seleksiId:$seleksiId) { id seleksiId siswaId status nilai catatan } }`;
const GET_SISWA = gql`query GetSiswaSel { siswa { id namaLengkap } }`;
const CREATE = gql`mutation CS($nama:String!,$tanggal:String,$lokasi:String,$keterangan:String) { createSeleksi(nama:$nama,tanggal:$tanggal,lokasi:$lokasi,keterangan:$keterangan) { id } }`;
const DELETE = gql`mutation DS($id:ID!) { deleteSeleksi(id:$id) }`;
const CREATE_P = gql`mutation CSP($seleksiId:ID!,$siswaId:ID!) { createSeleksiPeserta(seleksiId:$seleksiId,siswaId:$siswaId) { id } }`;
const UPDATE_P = gql`mutation USP($id:ID!,$status:String,$nilai:Float,$catatan:String) { updateSeleksiPeserta(id:$id,status:$status,nilai:$nilai,catatan:$catatan) { id } }`;
const DELETE_P = gql`mutation DSP($id:ID!) { deleteSeleksiPeserta(id:$id) }`;

const STATUS_COLOR: Record<string, string> = { daftar: 'bg-blue-500/10 text-blue-600', lulus: 'bg-green-500/10 text-green-600', tidak_lulus: 'bg-red-500/10 text-red-600' };

export default function AdminSeleksiPage() {
  const { data, loading, error, refetch } = useQuery<{ seleksi: any[] }>(GET, { fetchPolicy: 'cache-and-network' });
  const { data: siswaData } = useQuery<{ siswa: { id: string; namaLengkap: string }[] }>(GET_SISWA);
  const [create] = useMutation(CREATE);
  const [del] = useMutation(DELETE);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSeleksi, setSelectedSeleksi] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const empty = { nama: '', tanggal: '', lokasi: '', keterangan: '' };
  const [f, setF] = useState(empty);
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));
  const siswaMap = Object.fromEntries((siswaData?.siswa || []).map(s => [s.id, s.namaLengkap]));

  const handleDelete = async (i: any) => { if (!confirm('Hapus?')) return; try { await del({ variables: { id: i.id } }); toast.success('Dihapus.'); refetch(); } catch (e: any) { toast.error(e?.message); } };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const vars: Record<string, unknown> = { nama: f.nama };
      for (const [k, v] of Object.entries({ tanggal: f.tanggal, lokasi: f.lokasi, keterangan: f.keterangan })) { if (v) vars[k] = v; }
      await create({ variables: vars }); toast.success('Ditambahkan.'); setDialogOpen(false); refetch();
    } catch (e: any) { toast.error(e?.message); } finally { setSubmitting(false); }
  };

  const columns: ColumnDef<any>[] = [
    { header: 'Nama Seleksi', accessorKey: 'nama', className: 'font-extrabold text-sm' },
    { header: 'Tanggal', cell: i => i.tanggal || '-', className: 'text-xs' },
    { header: 'Lokasi', cell: i => i.lokasi || '-', className: 'text-xs' },
    { header: 'Aksi', className: 'text-right w-32', cell: i => (
      <div className="flex items-center justify-end gap-2">
        <Button onClick={() => setSelectedSeleksi(i.id)} variant="ghost" size="sm" className="h-8 px-2 text-2xs bg-muted border border-border rounded-lg cursor-pointer">Peserta</Button>
        <Button onClick={() => handleDelete(i)} variant="ghost" size="sm" className="h-8 px-2 bg-destructive/10 border border-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></Button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2"><UserCheck className="w-6 h-6 text-primary" /> Seleksi Pemain</h2>
        <p className="text-xs text-muted-foreground font-medium">Kelola seleksi dan penilaian pemain.</p>
      </div>
      {error ? <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs"><AlertCircle className="w-4 h-4" /><span className="font-bold">{error.message}</span></div> : (
        <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
          <DataTable data={data?.seleksi || []} columns={columns} loading={loading} searchPlaceholder="Cari..." searchKeys={['nama']} emptyMessage="Belum ada seleksi." actions={<Button onClick={() => { setF(empty); setDialogOpen(true); }} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"><Plus className="w-3.5 h-3.5" /><span>Tambah Seleksi</span></Button>} />
        </div>
      )}
      {selectedSeleksi && <PesertaTab seleksiId={selectedSeleksi} siswaMap={siswaMap} siswaList={siswaData?.siswa || []} />}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">Tambah Seleksi</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Nama</label><input type="text" value={f.nama} onChange={e => set('nama', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tanggal</label><input type="date" value={f.tanggal} onChange={e => set('tanggal', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Lokasi</label><input type="text" value={f.lokasi} onChange={e => set('lokasi', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
            </div>
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Keterangan</label><textarea value={f.keterangan} onChange={e => set('keterangan', e.target.value)} rows={2} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
            <DialogFooter className="pt-4 border-t border-border"><Button type="button" onClick={() => setDialogOpen(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer mr-2">Batal</Button><Button type="submit" disabled={submitting} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2">{submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}<span>Tambah</span></Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PesertaTab({ seleksiId, siswaMap, siswaList }: { seleksiId: string; siswaMap: Record<string, string>; siswaList: { id: string; namaLengkap: string }[] }) {
  const { data, loading, refetch } = useQuery<{ seleksiPeserta: any[] }>(GET_PESERTA, { variables: { seleksiId } });
  const [createP] = useMutation(CREATE_P);
  const [updateP] = useMutation(UPDATE_P);
  const [deleteP] = useMutation(DELETE_P);
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [siswaId, setSiswaId] = useState('');
  const [statusF, setStatusF] = useState('daftar');
  const [nilaiF, setNilaiF] = useState('');
  const [catatanF, setCatatanF] = useState('');

  const cols: ColumnDef<any>[] = [
    { header: 'Pemain', cell: i => siswaMap[i.siswaId] || '-', className: 'font-bold text-sm' },
    { header: 'Status', cell: i => <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[i.status] || ''}`}>{i.status.replace('_', ' ')}</span> },
    { header: 'Nilai', cell: i => i.nilai ?? '-', className: 'text-xs' },
    { header: 'Catatan', cell: i => i.catatan || '-', className: 'text-xs' },
    { header: 'Aksi', className: 'text-right w-24', cell: i => (
      <div className="flex items-center justify-end gap-1">
        <Button onClick={() => { setSelected(i); setStatusF(i.status); setNilaiF(i.nilai?.toString() || ''); setCatatanF(i.catatan || ''); setEditDialog(true); }} variant="ghost" size="sm" className="h-7 px-2 text-2xs bg-primary/10 border border-primary/20 text-primary rounded-lg cursor-pointer">Nilai</Button>
        <Button onClick={() => { deleteP({ variables: { id: i.id } }).then(() => { toast.success('Dihapus.'); refetch(); }); }} variant="ghost" size="sm" className="h-7 px-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg cursor-pointer"><Trash2 className="w-3 h-3" /></Button>
      </div>
    ) },
  ];

  return (
    <div className="bg-card border border-border rounded-md p-5 shadow-2xs space-y-4">
      <h3 className="text-sm font-black text-foreground">Peserta Seleksi</h3>
      <DataTable data={data?.seleksiPeserta || []} columns={cols} loading={loading} searchPlaceholder="" emptyMessage="Belum ada peserta." actions={<Button onClick={() => { setSiswaId(''); setAddDialog(true); }} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-8 px-2.5 text-2xs cursor-pointer"><Plus className="w-3 h-3" /><span>Tambah Peserta</span></Button>} />
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="bg-card border border-border text-foreground max-w-sm rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-lg">Tambah Peserta</DialogTitle></DialogHeader>
          <form onSubmit={async e => { e.preventDefault(); try { await createP({ variables: { seleksiId, siswaId } }); toast.success('Ditambahkan.'); setAddDialog(false); refetch(); } catch (e: any) { toast.error(e?.message); } }} className="space-y-4">
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Pemain</label><select value={siswaId} onChange={e => setSiswaId(e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium" required><option value="">-- Pilih --</option>{siswaList.map(s => <option key={s.id} value={s.id}>{s.namaLengkap}</option>)}</select></div>
            <DialogFooter><Button type="button" onClick={() => setAddDialog(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer mr-2">Batal</Button><Button type="submit" className="px-4 py-2 bg-primary text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer">Tambah</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="bg-card border border-border text-foreground max-w-sm rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-lg">Penilaian</DialogTitle></DialogHeader>
          <form onSubmit={async e => { e.preventDefault(); try { const vars: Record<string, unknown> = { id: selected.id, status: statusF }; if (nilaiF) vars.nilai = parseFloat(nilaiF); if (catatanF) vars.catatan = catatanF; await updateP({ variables: vars }); toast.success('Diperbarui.'); setEditDialog(false); refetch(); } catch (e: any) { toast.error(e?.message); } }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Status</label><select value={statusF} onChange={e => setStatusF(e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium">{['daftar', 'lulus', 'tidak_lulus'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Nilai</label><input type="number" step="0.01" value={nilaiF} onChange={e => setNilaiF(e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium" /></div>
            </div>
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Catatan</label><textarea value={catatanF} onChange={e => setCatatanF(e.target.value)} rows={2} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium" /></div>
            <DialogFooter><Button type="button" onClick={() => setEditDialog(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer mr-2">Batal</Button><Button type="submit" className="px-4 py-2 bg-primary text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer">Simpan</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
