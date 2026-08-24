'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Loader2, AlertCircle, Package, ArrowRightLeft, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { exportToCsv } from '@/lib/export-csv';

// ========== GraphQL ==========
const GET_DISTRIBUSI = gql`
  query GetInventarisDistribusi {
    inventarisDistribusi { id inventarisId siswaId jumlah tanggal status keterangan createdAt }
  }
`;
const GET_MUTASI = gql`
  query GetInventarisMutasi {
    inventarisMutasi { id inventarisId tipe jumlah tanggal keterangan createdAt }
  }
`;
const GET_INVENTARIS = gql`
  query GetInventarisForDetail {
    inventaris { id nama }
  }
`;
const GET_SISWA = gql`
  query GetSiswaForInventaris {
    siswa { id namaLengkap }
  }
`;

const CREATE_DISTRIBUSI = gql`
  mutation CreateInventarisDistribusi($inventarisId: ID!, $siswaId: ID, $jumlah: Int, $tanggal: String, $status: String, $keterangan: String) {
    createInventarisDistribusi(inventarisId: $inventarisId, siswaId: $siswaId, jumlah: $jumlah, tanggal: $tanggal, status: $status, keterangan: $keterangan) { id }
  }
`;
const UPDATE_DISTRIBUSI = gql`
  mutation UpdateInventarisDistribusi($id: ID!, $siswaId: ID, $jumlah: Int, $tanggal: String, $status: String, $keterangan: String) {
    updateInventarisDistribusi(id: $id, siswaId: $siswaId, jumlah: $jumlah, tanggal: $tanggal, status: $status, keterangan: $keterangan) { id }
  }
`;
const DELETE_DISTRIBUSI = gql`
  mutation DeleteInventarisDistribusi($id: ID!) { deleteInventarisDistribusi(id: $id) }
`;
const CREATE_MUTASI = gql`
  mutation CreateInventarisMutasi($inventarisId: ID!, $tipe: String!, $jumlah: Int!, $tanggal: String, $keterangan: String) {
    createInventarisMutasi(inventarisId: $inventarisId, tipe: $tipe, jumlah: $jumlah, tanggal: $tanggal, keterangan: $keterangan) { id }
  }
`;
const DELETE_MUTASI = gql`
  mutation DeleteInventarisMutasi($id: ID!) { deleteInventarisMutasi(id: $id) }
`;

// ========== Types ==========
interface DistribusiData {
  id: string;
  inventarisId: string;
  siswaId?: string;
  jumlah: number;
  tanggal: string;
  status: string;
  keterangan?: string;
  createdAt?: string;
}
interface MutasiData {
  id: string;
  inventarisId: string;
  tipe: string;
  jumlah: number;
  tanggal: string;
  keterangan?: string;
  createdAt?: string;
}
interface InventarisOption { id: string; nama: string; }
interface SiswaOption { id: string; namaLengkap: string; }

const STATUS_OPTIONS = ['dipinjam', 'dikembalikan', 'hilang', 'milik'];
const TIPE_OPTIONS = [
  { value: 'masuk', label: 'Masuk' },
  { value: 'keluar', label: 'Keluar' },
];

const emptyDistribusiForm = { inventarisId: '', siswaId: '', jumlah: '1', tanggal: '', status: 'dipinjam', keterangan: '' };
const emptyMutasiForm = { inventarisId: '', tipe: 'masuk', jumlah: '1', tanggal: '', keterangan: '' };

