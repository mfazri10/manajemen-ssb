'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Loader2, AlertCircle, UserCheck, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { exportToCsv } from '@/lib/export-csv';

const GET_ABSENSI = gql`query GetAbsensi { absensi { id jadwalId siswaId tanggal status keterangan } }`;
const GET_SISWA = gql`query GetSiswaA { siswa { id namaLengkap } }`;
const GET_JADWAL = gql`query GetJadwalA { jadwalLatihan { id hari waktuMulai lokasi } }`;
const CREATE_ABSENSI = gql`mutation CreateAbsensi($jadwalId:ID!,$siswaId:ID!,$tanggal:String!,$status:String!,$keterangan:String) { createAbsensi(jadwalId:$jadwalId,siswaId:$siswaId,tanggal:$tanggal,status:$status,keterangan:$keterangan) { id } }`;
const UPDATE_ABSENSI = gql`mutation UpdateAbsensi($id:ID!,$status:String,$keterangan:String,$tanggal:String) { updateAbsensi(id:$id,status:$status,keterangan:$keterangan,tanggal:$tanggal) { id } }`;
const DELETE_ABSENSI = gql`mutation DeleteAbsensi($id:ID!) { deleteAbsensi(id:$id) }`;

interface AbsensiData { id: string; jadwalId: string; siswaId: string; tanggal: string; status: string; keterangan?: string; }
interface RefData { id: string; namaLengkap?: string; nama?: string; hari?: string; waktuMulai?: string; lokasi?: string; }

const STATUS_OPTIONS = ['hadir', 'izin', 'sakit', 'alpha'];

