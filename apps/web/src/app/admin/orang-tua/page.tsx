'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

const GET_ORANG_TUA = gql`
  query GetOrangTua {
    orangTua { id siswaId namaOrangTua hpOrangTua hpAyah hpIbu email hubungan }
  }
`;
const GET_SISWA = gql`
  query GetSiswaForOrangTua {
    siswa { id namaLengkap }
  }
`;
const CREATE_ORANG_TUA = gql`
  mutation CreateOrangTua($siswaId: ID!, $namaOrangTua: String!, $hpOrangTua: String!, $hpAyah: String, $hpIbu: String, $email: String, $hubungan: String) {
    createOrangTua(siswaId: $siswaId, namaOrangTua: $namaOrangTua, hpOrangTua: $hpOrangTua, hpAyah: $hpAyah, hpIbu: $hpIbu, email: $email, hubungan: $hubungan) { id }
  }
`;
const UPDATE_ORANG_TUA = gql`
  mutation UpdateOrangTua($id: ID!, $namaOrangTua: String, $hpOrangTua: String, $hpAyah: String, $hpIbu: String, $email: String, $hubungan: String) {
    updateOrangTua(id: $id, namaOrangTua: $namaOrangTua, hpOrangTua: $hpOrangTua, hpAyah: $hpAyah, hpIbu: $hpIbu, email: $email, hubungan: $hubungan) { id }
  }
`;
const DELETE_ORANG_TUA = gql`
  mutation DeleteOrangTua($id: ID!) { deleteOrangTua(id: $id) }
`;

interface OrangTuaData {
  id: string;
  siswaId: string;
  namaOrangTua: string;
  hpOrangTua: string;
  hpAyah?: string;
  hpIbu?: string;
  email?: string;
  hubungan?: string;
}
interface SiswaOption { id: string; namaLengkap: string; }

const emptyForm = { siswaId: '', namaOrangTua: '', hpOrangTua: '', hpAyah: '', hpIbu: '', email: '', hubungan: '' };

