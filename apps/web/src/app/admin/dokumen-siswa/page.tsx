'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Loader2, AlertCircle, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { exportToCsv } from '@/lib/export-csv';

const GET_DOKUMEN_SISWA = gql`
  query GetDokumenSiswa {
    dokumenSiswa { id siswaId jenis fileUrl namaFile uploadedAt }
  }
`;
const GET_SISWA = gql`
  query GetSiswaForDokumen {
    siswa { id namaLengkap }
  }
`;
const CREATE_DOKUMEN_SISWA = gql`
  mutation CreateDokumenSiswa($siswaId: ID!, $jenis: String!, $fileUrl: String!, $namaFile: String) {
    createDokumenSiswa(siswaId: $siswaId, jenis: $jenis, fileUrl: $fileUrl, namaFile: $namaFile) { id }
  }
`;
const DELETE_DOKUMEN_SISWA = gql`
  mutation DeleteDokumenSiswa($id: ID!) { deleteDokumenSiswa(id: $id) }
`;

interface DokumenData {
  id: string;
  siswaId: string;
  jenis: string;
  fileUrl: string;
  namaFile?: string;
  uploadedAt?: string;
}
interface SiswaOption { id: string; namaLengkap: string; }

const JENIS_OPTIONS = [
  { value: 'akta', label: 'Akta Kelahiran' },
  { value: 'kk', label: 'Kartu Keluarga' },
  { value: 'nisn', label: 'NISN' },
  { value: 'kartu_pelajar', label: 'Kartu Pelajar' },
  { value: 'raport', label: 'Raport' },
];

const jenisLabel = (v: string) => JENIS_OPTIONS.find(o => o.value === v)?.label || v;

const emptyForm = { siswaId: '', jenis: '', fileUrl: '', namaFile: '' };

export default function AdminDokumenSiswaPage() {
  const { data, loading, error, refetch } = useQuery<{ dokumenSiswa: DokumenData[] }>(GET_DOKUMEN_SISWA, { fetchPolicy: 'cache-and-network' });
  const { data: siswaData } = useQuery<{ siswa: SiswaOption[] }>(GET_SISWA, { fetchPolicy: 'cache-and-network' });
  const [createDokumen] = useMutation(CREATE_DOKUMEN_SISWA);
  const [deleteDokumen] = useMutation(DELETE_DOKUMEN_SISWA);
  const { ask, dialog } = useConfirmDialog();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [f, setF] = useState(emptyForm);
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  const siswaList = siswaData?.siswa || [];
  const namaSiswa = (id: string) => siswaList.find(s => s.id === id)?.namaLengkap || '-';

  const openCreate = () => { setF(emptyForm); setDialogOpen(true); };

  const handleDelete = (item: DokumenData) => ask({
    title: 'Hapus dokumen?',
    description: `Dokumen "${item.namaFile || item.jenis}" akan dihapus permanen.`,
    onConfirm: async () => {
      try {
        await deleteDokumen({ variables: { id: item.id } });
        toast.success('Dihapus.');
        refetch();
      } catch (e: any) { toast.error(e?.message); }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const optional = (v: string) => (v.trim() ? v.trim() : undefined);
      await createDokumen({
        variables: {
          siswaId: f.siswaId,
          jenis: f.jenis,
          fileUrl: f.fileUrl,
          namaFile: optional(f.namaFile),
        },
      });
      toast.success('Ditambahkan.');
      setDialogOpen(false);
      refetch();
    } catch (err: any) { toast.error(err?.message); } finally { setSubmitting(false); }
  };

  const handleExport = () => {
    const rows = (data?.dokumenSiswa || []).map(d => ({
      siswa: namaSiswa(d.siswaId),
      jenis: jenisLabel(d.jenis),
      namaFile: d.namaFile || '',
      fileUrl: d.fileUrl,
      uploadedAt: d.uploadedAt || '',
    }));
    exportToCsv('data-dokumen-siswa', rows, [
      { key: 'siswa', header: 'Siswa' },
      { key: 'jenis', header: 'Jenis Dokumen' },
      { key: 'namaFile', header: 'Nama File' },
      { key: 'fileUrl', header: 'URL File' },
      { key: 'uploadedAt', header: 'Tanggal Upload' },
    ]);
  };

  const columns: ColumnDef<DokumenData>[] = [
    { header: 'Siswa', cell: i => namaSiswa(i.siswaId), className: 'text-xs font-bold' },
    { header: 'Jenis Dokumen', cell: i => jenisLabel(i.jenis), className: 'text-xs' },
    { header: 'Nama File', cell: i => i.namaFile || '-', className: 'text-xs' },
    { header: 'URL File', cell: i => <span className="truncate max-w-48 inline-block" title={i.fileUrl}>{i.fileUrl}</span>, className: 'text-xs font-mono' },
    { header: 'Tanggal Upload', cell: i => i.uploadedAt ? new Date(i.uploadedAt).toLocaleDateString('id-ID') : '-', className: 'text-xs' },
    {
      header: '', className: 'text-right w-12', cell: i => (
        <div className="flex items-center justify-end gap-1.5">
          <Button onClick={() => handleDelete(i)} variant="ghost" size="sm" className="h-8 px-2 bg-destructive/10 border border-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          Dokumen Siswa <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">Administrasi</span>
        </h2>
        <p className="text-xs text-muted-foreground font-medium">Kelola dokumen digital siswa (akta, KK, NISN, raport, dll).</p>
      </div>

      {error ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs">
          <AlertCircle className="w-4 h-4" /><span className="font-bold">{error.message}</span>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
          <DataTable
            data={data?.dokumenSiswa || []}
            columns={columns}
            loading={loading}
            searchPlaceholder="Cari dokumen atau nama siswa..."
            searchKeys={['siswaId', 'jenis', 'namaFile']}
            emptyMessage="Belum ada dokumen siswa."
            actions={
              <div className="flex items-center gap-2">
                <Button onClick={handleExport} variant="outline" className="h-9 px-3 text-xs font-bold rounded-md gap-1.5 cursor-pointer">
                  <Download className="w-3.5 h-3.5" /><span>Export</span>
                </Button>
                <Button onClick={openCreate} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /><span>Tambah</span>
                </Button>
              </div>
            }
          />
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-lg rounded-2xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-black text-xl flex items-center gap-2"><FileText className="w-5 h-5" />Tambah Dokumen Siswa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Siswa</label>
              <select
                value={f.siswaId}
                onChange={e => set('siswaId', e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
                required
              >
                <option value="">Pilih siswa...</option>
                {siswaList.map(s => <option key={s.id} value={s.id}>{s.namaLengkap}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Jenis Dokumen</label>
              <select
                value={f.jenis}
                onChange={e => set('jenis', e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
                required
              >
                <option value="">Pilih jenis...</option>
                {JENIS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">URL File</label>
              <input type="text" value={f.fileUrl} onChange={e => set('fileUrl', e.target.value)} placeholder="https://... atau path file" className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required />
            </div>
            <div className="space-y-1">
              <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Nama File (opsional)</label>
              <input type="text" value={f.namaFile} onChange={e => set('namaFile', e.target.value)} placeholder="contoh: akta-kelahiran.pdf" className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" />
            </div>
            <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <Button type="button" onClick={() => setDialogOpen(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer">Batal</Button>
              <Button type="submit" disabled={submitting} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2">
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Simpan</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {dialog}
    </div>
  );
}
