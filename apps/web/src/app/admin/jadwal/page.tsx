'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const GET_JADWAL = gql`query GetJadwal { jadwalLatihan { id hari waktuMulai waktuSelesai lokasi materi tanggal kelompokUmurId status } }`;
const GET_KELOMPOK_UMUR = gql`query GetKUJ { kelompokUmur { id nama } }`;
const CREATE_JADWAL = gql`mutation CreateJadwal($hari:String,$waktuMulai:String,$waktuSelesai:String,$lokasi:String,$materi:String,$tanggal:String,$kelompokUmurId:ID,$status:String) { createJadwal(hari:$hari,waktuMulai:$waktuMulai,waktuSelesai:$waktuSelesai,lokasi:$lokasi,materi:$materi,tanggal:$tanggal,kelompokUmurId:$kelompokUmurId,status:$status) { id } }`;
const UPDATE_JADWAL = gql`mutation UpdateJadwal($id:ID!,$hari:String,$waktuMulai:String,$waktuSelesai:String,$lokasi:String,$materi:String,$tanggal:String,$kelompokUmurId:ID,$status:String) { updateJadwal(id:$id,hari:$hari,waktuMulai:$waktuMulai,waktuSelesai:$waktuSelesai,lokasi:$lokasi,materi:$materi,tanggal:$tanggal,kelompokUmurId:$kelompokUmurId,status:$status) { id } }`;
const DELETE_JADWAL = gql`mutation DeleteJadwal($id:ID!) { deleteJadwal(id:$id) }`;

interface JadwalData { id: string; hari?: string; waktuMulai?: string; waktuSelesai?: string; lokasi?: string; materi?: string; tanggal?: string; kelompokUmurId?: string; status: string; }
interface RefData { id: string; nama: string; }

const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export default function AdminJadwalPage() {
  const { data, loading, error, refetch } = useQuery<{ jadwalLatihan: JadwalData[] }>(GET_JADWAL, { fetchPolicy: 'cache-and-network' });
  const { data: kuData } = useQuery<{ kelompokUmur: RefData[] }>(GET_KELOMPOK_UMUR);
  const [createJadwal] = useMutation(CREATE_JADWAL);
  const [updateJadwal] = useMutation(UPDATE_JADWAL);
  const [deleteJadwal] = useMutation(DELETE_JADWAL);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<JadwalData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const empty = { hari: 'Senin', waktuMulai: '', waktuSelesai: '', lokasi: '', materi: '', tanggal: '', kelompokUmurId: '', status: 'aktif' };
  const [f, setF] = useState(empty);
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  const handleOpenCreate = () => { setFormMode('create'); setSelected(null); setF(empty); setDialogOpen(true); };
  const handleOpenEdit = (j: JadwalData) => { setFormMode('edit'); setSelected(j); setF({ hari: j.hari || 'Senin', waktuMulai: j.waktuMulai || '', waktuSelesai: j.waktuSelesai || '', lokasi: j.lokasi || '', materi: j.materi || '', tanggal: j.tanggal || '', kelompokUmurId: j.kelompokUmurId || '', status: j.status }); setDialogOpen(true); };
  const handleDelete = async (j: JadwalData) => { if (!confirm('Hapus jadwal ini?')) return; try { await deleteJadwal({ variables: { id: j.id } }); toast.success('Dihapus.'); refetch(); } catch (e: any) { toast.error(e?.message); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const vars: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(f)) { if (v !== '') vars[k] = v; }
      if (formMode === 'create') { await createJadwal({ variables: vars }); toast.success('Ditambahkan.'); }
      else { await updateJadwal({ variables: { id: selected!.id, ...vars } }); toast.success('Diperbarui.'); }
      setDialogOpen(false); refetch();
    } catch (e: any) { toast.error(e?.message); } finally { setSubmitting(false); }
  };

  const kuMap = Object.fromEntries((kuData?.kelompokUmur || []).map(k => [k.id, k.nama]));

  const columns: ColumnDef<JadwalData>[] = [
    { header: 'Hari', accessorKey: 'hari', className: 'font-extrabold text-sm' },
    { header: 'Waktu', cell: j => j.waktuMulai && j.waktuSelesai ? `${j.waktuMulai} - ${j.waktuSelesai}` : '-', className: 'text-xs' },
    { header: 'Lokasi', cell: j => j.lokasi || '-', className: 'text-xs' },
    { header: 'Kelompok', cell: j => kuMap[j.kelompokUmurId || ''] || '-', className: 'text-xs' },
    { header: 'Materi', cell: j => j.materi ? (j.materi.length > 30 ? j.materi.slice(0, 30) + '...' : j.materi) : '-', className: 'text-xs' },
    { header: 'Status', cell: j => <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${j.status === 'aktif' ? 'bg-green-500/10 text-green-600' : j.status === 'batal' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>{j.status}</span>, className: 'text-xs' },
    { header: 'Aksi', className: 'text-right w-24', cell: j => (
      <div className="flex items-center justify-end gap-2">
        <Button onClick={() => handleOpenEdit(j)} variant="ghost" size="sm" className="h-8 px-2 bg-background border border-border hover:bg-muted rounded-lg cursor-pointer"><Edit2 className="w-3.5 h-3.5 text-primary" /></Button>
        <Button onClick={() => handleDelete(j)} variant="ghost" size="sm" className="h-8 px-2 bg-destructive/10 border border-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></Button>
      </div>
    ) },
  ];

  const Field = ({ label, k, type = 'text', ...props }: { label: string; k: string; type?: string; [key: string]: any }) => (
    <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">{label}</label><input type={type} value={f[k as keyof typeof f]} onChange={e => set(k, e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" {...props} /></div>
  );

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">Jadwal Latihan <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">MVP</span></h2>
        <p className="text-xs text-muted-foreground font-medium">Kelola jadwal latihan per kelompok umur.</p>
      </div>
      {error ? <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs"><AlertCircle className="w-4 h-4" /><span className="font-bold">{error.message}</span></div> : (
        <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
          <DataTable data={data?.jadwalLatihan || []} columns={columns} loading={loading} searchPlaceholder="Cari jadwal..." searchKeys={['hari', 'lokasi', 'materi']} emptyMessage="Belum ada jadwal." actions={<Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"><Plus className="w-3.5 h-3.5" /><span>Tambah Jadwal</span></Button>} />
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-lg rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">{formMode === 'create' ? 'Tambah Jadwal' : 'Ubah Jadwal'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Hari</label><select value={f.hari} onChange={e => set('hari', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium">{HARI.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Kelompok Umur</label><select value={f.kelompokUmurId} onChange={e => set('kelompokUmurId', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"><option value="">-- Pilih --</option>{(kuData?.kelompokUmur || []).map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Waktu Mulai" k="waktuMulai" type="time" />
              <Field label="Waktu Selesai" k="waktuSelesai" type="time" />
              <Field label="Tanggal" k="tanggal" type="date" />
            </div>
            <Field label="Lokasi" k="lokasi" />
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Materi</label><textarea value={f.materi} onChange={e => set('materi', e.target.value)} rows={3} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Status</label><select value={f.status} onChange={e => set('status', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"><option value="aktif">Aktif</option><option value="batal">Batal</option><option value="selesai">Selesai</option></select></div>
            <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <Button type="button" onClick={() => setDialogOpen(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer">Batal</Button>
              <Button type="submit" disabled={submitting} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2">{submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}<span>{formMode === 'create' ? 'Tambah' : 'Simpan'}</span></Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
