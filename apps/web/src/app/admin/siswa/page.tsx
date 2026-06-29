'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Loader2, AlertCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';

const GET_SISWA = gql`query GetSiswa { siswa { id namaLengkap namaPanggilan nisn nik tanggalLahir jenisKelamin status kelompokUmurId posisiId } }`;
const GET_KELOMPOK_UMUR = gql`query GetKU { kelompokUmur { id nama } }`;
const GET_POSISI = gql`query GetPos { masterPosisi { id kode nama } }`;
const CREATE_SISWA = gql`mutation CreateSiswa($namaLengkap:String!,$tanggalLahir:String!,$namaPanggilan:String,$nisn:String,$nik:String,$tempatLahir:String,$jenisKelamin:String,$agama:String,$kelompokUmurId:ID,$posisiId:ID,$tinggiBadan:Float,$beratBadan:Float,$status:String,$klubSebelumnya:String,$provinsi:String,$kabupaten:String,$kecamatan:String,$desa:String,$alamatLengkap:String,$catatan:String) { createSiswa(namaLengkap:$namaLengkap,tanggalLahir:$tanggalLahir,namaPanggilan:$namaPanggilan,nisn:$nisn,nik:$nik,tempatLahir:$tempatLahir,jenisKelamin:$jenisKelamin,agama:$agama,kelompokUmurId:$kelompokUmurId,posisiId:$posisiId,tinggiBadan:$tinggiBadan,beratBadan:$beratBadan,status:$status,klubSebelumnya:$klubSebelumnya,provinsi:$provinsi,kabupaten:$kabupaten,kecamatan:$kecamatan,desa:$desa,alamatLengkap:$alamatLengkap,catatan:$catatan) { id namaLengkap } }`;
const UPDATE_SISWA = gql`mutation UpdateSiswa($id:ID!,$namaLengkap:String,$namaPanggilan:String,$nisn:String,$nik:String,$tempatLahir:String,$tanggalLahir:String,$jenisKelamin:String,$agama:String,$kelompokUmurId:ID,$posisiId:ID,$tinggiBadan:Float,$beratBadan:Float,$status:String,$klubSebelumnya:String,$provinsi:String,$kabupaten:String,$kecamatan:String,$desa:String,$alamatLengkap:String,$catatan:String) { updateSiswa(id:$id,namaLengkap:$namaLengkap,namaPanggilan:$namaPanggilan,nisn:$nisn,nik:$nik,tempatLahir:$tempatLahir,tanggalLahir:$tanggalLahir,jenisKelamin:$jenisKelamin,agama:$agama,kelompokUmurId:$kelompokUmurId,posisiId:$posisiId,tinggiBadan:$tinggiBadan,beratBadan:$beratBadan,status:$status,klubSebelumnya:$klubSebelumnya,provinsi:$provinsi,kabupaten:$kabupaten,kecamatan:$kecamatan,desa:$desa,alamatLengkap:$alamatLengkap,catatan:$catatan) { id namaLengkap } }`;
const DELETE_SISWA = gql`mutation DeleteSiswa($id:ID!) { deleteSiswa(id:$id) }`;

interface SiswaData {
  id: string; namaLengkap: string; namaPanggilan?: string; nisn?: string;
  nik?: string; tanggalLahir: string; jenisKelamin?: string; status: string;
  kelompokUmurId?: string; posisiId?: string;
}
interface RefData { id: string; nama: string; kode?: string; }

