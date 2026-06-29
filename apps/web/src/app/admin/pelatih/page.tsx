'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const GET_PELATIH = gql`query GetPelatih { pelatih { id namaLengkap noHp email tanggalLahir status } }`;
const CREATE_PELATIH = gql`mutation CreatePelatih($namaLengkap:String!,$noHp:String,$email:String,$tempatLahir:String,$tanggalLahir:String,$status:String,$catatan:String) { createPelatih(namaLengkap:$namaLengkap,noHp:$noHp,email:$email,tempatLahir:$tempatLahir,tanggalLahir:$tanggalLahir,status:$status,catatan:$catatan) { id namaLengkap } }`;
const UPDATE_PELATIH = gql`mutation UpdatePelatih($id:ID!,$namaLengkap:String,$noHp:String,$email:String,$tempatLahir:String,$tanggalLahir:String,$status:String,$catatan:String) { updatePelatih(id:$id,namaLengkap:$namaLengkap,noHp:$noHp,email:$email,tempatLahir:$tempatLahir,tanggalLahir:$tanggalLahir,status:$status,catatan:$catatan) { id namaLengkap } }`;
const DELETE_PELATIH = gql`mutation DeletePelatih($id:ID!) { deletePelatih(id:$id) }`;

interface PelatihData { id: string; namaLengkap: string; noHp?: string; email?: string; tanggalLahir?: string; status: string; }

export default function AdminPelatihPage() {
  const { data, loading, error, refetch } = useQuery<{ pelatih: PelatihData[] }>(GET_PELATIH, { fetchPolicy: 'cache-and-network' });
  const [createPelatih] = useMutation(CREATE_PELATIH);
  const [updatePelatih] = useMutation(UPDATE_PELATIH);
  const [deletePelatih] = useMutation(DELETE_PELATIH);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<PelatihData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const empty = { namaLengkap: '', noHp: '', email: '', tempatLahir: '', tanggalLahir: '', status: 'aktif', catatan: '' };
  const [f, setF] = useState(empty);
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  const handleOpenCreate = () => { setFormMode('create'); setSelected(null); setF(empty); setDialogOpen(true); };
  const handleOpenEdit = (p: PelatihData) => { setFormMode('edit'); setSelected(p); setF({ namaLengkap: p.namaLengkap, noHp: p.noHp || '', email: p.email || '', tempatLahir: '', tanggalLahir: p.tanggalLahir || '', status: p.status, catatan: '' }); setDialogOpen(true); };
  const handleDelete = async (p: PelatihData) => { if (!confirm(`Hapus pelatih "${p.namaLengkap}"?`)) return; try { await deletePelatih({ variables: { id: p.id } }); toast.success('Dihapus.'); refetch(); } catch (e: any) { toast.error(e?.message); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const vars: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(f)) { if (v !== '') vars[k] = v; }
      if (formMode === 'create') { await createPelatih({ variables: vars }); toast.success('Ditambahkan.'); }
      else { await updatePelatih({ variables: { id: selected!.id, ...vars } }); toast.success('Diperbarui.'); }
      setDialogOpen(false); refetch();
    } catch (e: any) { toast.error(e?.message); } finally { setSubmitting(false); }
  };

  const columns: ColumnDef<PelatihData>[] = [
    { header: 'Nama', accessorKey: 'namaLengkap', className: 'font-extrabold text-sm' },
    { header: 'HP', cell: p => p.noHp || '-', className: 'text-xs' },
    { header: 'Email', cell: p => p.email || '-', className: 'text-xs' },
    { header: 'Status', cell: p => <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${p.status === 'aktif' ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>{p.status}</span>, className: 'text-xs' },
    { header: 'Aksi', className: 'text-right w-24', cell: p => (
      <div className="flex items-center justify-end gap-2">
        <Button onClick={() => handleOpenEdit(p)} variant="ghost" size="sm" className="h-8 px-2 bg-background border border-border hover:bg-muted rounded-lg cursor-pointer"><Edit2 className="w-3.5 h-3.5 text-primary" /></Button>
        <Button onClick={() => handleDelete(p)} variant="ghost" size="sm" className="h-8 px-2 bg-destructive/10 border border-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></Button>
      </div>
    ) },
  ];

  const Field = ({ label, k, type = 'text', ...props }: { label: string; k: string; type?: string; [key: string]: any }) => (
    <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">{label}</label><input type={type} value={f[k as keyof typeof f]} onChange={e => set(k, e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" {...props} /></div>
  );

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">Manajemen Pelatih <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">MVP</span></h2>
        <p className="text-xs text-muted-foreground font-medium">Kelola data pelatih — profil, lisensi, dan penugasan.</p>
      </div>
      {error ? <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs"><AlertCircle className="w-4 h-4" /><span className="font-bold">{error.message}</span></div> : (
        <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
          <DataTable data={data?.pelatih || []} columns={columns} loading={loading} searchPlaceholder="Cari pelatih..." searchKeys={['namaLengkap', 'noHp', 'email']} emptyMessage="Belum ada pelatih." actions={<Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"><Plus className="w-3.5 h-3.5" /><span>Tambah Pelatih</span></Button>} />
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-lg rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">{formMode === 'create' ? 'Tambah Pelatih' : 'Ubah Pelatih'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Nama Lengkap" k="namaLengkap" required />
            <div className="grid grid-cols-2 gap-3"><Field label="No. HP" k="noHp" /><Field label="Email" k="email" type="email" /></div>
            <div className="grid grid-cols-2 gap-3"><Field label="Tempat Lahir" k="tempatLahir" /><Field label="Tanggal Lahir" k="tanggalLahir" type="date" /></div>
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Status</label><select value={f.status} onChange={e => set('status', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"><option value="aktif">Aktif</option><option value="nonaktif">Nonaktif</option></select></div>
            <Field label="Catatan" k="catatan" />
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
