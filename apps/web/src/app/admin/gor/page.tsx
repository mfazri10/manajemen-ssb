'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Trash2, Loader2, AlertCircle, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const GET_GOR = gql`query { gor { id nama kota alamat telepon jamBuka jamTutup status } }`;
const CREATE_GOR = gql`mutation CreateGor($nama:String!,$kota:String,$alamat:String,$telepon:String,$jamBuka:String,$jamTutup:String,$status:String){ createGor(nama:$nama,kota:$kota,alamat:$alamat,telepon:$telepon,jamBuka:$jamBuka,jamTutup:$jamTutup,status:$status){ id } }`;
const UPDATE_GOR = gql`mutation UpdateGor($id:ID!,$nama:String,$kota:String,$alamat:String,$telepon:String,$jamBuka:String,$jamTutup:String,$status:String){ updateGor(id:$id,nama:$nama,kota:$kota,alamat:$alamat,telepon:$telepon,jamBuka:$jamBuka,jamTutup:$jamTutup,status:$status){ id } }`;
const DELETE_GOR = gql`mutation DeleteGor($id:ID!){ deleteGor(id:$id) }`;

interface GorData {
  id: string; nama: string; kota?: string; alamat?: string; telepon?: string;
  jamBuka?: string; jamTutup?: string; status?: string;
}

const empty = { nama: '', kota: '', alamat: '', telepon: '', jamBuka: '', jamTutup: '', status: 'aktif' };

export default function GorPage() {
  const { data, loading, error, refetch } = useQuery<{ gor: GorData[] }>(GET_GOR, { fetchPolicy: 'cache-and-network' });
  const [createGor] = useMutation(CREATE_GOR);
  const [updateGor] = useMutation(UPDATE_GOR);
  const [deleteGor] = useMutation(DELETE_GOR);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<GorData | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setFormMode('create'); setSelected(null); setForm(empty); setDialogOpen(true); };
  const openEdit = (row: GorData) => {
    setFormMode('edit'); setSelected(row);
    setForm({
      nama: row.nama || '', kota: row.kota || '', alamat: row.alamat || '', telepon: row.telepon || '',
      jamBuka: row.jamBuka || '', jamTutup: row.jamTutup || '', status: row.status || 'aktif',
    });
    setDialogOpen(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim()) { toast.error('Nama GOR wajib diisi.'); return; }
    setSaving(true);
    try {
      if (formMode === 'create') { await createGor({ variables: { ...form } }); toast.success('GOR ditambahkan.'); }
      else { await updateGor({ variables: { id: selected!.id, ...form } }); toast.success('GOR diperbarui.'); }
      setDialogOpen(false); refetch();
    } catch (err: any) { toast.error(err?.message || 'Gagal menyimpan.'); }
    finally { setSaving(false); }
  };

  const onDelete = async (row: GorData) => {
    if (!confirm(`Hapus GOR "${row.nama}"?`)) return;
    try { await deleteGor({ variables: { id: row.id } }); toast.success('GOR dihapus.'); refetch(); }
    catch (err: any) { toast.error(err?.message || 'Gagal menghapus.'); }
  };

  const columns: ColumnDef<GorData>[] = [
    { header: 'Nama', accessorKey: 'nama' },
    { header: 'Kota', accessorKey: 'kota' },
    { header: 'Telepon', accessorKey: 'telepon' },
    { header: 'Jam Buka', accessorKey: 'jamBuka' },
    { header: 'Jam Tutup', accessorKey: 'jamTutup' },
    { header: 'Status', accessorKey: 'status' },
    {
      header: 'Aksi',
      cell: (row: any) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => openEdit(row)}><Edit2 className="h-4 w-4" /></Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(row)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-emerald-600" />
          <h1 className="text-2xl font-bold">Data GOR</h1>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Tambah GOR</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{formMode === 'create' ? 'Tambah GOR' : 'Edit GOR'}</DialogTitle></DialogHeader>
            <form onSubmit={onSubmit} className="space-y-3">
              <div><Label>Nama *</Label><Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Kota</Label><Input value={form.kota} onChange={(e) => setForm({ ...form, kota: e.target.value })} /></div>
                <div><Label>Telepon</Label><Input value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })} /></div>
              </div>
              <div><Label>Alamat</Label><Input value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Jam Buka</Label><Input type="time" value={form.jamBuka} onChange={(e) => setForm({ ...form, jamBuka: e.target.value })} /></div>
                <div><Label>Jam Tutup</Label><Input type="time" value={form.jamTutup} onChange={(e) => setForm({ ...form, jamTutup: e.target.value })} /></div>
              </div>
              <div><Label>Status</Label><Input value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} /></div>
              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <span>{formMode === 'create' ? 'Tambah' : 'Simpan'}</span>
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (<div className="flex items-center gap-2 text-red-600"><AlertCircle className="h-4 w-4" /> {error.message}</div>)}
      {loading && !data ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Memuat...</div>
      ) : (
        <DataTable columns={columns} data={data?.gor || []} />
      )}
    </div>
  );
}