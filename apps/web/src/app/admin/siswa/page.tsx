'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Loader2, AlertCircle, Eye, Upload, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { exportToCsv } from '@/lib/export-csv';

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
  const { ask, dialog } = useConfirmDialog();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<SiswaData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const downloadSampleCSV = () => {
    const content = "Nama Lengkap,Tanggal Lahir,Kelompok Umur,No HP Ortu,NISN,NIK\nBagas Adi Nugroho,2014-04-12,U-12,08123456789,123456,12345678\nRonaldo Junior,2016-09-08,U-10,08129988776,,\nLionel Budi,2012-01-20,U-14,08124433221,123457,";
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "template-siswa.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Template CSV berhasil diunduh.");
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      toast.error("Pilih file CSV terlebih dahulu.");
      return;
    }

    setImporting(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvContent = event.target?.result as string;

      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        const activeSlug = localStorage.getItem('activeAkademiSlug');
        if (activeSlug) {
          headers['x-tenant-slug'] = activeSlug;
        }

        const response = await fetch(`${apiBaseUrl}/v1/siswa/import`, {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({ csvContent }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Gagal mengimpor file.");
        }

        toast.success(result.message || "Impor berhasil.");
        setImportDialogOpen(false);
        setCsvFile(null);
        refetch();
      } catch (err: any) {
        toast.error(err?.message || "Terjadi kesalahan saat mengimpor.");
      } finally {
        setImporting(false);
      }
    };

    reader.readAsText(csvFile);
  };

  const empty = { namaLengkap: '', namaPanggilan: '', nisn: '', nik: '', tanggalLahir: '', tempatLahir: '', jenisKelamin: 'L', agama: '', kelompokUmurId: '', posisiId: '', tinggiBadan: '', beratBadan: '', status: 'aktif', klubSebelumnya: '', provinsi: '', kabupaten: '', kecamatan: '', desa: '', alamatLengkap: '', catatan: '' };
  const [f, setF] = useState(empty);
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  const handleOpenCreate = () => { setFormMode('create'); setSelected(null); setF(empty); setDialogOpen(true); };
  const handleOpenEdit = (s: SiswaData) => {
    setFormMode('edit'); setSelected(s);
    setF({ namaLengkap: s.namaLengkap, namaPanggilan: s.namaPanggilan || '', nisn: s.nisn || '', nik: s.nik || '', tanggalLahir: s.tanggalLahir, tempatLahir: '', jenisKelamin: s.jenisKelamin || 'L', agama: '', kelompokUmurId: s.kelompokUmurId || '', posisiId: s.posisiId || '', tinggiBadan: '', beratBadan: '', status: s.status, klubSebelumnya: '', provinsi: '', kabupaten: '', kecamatan: '', desa: '', alamatLengkap: '', catatan: '' });
    setDialogOpen(true);
  };

  const handleDelete = (s: SiswaData) => ask({
    title: 'Hapus siswa?',
    description: `Data siswa "${s.namaLengkap}" akan dihapus permanen.`,
    onConfirm: async () => {
      try { await deleteSiswa({ variables: { id: s.id } }); toast.success(`"${s.namaLengkap}" dihapus.`); refetch(); }
      catch (e: any) { toast.error(e?.message || 'Gagal menghapus.'); }
    },
  });

  const handleExport = () => {
    const rows = (data?.siswa || []).map(s => ({
      namaLengkap: s.namaLengkap,
      namaPanggilan: s.namaPanggilan || '',
      nisn: s.nisn || '',
      nik: s.nik || '',
      tanggalLahir: s.tanggalLahir,
      jenisKelamin: s.jenisKelamin || '',
      kelompok: kuMap[s.kelompokUmurId || ''] || '',
      posisi: posMap[s.posisiId || ''] || '',
      status: s.status,
    }));
    exportToCsv('data-siswa', rows, [
      { key: 'namaLengkap', header: 'Nama Lengkap' },
      { key: 'namaPanggilan', header: 'Nama Panggilan' },
      { key: 'nisn', header: 'NISN' },
      { key: 'nik', header: 'NIK' },
      { key: 'tanggalLahir', header: 'Tanggal Lahir' },
      { key: 'jenisKelamin', header: 'Jenis Kelamin' },
      { key: 'kelompok', header: 'Kelompok Umur' },
      { key: 'posisi', header: 'Posisi' },
      { key: 'status', header: 'Status' },
    ]);
    toast.success('Data siswa diexport ke CSV.');
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
          <DataTable
            data={data?.siswa || []}
            columns={columns}
            loading={loading}
            searchPlaceholder="Cari siswa..."
            searchKeys={['namaLengkap', 'namaPanggilan', 'nisn']}
            emptyMessage="Belum ada siswa."
            actions={
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleExport}
                  variant="ghost"
                  className="border border-border bg-background hover:bg-muted text-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </Button>
                <Button
                  onClick={() => setImportDialogOpen(true)}
                  variant="outline"
                  className="border-border hover:bg-muted font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import CSV</span>
                </Button>
                <Button
                  onClick={handleOpenCreate}
                  className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Siswa</span>
                </Button>
              </div>
            }
          />
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

      {/* Dialog Import CSV */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-2xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-black text-xl">Import Siswa via CSV</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleImportSubmit} className="space-y-4">
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Panduan Kolom CSV:
              </p>
              <ul className="text-[10px] text-slate-400 font-medium space-y-1 list-disc list-inside">
                <li><strong className="text-white">Nama Lengkap</strong> (Wajib)</li>
                <li><strong className="text-white">Tanggal Lahir</strong> (Wajib, format: YYYY-MM-DD)</li>
                <li><strong>Kelompok Umur</strong> (Opsional, e.g. U-6, U-8, U-10, dst.)</li>
                <li><strong>No HP Ortu</strong> (Opsional)</li>
                <li><strong>NISN</strong> (Opsional)</li>
                <li><strong>NIK</strong> (Opsional)</li>
              </ul>
              <button
                type="button"
                onClick={downloadSampleCSV}
                className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider mt-1 block"
              >
                Unduh Template CSV →
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                Pilih File CSV
              </label>
              <input
                type="file"
                accept=".csv"
                required
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-indigo-600/20 file:text-indigo-400 hover:file:bg-indigo-600/30 cursor-pointer file:cursor-pointer border border-border rounded-xl p-2 bg-background focus:outline-none"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <Button
                type="button"
                onClick={() => {
                  setImportDialogOpen(false);
                  setCsvFile(null);
                }}
                className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={importing || !csvFile}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2"
              >
                {importing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Import</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {dialog}
    </div>
  );
}