export default function AdminAbsensiPage() {
  const { data, loading, error, refetch } = useQuery<{ absensi: AbsensiData[] }>(GET_ABSENSI, { fetchPolicy: 'cache-and-network' });
  const { data: siswaData } = useQuery<{ siswa: RefData[] }>(GET_SISWA);
  const { data: jadwalData } = useQuery<{ jadwalLatihan: RefData[] }>(GET_JADWAL);
  const [createAbsensi] = useMutation(CREATE_ABSENSI);
  const [updateAbsensi] = useMutation(UPDATE_ABSENSI);
  const [deleteAbsensi] = useMutation(DELETE_ABSENSI);
  const { ask, dialog } = useConfirmDialog();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<AbsensiData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const empty = { jadwalId: '', siswaId: '', tanggal: '', status: 'hadir', keterangan: '' };
  const [f, setF] = useState(empty);
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  // === Absensi batch (massal) ===
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchJadwal, setBatchJadwal] = useState('');
  const [batchTanggal, setBatchTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [batchStatus, setBatchStatus] = useState('hadir');
  const [batchBusy, setBatchBusy] = useState(false);

  const siswaList = siswaData?.siswa || [];
  const absensiList = data?.absensi || [];

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchJadwal || siswaList.length === 0) return;
    setBatchBusy(true);
    try {
      // Lewati siswa yang sudah punya catatan absensi untuk jadwal+tanggal ini
      const sudahAda = new Set(absensiList.filter(a => a.jadwalId === batchJadwal && a.tanggal === batchTanggal).map(a => a.siswaId));
      const target = siswaList.filter(s => !sudahAda.has(s.id));
      if (target.length === 0) {
        toast.info('Semua siswa sudah memiliki absensi untuk sesi ini.');
      } else {
        let ok = 0;
        for (const s of target) {
          try {
            await createAbsensi({ variables: { jadwalId: batchJadwal, siswaId: s.id, tanggal: batchTanggal, status: batchStatus } });
            ok += 1;
          } catch { /* lanjutkan untuk siswa berikutnya */ }
        }
        toast.success(`Absensi batch tersimpan untuk ${ok} siswa.`);
        refetch();
        setBatchOpen(false);
      }
    } finally {
      setBatchBusy(false);
    }
  };

  const handleOpenCreate = () => { setFormMode('create'); setSelected(null); setF(empty); setDialogOpen(true); };
  const handleOpenEdit = (a: AbsensiData) => { setFormMode('edit'); setSelected(a); setF({ jadwalId: a.jadwalId, siswaId: a.siswaId, tanggal: a.tanggal, status: a.status, keterangan: a.keterangan || '' }); setDialogOpen(true); };
  const handleDelete = (a: AbsensiData) => ask({
    title: 'Hapus data absensi?',
    description: `Catatan absensi ${siswaMap[a.siswaId] || 'siswa'} tanggal ${a.tanggal} akan dihapus permanen.`,
    onConfirm: async () => {
      try { await deleteAbsensi({ variables: { id: a.id } }); toast.success('Dihapus.'); refetch(); } catch (e: any) { toast.error(e?.message); }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (formMode === 'create') { await createAbsensi({ variables: { ...f, keterangan: f.keterangan || undefined } }); toast.success('Ditambahkan.'); }
      else { await updateAbsensi({ variables: { id: selected!.id, status: f.status, keterangan: f.keterangan || undefined, tanggal: f.tanggal } }); toast.success('Diperbarui.'); }
      setDialogOpen(false); refetch();
    } catch (e: any) { toast.error(e?.message); } finally { setSubmitting(false); }
  };

  const handleExport = () => {
    exportToCsv('rekap-absensi', absensiList.map(a => ({
      siswa: siswaMap[a.siswaId] || '',
      jadwal: jadwalMap[a.jadwalId] || '',
      tanggal: a.tanggal,
      status: a.status,
      keterangan: a.keterangan || '',
    })), [
      { key: 'siswa', header: 'Siswa' },
      { key: 'jadwal', header: 'Jadwal' },
      { key: 'tanggal', header: 'Tanggal' },
      { key: 'status', header: 'Status' },
      { key: 'keterangan', header: 'Keterangan' },
    ]);
    toast.success('Rekap absensi diexport ke CSV.');
  };

  const siswaMap = Object.fromEntries(siswaList.map(s => [s.id, s.namaLengkap || '']));
  const jadwalMap = Object.fromEntries((jadwalData?.jadwalLatihan || []).map(j => [j.id, `${j.hari || ''} ${j.waktuMulai || ''} ${j.lokasi ? '- ' + j.lokasi : ''}`.trim()]));

  const statusColor: Record<string, string> = { hadir: 'bg-green-500/10 text-green-600', izin: 'bg-blue-500/10 text-blue-600', sakit: 'bg-amber-500/10 text-amber-600', alpha: 'bg-destructive/10 text-destructive' };

  const columns: ColumnDef<AbsensiData>[] = [
    { header: 'Siswa', cell: a => siswaMap[a.siswaId] || '-', className: 'font-extrabold text-sm' },
    { header: 'Jadwal', cell: a => jadwalMap[a.jadwalId] || '-', className: 'text-xs' },
    { header: 'Tanggal', accessorKey: 'tanggal', className: 'text-xs' },
    { header: 'Status', cell: a => <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${statusColor[a.status] || ''}`}>{a.status}</span>, className: 'text-xs' },
    { header: 'Keterangan', cell: a => a.keterangan || '-', className: 'text-xs' },
    { header: 'Aksi', className: 'text-right w-24', cell: a => (
      <div className="flex items-center justify-end gap-2">
        <Button onClick={() => handleOpenEdit(a)} variant="ghost" size="sm" className="h-8 px-2 bg-background border border-border hover:bg-muted rounded-lg cursor-pointer"><Edit2 className="w-3.5 h-3.5 text-primary" /></Button>
        <Button onClick={() => handleDelete(a)} variant="ghost" size="sm" className="h-8 px-2 bg-destructive/10 border border-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></Button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">Absensi Latihan <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">MVP</span></h2>
        <p className="text-xs text-muted-foreground font-medium">Input dan kelola absensi siswa per sesi latihan — termasuk absensi batch seluruh siswa.</p>
      </div>
      {error ? <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs"><AlertCircle className="w-4 h-4" /><span className="font-bold">{error.message}</span></div> : (
        <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
          <DataTable data={absensiList} columns={columns} loading={loading} searchPlaceholder="Cari absensi..." searchKeys={['tanggal', 'status']} emptyMessage="Belum ada data absensi." actions={
            <div className="flex items-center gap-2">
              <Button onClick={handleExport} variant="ghost" className="border border-border bg-background hover:bg-muted text-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"><Download className="w-3.5 h-3.5" /><span>Export CSV</span></Button>
              <Button onClick={() => setBatchOpen(true)} variant="outline" className="border-border hover:bg-muted font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"><UserCheck className="w-3.5 h-3.5" /><span>Absensi Batch</span></Button>
              <Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"><Plus className="w-3.5 h-3.5" /><span>Input Absensi</span></Button>
            </div>
          } />
        </div>
      )}

      {/* Dialog absensi per siswa */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">{formMode === 'create' ? 'Input Absensi' : 'Ubah Absensi'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Jadwal</label><select value={f.jadwalId} onChange={e => set('jadwalId', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required><option value="">-- Pilih Jadwal --</option>{(jadwalData?.jadwalLatihan || []).map(j => <option key={j.id} value={j.id}>{jadwalMap[j.id]}</option>)}</select></div>
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Siswa</label><select value={f.siswaId} onChange={e => set('siswaId', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required><option value="">-- Pilih Siswa --</option>{siswaList.map(s => <option key={s.id} value={s.id}>{s.namaLengkap}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tanggal</label><input type="date" value={f.tanggal} onChange={e => set('tanggal', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required /></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Status</label><select value={f.status} onChange={e => set('status', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium">{STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select></div>
            </div>
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Keterangan</label><textarea value={f.keterangan} onChange={e => set('keterangan', e.target.value)} rows={2} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
            <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <Button type="button" onClick={() => setDialogOpen(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer">Batal</Button>
              <Button type="submit" disabled={submitting} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2">{submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}<span>{formMode === 'create' ? 'Tambah' : 'Simpan'}</span></Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog absensi batch */}
      <Dialog open={batchOpen} onOpenChange={setBatchOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">Absensi Batch</DialogTitle></DialogHeader>
          <p className="text-3xs text-muted-foreground font-medium -mt-2">Tandai seluruh siswa sekaligus untuk satu sesi latihan. Siswa yang sudah punya catatan pada sesi ini otomatis dilewati.</p>
          <form onSubmit={handleBatchSubmit} className="space-y-4">
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Jadwal</label><select value={batchJadwal} onChange={e => setBatchJadwal(e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required><option value="">-- Pilih Jadwal --</option>{(jadwalData?.jadwalLatihan || []).map(j => <option key={j.id} value={j.id}>{jadwalMap[j.id]}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tanggal</label><input type="date" value={batchTanggal} onChange={e => setBatchTanggal(e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required /></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Status Default</label><select value={batchStatus} onChange={e => setBatchStatus(e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium">{STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select></div>
            </div>
            <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <Button type="button" onClick={() => setBatchOpen(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer">Batal</Button>
              <Button type="submit" disabled={batchBusy} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2">{batchBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}<span>Simpan Untuk {siswaList.length} Siswa</span></Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {dialog}
    </div>
  );
}