export default function AdminSiswaPage() {
  const { data, loading, error, refetch } = useQuery<{ siswa: SiswaData[] }>(GET_SISWA, { fetchPolicy: 'cache-and-network' });
  const { data: kuData } = useQuery<{ kelompokUmur: RefData[] }>(GET_KELOMPOK_UMUR);
  const { data: posData } = useQuery<{ masterPosisi: RefData[] }>(GET_POSISI);
  const [createSiswa] = useMutation(CREATE_SISWA);
  const [updateSiswa] = useMutation(UPDATE_SISWA);
  const [deleteSiswa] = useMutation(DELETE_SISWA);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<SiswaData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const empty = { namaLengkap: '', namaPanggilan: '', nisn: '', nik: '', tanggalLahir: '', tempatLahir: '', jenisKelamin: 'L', agama: '', kelompokUmurId: '', posisiId: '', tinggiBadan: '', beratBadan: '', status: 'aktif', klubSebelumnya: '', provinsi: '', kabupaten: '', kecamatan: '', desa: '', alamatLengkap: '', catatan: '' };
  const [f, setF] = useState(empty);
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  const handleOpenCreate = () => { setFormMode('create'); setSelected(null); setF(empty); setDialogOpen(true); };
  const handleOpenEdit = (s: SiswaData) => {
    setFormMode('edit'); setSelected(s);
    setF({ namaLengkap: s.namaLengkap, namaPanggilan: s.namaPanggilan || '', nisn: s.nisn || '', nik: s.nik || '', tanggalLahir: s.tanggalLahir, tempatLahir: '', jenisKelamin: s.jenisKelamin || 'L', agama: '', kelompokUmurId: s.kelompokUmurId || '', posisiId: s.posisiId || '', tinggiBadan: '', beratBadan: '', status: s.status, klubSebelumnya: '', provinsi: '', kabupaten: '', kecamatan: '', desa: '', alamatLengkap: '', catatan: '' });
    setDialogOpen(true);
  };

  const handleDelete = async (s: SiswaData) => {
    if (!confirm(`Hapus siswa "${s.namaLengkap}"?`)) return;
    try { await deleteSiswa({ variables: { id: s.id } }); toast.success(`"${s.namaLengkap}" dihapus.`); refetch(); }
    catch (e: any) { toast.error(e?.message || 'Gagal menghapus.'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const vars: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(f)) { if (v !== '') vars[k] = k === 'tinggiBadan' || k === 'beratBadan' ? parseFloat(v as string) : v; }
      if (formMode === 'create') { await createSiswa({ variables: vars }); toast.success('Siswa ditambahkan.'); }
      else { await updateSiswa({ variables: { id: selected!.id, ...vars } }); toast.success('Siswa diperbarui.'); }
      setDialogOpen(false); refetch();
    } catch (e: any) { toast.error(e?.message || 'Gagal.'); }
    finally { setSubmitting(false); }
  };

  const kuMap = Object.fromEntries((kuData?.kelompokUmur || []).map(k => [k.id, k.nama]));
  const posMap = Object.fromEntries((posData?.masterPosisi || []).map(p => [p.id, `${p.kode} - ${p.nama}`]));

  const columns: ColumnDef<SiswaData>[] = [
    { header: 'Nama', accessorKey: 'namaLengkap', className: 'font-extrabold text-sm' },
    { header: 'Panggilan', cell: s => s.namaPanggilan || '-', className: 'text-xs' },
    { header: 'NISN', cell: s => s.nisn || '-', className: 'font-mono text-xs' },
    { header: 'Tgl Lahir', cell: s => s.tanggalLahir, className: 'text-xs' },
    { header: 'Kelompok', cell: s => kuMap[s.kelompokUmurId || ''] || '-', className: 'text-xs' },
    { header: 'Posisi', cell: s => posMap[s.posisiId || ''] || '-', className: 'text-xs' },
    { header: 'Status', cell: s => (
      <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${s.status === 'aktif' ? 'bg-green-500/10 text-green-600' : s.status === 'pending' ? 'bg-amber-500/10 text-amber-600' : 'bg-muted text-muted-foreground'}`}>{s.status}</span>
    ), className: 'text-xs' },
    { header: 'Aksi', className: 'text-right w-24', cell: s => (
      <div className="flex items-center justify-end gap-2">
        <Button onClick={() => handleOpenEdit(s)} variant="ghost" size="sm" className="h-8 px-2 bg-background border border-border hover:bg-muted rounded-lg cursor-pointer"><Edit2 className="w-3.5 h-3.5 text-primary" /></Button>
        <Button onClick={() => handleDelete(s)} variant="ghost" size="sm" className="h-8 px-2 bg-destructive/10 border border-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></Button>
      </div>
    ) },
  ];

  const Field = ({ label, k, type = 'text', ...props }: { label: string; k: string; type?: string; [key: string]: any }) => (
    <div className="space-y-1">
      <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">{label}</label>
      <input type={type} value={f[k as keyof typeof f]} onChange={e => set(k, e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" {...props} />
    </div>
  );

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          Kelola Siswa <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">MVP</span>
        </h2>
        <p className="text-xs text-muted-foreground font-medium">Kelola data siswa akademi — profil, penempatan kelompok umur & posisi.</p>
      </div>

      {error ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs"><AlertCircle className="w-4 h-4" /><span className="font-bold">{error.message}</span></div>
      ) : (
        <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
          <DataTable data={data?.siswa || []} columns={columns} loading={loading} searchPlaceholder="Cari siswa..." searchKeys={['namaLengkap', 'namaPanggilan', 'nisn']} emptyMessage="Belum ada siswa." actions={<Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"><Plus className="w-3.5 h-3.5" /><span>Tambah Siswa</span></Button>} />
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-2xl rounded-2xl p-6 shadow-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-black text-xl">{formMode === 'create' ? 'Tambah Siswa' : 'Ubah Siswa'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nama Lengkap" k="namaLengkap" required />
              <Field label="Nama Panggilan" k="namaPanggilan" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="NISN" k="nisn" />
              <Field label="NIK" k="nik" />
              <Field label="Tempat Lahir" k="tempatLahir" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Tanggal Lahir" k="tanggalLahir" type="date" required />
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Jenis Kelamin</label>
                <select value={f.jenisKelamin} onChange={e => set('jenisKelamin', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium">
                  <option value="L">Laki-laki</option><option value="P">Perempuan</option>
                </select>
              </div>
              <Field label="Agama" k="agama" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Kelompok Umur</label>
                <select value={f.kelompokUmurId} onChange={e => set('kelompokUmurId', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium">
                  <option value="">-- Pilih --</option>
                  {(kuData?.kelompokUmur || []).map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Posisi</label>
                <select value={f.posisiId} onChange={e => set('posisiId', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium">
                  <option value="">-- Pilih --</option>
                  {(posData?.masterPosisi || []).map(p => <option key={p.id} value={p.id}>{p.kode} - {p.nama}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <Field label="Tinggi (cm)" k="tinggiBadan" type="number" />
              <Field label="Berat (kg)" k="beratBadan" type="number" />
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Status</label>
                <select value={f.status} onChange={e => set('status', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium">
                  <option value="aktif">Aktif</option><option value="pending">Pending</option><option value="nonaktif">Nonaktif</option><option value="alumni">Alumni</option>
                </select>
              </div>
              <Field label="Klub Sebelumnya" k="klubSebelumnya" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <Field label="Provinsi" k="provinsi" /><Field label="Kabupaten" k="kabupaten" /><Field label="Kecamatan" k="kecamatan" /><Field label="Desa" k="desa" />
            </div>
            <Field label="Alamat Lengkap" k="alamatLengkap" />
            <Field label="Catatan" k="catatan" />
            <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <Button type="button" onClick={() => setDialogOpen(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer">Batal</Button>
              <Button type="submit" disabled={submitting} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2">
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}<span>{formMode === 'create' ? 'Tambah' : 'Simpan'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