export default function AdminOrangTuaPage() {
  const { data, loading, error, refetch } = useQuery<{ orangTua: OrangTuaData[] }>(GET_ORANG_TUA, { fetchPolicy: 'cache-and-network' });
  const { data: siswaData } = useQuery<{ siswa: SiswaOption[] }>(GET_SISWA, { fetchPolicy: 'cache-and-network' });
  const [createOrangTua] = useMutation(CREATE_ORANG_TUA);
  const [updateOrangTua] = useMutation(UPDATE_ORANG_TUA);
  const [deleteOrangTua] = useMutation(DELETE_ORANG_TUA);
  const { ask, dialog } = useConfirmDialog();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<OrangTuaData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [f, setF] = useState(emptyForm);
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  const siswaList = siswaData?.siswa || [];
  const namaSiswa = (id: string) => siswaList.find(s => s.id === id)?.namaLengkap || '-';

  const openCreate = () => { setEditing(null); setF(emptyForm); setDialogOpen(true); };
  const openEdit = (item: OrangTuaData) => {
    setEditing(item);
    setF({
      siswaId: item.siswaId,
      namaOrangTua: item.namaOrangTua,
      hpOrangTua: item.hpOrangTua,
      hpAyah: item.hpAyah || '',
      hpIbu: item.hpIbu || '',
      email: item.email || '',
      hubungan: item.hubungan || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = (item: OrangTuaData) => ask({
    title: 'Hapus data orang tua?',
    description: `Data orang tua "${item.namaOrangTua}" akan dihapus permanen.`,
    onConfirm: async () => {
      try {
        await deleteOrangTua({ variables: { id: item.id } });
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
      if (editing) {
        await updateOrangTua({
          variables: {
            id: editing.id,
            namaOrangTua: f.namaOrangTua,
            hpOrangTua: f.hpOrangTua,
            hpAyah: optional(f.hpAyah),
            hpIbu: optional(f.hpIbu),
            email: optional(f.email),
            hubungan: optional(f.hubungan),
          },
        });
        toast.success('Diperbarui.');
      } else {
        await createOrangTua({
          variables: {
            siswaId: f.siswaId,
            namaOrangTua: f.namaOrangTua,
            hpOrangTua: f.hpOrangTua,
            hpAyah: optional(f.hpAyah),
            hpIbu: optional(f.hpIbu),
            email: optional(f.email),
            hubungan: optional(f.hubungan),
          },
        });
        toast.success('Ditambahkan.');
      }
      setDialogOpen(false);
      refetch();
    } catch (err: any) { toast.error(err?.message); } finally { setSubmitting(false); }
  };

  const columns: ColumnDef<OrangTuaData>[] = [
    { header: 'Nama Orang Tua/Wali', accessorKey: 'namaOrangTua', className: 'text-xs font-bold' },
    { header: 'Siswa', cell: i => namaSiswa(i.siswaId), className: 'text-xs' },
    { header: 'No. HP Utama', cell: i => i.hpOrangTua || '-', className: 'text-xs font-mono' },
    { header: 'HP Ayah', cell: i => i.hpAyah || '-', className: 'text-xs font-mono' },
    { header: 'HP Ibu', cell: i => i.hpIbu || '-', className: 'text-xs font-mono' },
    { header: 'Email', cell: i => i.email || '-', className: 'text-xs' },
    { header: 'Hubungan', cell: i => i.hubungan || '-', className: 'text-xs' },
    {
      header: '', className: 'text-right w-20', cell: i => (
        <div className="flex items-center justify-end gap-1.5">
          <Button onClick={() => openEdit(i)} variant="ghost" size="sm" className="h-8 px-2 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary rounded-lg cursor-pointer"><Pencil className="w-3.5 h-3.5" /></Button>
          <Button onClick={() => handleDelete(i)} variant="ghost" size="sm" className="h-8 px-2 bg-destructive/10 border border-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          Data Orang Tua <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">Operasional</span>
        </h2>
        <p className="text-xs text-muted-foreground font-medium">Kelola kontak orang tua/wali siswa (relasi ke data siswa).</p>
      </div>

      {error ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs">
          <AlertCircle className="w-4 h-4" /><span className="font-bold">{error.message}</span>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
          <DataTable
            data={data?.orangTua || []}
            columns={columns}
            loading={loading}
            searchPlaceholder="Cari nama orang tua..."
            searchKeys={['namaOrangTua', 'email', 'hpOrangTua']}
            emptyMessage="Belum ada data orang tua."
            actions={
              <Button onClick={openCreate} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer">
                <Plus className="w-3.5 h-3.5" /><span>Tambah</span>
              </Button>
            }
          />
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-lg rounded-2xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-black text-xl">{editing ? 'Edit Orang Tua/Wali' : 'Tambah Orang Tua/Wali'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editing && (
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
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Nama Orang Tua/Wali</label>
                <input type="text" value={f.namaOrangTua} onChange={e => set('namaOrangTua', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required />
              </div>
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Hubungan</label>
                <select value={f.hubungan} onChange={e => set('hubungan', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium">
                  <option value="">Pilih...</option>
                  <option value="ayah">Ayah</option>
                  <option value="ibu">Ibu</option>
                  <option value="wali">Wali</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">No. HP Utama</label>
                <input type="tel" value={f.hpOrangTua} onChange={e => set('hpOrangTua', e.target.value)} placeholder="08xxxxxxxxxx" className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required />
              </div>
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Email</label>
                <input type="email" value={f.email} onChange={e => set('email', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">HP Ayah</label>
                <input type="tel" value={f.hpAyah} onChange={e => set('hpAyah', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" />
              </div>
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">HP Ibu</label>
                <input type="tel" value={f.hpIbu} onChange={e => set('hpIbu', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" />
              </div>
            </div>
            <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <Button type="button" onClick={() => setDialogOpen(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer">Batal</Button>
              <Button type="submit" disabled={submitting} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2">
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{editing ? 'Simpan Perubahan' : 'Simpan'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {dialog}
    </div>
  );
}
