'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
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

export default function GorManagement() {
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
    { header: 'Nama GOR', accessorKey: 'nama', className: 'font-extrabold text-sm text-foreground' },
    { header: 'Kota', accessorKey: 'kota', className: 'text-xs' },
    { header: 'Alamat', accessorKey: 'alamat', className: 'text-xs' },
    { header: 'Telepon', accessorKey: 'telepon', className: 'text-xs' },
    { header: 'Operasional', cell: (row: GorData) => `${row.jamBuka || '-'} - ${row.jamTutup || '-'}`, className: 'text-xs' },
    { header: 'Status', cell: (row: GorData) => <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${row.status === 'aktif' ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>{row.status}</span>, className: 'text-xs' },
    {
      header: 'Aksi',
      className: 'text-right w-24',
      cell: (row: any) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEdit(row)} className="h-8 px-2 bg-background border border-border hover:bg-muted rounded-lg cursor-pointer"><Edit2 className="h-3.5 w-3.5 text-primary" /></Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(row)} className="h-8 px-2 bg-destructive/10 border border-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ),
    },
  ];

  const Field = ({ label, value, onChange, type = 'text', ...props }: { label: string; value: string; onChange: (v: string) => void; type?: string; [key: string]: any }) => (
    <div className="space-y-1">
      <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" {...props} />
    </div>
  );

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          Gedung Olahraga <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">Venue</span>
        </h2>
        <p className="text-xs text-muted-foreground font-medium">Kelola gedung olahraga (GOR) dan data operasionalnya.</p>
      </div>

      {error ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs">
          <AlertCircle className="w-4 h-4" />
          <span className="font-bold">{error.message}</span>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
          <DataTable
            data={data?.gor || []}
            columns={columns}
            loading={loading}
            searchPlaceholder="Cari GOR..."
            searchKeys={['nama', 'kota', 'alamat']}
            emptyMessage="Belum ada GOR terdaftar."
            actions={
              <Button onClick={openCreate} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer">
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah GOR</span>
              </Button>
            }
          />
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">{formMode === 'create' ? 'Tambah GOR' : 'Ubah GOR'}</DialogTitle></DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Nama GOR *" value={form.nama} onChange={v => setForm({ ...form, nama: v })} required />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Kota" value={form.kota} onChange={v => setForm({ ...form, kota: v })} />
              <Field label="Telepon" value={form.telepon} onChange={v => setForm({ ...form, telepon: v })} />
            </div>
            <div className="space-y-1">
              <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Alamat</label>
              <textarea value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} rows={2} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Jam Buka" type="time" value={form.jamBuka} onChange={v => setForm({ ...form, jamBuka: v })} />
              <Field label="Jam Tutup" type="time" value={form.jamTutup} onChange={v => setForm({ ...form, jamTutup: v })} />
            </div>
            <div className="space-y-1">
              <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium">
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Non-Aktif</option>
              </select>
            </div>
            <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <Button type="button" onClick={() => setDialogOpen(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer">Batal</Button>
              <Button type="submit" disabled={saving} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{formMode === 'create' ? 'Tambah' : 'Simpan'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