export default function AdminInventarisDetailPage() {
  // Queries
  const { data: distData, loading: distLoading, error: distError, refetch: refetchDist } = useQuery<{ inventarisDistribusi: DistribusiData[] }>(GET_DISTRIBUSI, { fetchPolicy: 'cache-and-network' });
  const { data: mutasiData, loading: mutasiLoading, error: mutasiError, refetch: refetchMutasi } = useQuery<{ inventarisMutasi: MutasiData[] }>(GET_MUTASI, { fetchPolicy: 'cache-and-network' });
  const { data: invData } = useQuery<{ inventaris: InventarisOption[] }>(GET_INVENTARIS, { fetchPolicy: 'cache-and-network' });
  const { data: siswaData } = useQuery<{ siswa: SiswaOption[] }>(GET_SISWA, { fetchPolicy: 'cache-and-network' });

  // Mutations
  const [createDistribusi] = useMutation(CREATE_DISTRIBUSI);
  const [updateDistribusi] = useMutation(UPDATE_DISTRIBUSI);
  const [deleteDistribusi] = useMutation(DELETE_DISTRIBUSI);
  const [createMutasi] = useMutation(CREATE_MUTASI);
  const [deleteMutasi] = useMutation(DELETE_MUTASI);

  const { ask, dialog } = useConfirmDialog();

  // State
  const [distDialogOpen, setDistDialogOpen] = useState(false);
  const [editingDist, setEditingDist] = useState<DistribusiData | null>(null);
  const [distSubmitting, setDistSubmitting] = useState(false);
  const [df, setDf] = useState(emptyDistribusiForm);
  const setDfField = (k: string, v: string) => setDf(p => ({ ...p, [k]: v }));

  const [mutasiDialogOpen, setMutasiDialogOpen] = useState(false);
  const [mutasiSubmitting, setMutasiSubmitting] = useState(false);
  const [mf, setMf] = useState(emptyMutasiForm);
  const setMfField = (k: string, v: string) => setMf(p => ({ ...p, [k]: v }));

  // Lookups
  const invList = invData?.inventaris || [];
  const siswaList = siswaData?.siswa || [];
  const namaInventaris = (id: string) => invList.find(i => i.id === id)?.nama || '-';
  const namaSiswa = (id: string | undefined) => id ? (siswaList.find(s => s.id === id)?.namaLengkap || '-') : '-';

  // ========== Distribusi handlers ==========
  const openCreateDist = () => { setEditingDist(null); setDf(emptyDistribusiForm); setDistDialogOpen(true); };
  const openEditDist = (item: DistribusiData) => {
    setEditingDist(item);
    setDf({
      inventarisId: item.inventarisId,
      siswaId: item.siswaId || '',
      jumlah: String(item.jumlah),
      tanggal: item.tanggal || '',
      status: item.status,
      keterangan: item.keterangan || '',
    });
    setDistDialogOpen(true);
  };

  const handleDeleteDist = (item: DistribusiData) => ask({
    title: 'Hapus data distribusi?',
    description: `Distribusi "${namaInventaris(item.inventarisId)}" akan dihapus permanen.`,
    onConfirm: async () => {
      try {
        await deleteDistribusi({ variables: { id: item.id } });
        toast.success('Dihapus.');
        refetchDist();
      } catch (e: any) { toast.error(e?.message); }
    },
  });

  const handleDistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDistSubmitting(true);
    try {
      const optional = (v: string) => (v.trim() ? v.trim() : undefined);
      const jumlahVal = parseInt(df.jumlah, 10);
      if (editingDist) {
        await updateDistribusi({
          variables: {
            id: editingDist.id,
            siswaId: optional(df.siswaId),
            jumlah: isNaN(jumlahVal) ? undefined : jumlahVal,
            tanggal: optional(df.tanggal),
            status: optional(df.status),
            keterangan: optional(df.keterangan),
          },
        });
        toast.success('Diperbarui.');
      } else {
        await createDistribusi({
          variables: {
            inventarisId: df.inventarisId,
            siswaId: optional(df.siswaId),
            jumlah: isNaN(jumlahVal) ? undefined : jumlahVal,
            tanggal: optional(df.tanggal),
            status: optional(df.status),
            keterangan: optional(df.keterangan),
          },
        });
        toast.success('Ditambahkan.');
      }
      setDistDialogOpen(false);
      refetchDist();
    } catch (err: any) { toast.error(err?.message); } finally { setDistSubmitting(false); }
  };

  // ========== Mutasi handlers ==========
  const openCreateMutasi = () => { setMf(emptyMutasiForm); setMutasiDialogOpen(true); };

  const handleDeleteMutasi = (item: MutasiData) => ask({
    title: 'Hapus data mutasi?',
    description: `Mutasi "${namaInventaris(item.inventarisId)}" (${item.tipe}) akan dihapus permanen.`,
    onConfirm: async () => {
      try {
        await deleteMutasi({ variables: { id: item.id } });
        toast.success('Dihapus.');
        refetchMutasi();
      } catch (e: any) { toast.error(e?.message); }
    },
  });

  const handleMutasiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMutasiSubmitting(true);
    try {
      const optional = (v: string) => (v.trim() ? v.trim() : undefined);
      const jumlahVal = parseInt(mf.jumlah, 10);
      await createMutasi({
        variables: {
          inventarisId: mf.inventarisId,
          tipe: mf.tipe,
          jumlah: jumlahVal,
          tanggal: optional(mf.tanggal),
          keterangan: optional(mf.keterangan),
        },
      });
      toast.success('Ditambahkan.');
      setMutasiDialogOpen(false);
      refetchMutasi();
    } catch (err: any) { toast.error(err?.message); } finally { setMutasiSubmitting(false); }
  };

  // ========== Export ==========
  const handleExportDist = () => {
    const rows = (distData?.inventarisDistribusi || []).map(d => ({
      inventaris: namaInventaris(d.inventarisId),
      siswa: namaSiswa(d.siswaId),
      jumlah: d.jumlah,
      tanggal: d.tanggal || '',
      status: d.status,
      keterangan: d.keterangan || '',
    }));
    exportToCsv('data-distribusi-inventaris', rows, [
      { key: 'inventaris', header: 'Inventaris' },
      { key: 'siswa', header: 'Siswa' },
      { key: 'jumlah', header: 'Jumlah' },
      { key: 'tanggal', header: 'Tanggal' },
      { key: 'status', header: 'Status' },
      { key: 'keterangan', header: 'Keterangan' },
    ]);
  };

  const handleExportMutasi = () => {
    const rows = (mutasiData?.inventarisMutasi || []).map(m => ({
      inventaris: namaInventaris(m.inventarisId),
      tipe: m.tipe === 'masuk' ? 'Masuk' : 'Keluar',
      jumlah: m.jumlah,
      tanggal: m.tanggal || '',
      keterangan: m.keterangan || '',
    }));
    exportToCsv('data-mutasi-inventaris', rows, [
      { key: 'inventaris', header: 'Inventaris' },
      { key: 'tipe', header: 'Tipe' },
      { key: 'jumlah', header: 'Jumlah' },
      { key: 'tanggal', header: 'Tanggal' },
      { key: 'keterangan', header: 'Keterangan' },
    ]);
  };

  // ========== Distribusi columns ==========
  const distColumns: ColumnDef<DistribusiData>[] = [
    { header: 'Inventaris', cell: i => namaInventaris(i.inventarisId), className: 'text-xs font-bold' },
    { header: 'Siswa', cell: i => namaSiswa(i.siswaId), className: 'text-xs' },
    { header: 'Jumlah', accessorKey: 'jumlah', className: 'text-xs text-center' },
    { header: 'Tanggal', cell: i => i.tanggal ? new Date(i.tanggal).toLocaleDateString('id-ID') : '-', className: 'text-xs' },
    {
      header: 'Status', cell: i => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-3xs font-black uppercase ${
          i.status === 'dikembalikan' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
          i.status === 'hilang' ? 'bg-destructive/10 text-destructive border border-destructive/20' :
          i.status === 'milik' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' :
          'bg-amber-500/10 text-amber-600 border border-amber-500/20'
        }`}>{i.status}</span>
      ), className: 'text-xs',
    },
    { header: 'Keterangan', cell: i => i.keterangan || '-', className: 'text-xs' },
    {
      header: '', className: 'text-right w-20', cell: i => (
        <div className="flex items-center justify-end gap-1.5">
          <Button onClick={() => openEditDist(i)} variant="ghost" size="sm" className="h-8 px-2 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary rounded-lg cursor-pointer"><Pencil className="w-3.5 h-3.5" /></Button>
          <Button onClick={() => handleDeleteDist(i)} variant="ghost" size="sm" className="h-8 px-2 bg-destructive/10 border border-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></Button>
        </div>
      ),
    },
  ];

  // ========== Mutasi columns ==========
  const mutasiColumns: ColumnDef<MutasiData>[] = [
    { header: 'Inventaris', cell: i => namaInventaris(i.inventarisId), className: 'text-xs font-bold' },
    {
      header: 'Tipe', cell: i => (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-black uppercase ${
          i.tipe === 'masuk' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-600 border border-orange-500/20'
        }`}>{i.tipe === 'masuk' ? 'Masuk' : 'Keluar'}</span>
      ), className: 'text-xs',
    },
    { header: 'Jumlah', accessorKey: 'jumlah', className: 'text-xs text-center' },
    { header: 'Tanggal', cell: i => i.tanggal ? new Date(i.tanggal).toLocaleDateString('id-ID') : '-', className: 'text-xs' },
    { header: 'Keterangan', cell: i => i.keterangan || '-', className: 'text-xs' },
    {
      header: '', className: 'text-right w-12', cell: i => (
        <div className="flex items-center justify-end gap-1.5">
          <Button onClick={() => handleDeleteMutasi(i)} variant="ghost" size="sm" className="h-8 px-2 bg-destructive/10 border border-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          Distribusi & Mutasi Inventaris <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">Inventaris</span>
        </h2>
        <p className="text-xs text-muted-foreground font-medium">Kelola distribusi inventaris ke siswa dan mutasi stok masuk/keluar.</p>
      </div>

      <Tabs defaultValue="distribusi">
        <TabsList>
          <TabsTrigger value="distribusi" className="text-xs font-bold gap-1.5"><Package className="w-3.5 h-3.5" />Distribusi</TabsTrigger>
          <TabsTrigger value="mutasi" className="text-xs font-bold gap-1.5"><ArrowRightLeft className="w-3.5 h-3.5" />Mutasi</TabsTrigger>
        </TabsList>

        {/* ========== DISTRIBUSI TAB ========== */}
        <TabsContent value="distribusi">
          {distError ? (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs">
              <AlertCircle className="w-4 h-4" /><span className="font-bold">{distError.message}</span>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
              <DataTable
                data={distData?.inventarisDistribusi || []}
                columns={distColumns}
                loading={distLoading}
                searchPlaceholder="Cari distribusi inventaris..."
                searchKeys={['inventarisId', 'siswaId', 'status']}
                emptyMessage="Belum ada data distribusi inventaris."
                actions={
                  <div className="flex items-center gap-2">
                    <Button onClick={handleExportDist} variant="outline" className="h-9 px-3 text-xs font-bold rounded-md gap-1.5 cursor-pointer">
                      <Download className="w-3.5 h-3.5" /><span>Export</span>
                    </Button>
                    <Button onClick={openCreateDist} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer">
                      <Plus className="w-3.5 h-3.5" /><span>Tambah</span>
                    </Button>
                  </div>
                }
              />
            </div>
          )}
        </TabsContent>

        {/* ========== MUTASI TAB ========== */}
        <TabsContent value="mutasi">
          {mutasiError ? (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs">
              <AlertCircle className="w-4 h-4" /><span className="font-bold">{mutasiError.message}</span>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
              <DataTable
                data={mutasiData?.inventarisMutasi || []}
                columns={mutasiColumns}
                loading={mutasiLoading}
                searchPlaceholder="Cari mutasi inventaris..."
                searchKeys={['inventarisId', 'tipe']}
                emptyMessage="Belum ada data mutasi inventaris."
                actions={
                  <div className="flex items-center gap-2">
                    <Button onClick={handleExportMutasi} variant="outline" className="h-9 px-3 text-xs font-bold rounded-md gap-1.5 cursor-pointer">
                      <Download className="w-3.5 h-3.5" /><span>Export</span>
                    </Button>
                    <Button onClick={openCreateMutasi} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer">
                      <Plus className="w-3.5 h-3.5" /><span>Tambah</span>
                    </Button>
                  </div>
                }
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ========== DISTRIBUSI DIALOG ========== */}
      <Dialog open={distDialogOpen} onOpenChange={setDistDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-lg rounded-2xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-black text-xl flex items-center gap-2"><Package className="w-5 h-5" />{editingDist ? 'Edit Distribusi' : 'Tambah Distribusi'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDistSubmit} className="space-y-4">
            {!editingDist && (
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Inventaris</label>
                <select
                  value={df.inventarisId}
                  onChange={e => setDfField('inventarisId', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
                  required
                >
                  <option value="">Pilih inventaris...</option>
                  {invList.map(i => <option key={i.id} value={i.id}>{i.nama}</option>)}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Siswa</label>
                <select
                  value={df.siswaId}
                  onChange={e => setDfField('siswaId', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
                >
                  <option value="">Pilih siswa (opsional)...</option>
                  {siswaList.map(s => <option key={s.id} value={s.id}>{s.namaLengkap}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Jumlah</label>
                <input type="number" min="1" value={df.jumlah} onChange={e => setDfField('jumlah', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tanggal</label>
                <input type="date" value={df.tanggal} onChange={e => setDfField('tanggal', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" />
              </div>
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Status</label>
                <select
                  value={df.status}
                  onChange={e => setDfField('status', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
                  required
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Keterangan</label>
              <input type="text" value={df.keterangan} onChange={e => setDfField('keterangan', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" />
            </div>
            <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <Button type="button" onClick={() => setDistDialogOpen(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer">Batal</Button>
              <Button type="submit" disabled={distSubmitting} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2">
                {distSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{editingDist ? 'Simpan Perubahan' : 'Simpan'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========== MUTASI DIALOG ========== */}
      <Dialog open={mutasiDialogOpen} onOpenChange={setMutasiDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-lg rounded-2xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-black text-xl flex items-center gap-2"><ArrowRightLeft className="w-5 h-5" />Tambah Mutasi</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMutasiSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Inventaris</label>
              <select
                value={mf.inventarisId}
                onChange={e => setMfField('inventarisId', e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
                required
              >
                <option value="">Pilih inventaris...</option>
                {invList.map(i => <option key={i.id} value={i.id}>{i.nama}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tipe</label>
                <select
                  value={mf.tipe}
                  onChange={e => setMfField('tipe', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
                  required
                >
                  {TIPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Jumlah</label>
                <input type="number" min="1" value={mf.jumlah} onChange={e => setMfField('jumlah', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required />
              </div>
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tanggal</label>
                <input type="date" value={mf.tanggal} onChange={e => setMfField('tanggal', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Keterangan</label>
              <input type="text" value={mf.keterangan} onChange={e => setMfField('keterangan', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" />
            </div>
            <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <Button type="button" onClick={() => setMutasiDialogOpen(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer">Batal</Button>
              <Button type="submit" disabled={mutasiSubmitting} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2">
                {mutasiSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
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
