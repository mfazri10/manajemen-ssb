'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

const GET_GOR = gql`query { gor { id nama } }`;
const GET_LAPANGAN = gql`query { lapangan { id gorId nama tipe permukaan indoor tarifPerJam kapasitas status keterangan } }`;
const CREATE_LAPANGAN = gql`mutation C($gorId:ID!,$nama:String!,$tipe:String!,$permukaan:String,$indoor:Boolean,$tarifPerJam:Float,$kapasitas:Int,$status:String,$keterangan:String){ createLapangan(gorId:$gorId,nama:$nama,tipe:$tipe,permukaan:$permukaan,indoor:$indoor,tarifPerJam:$tarifPerJam,kapasitas:$kapasitas,status:$status,keterangan:$keterangan){ id } }`;
const UPDATE_LAPANGAN = gql`mutation U($id:ID!,$gorId:ID,$nama:String,$tipe:String,$permukaan:String,$indoor:Boolean,$tarifPerJam:Float,$kapasitas:Int,$status:String,$keterangan:String){ updateLapangan(id:$id,gorId:$gorId,nama:$nama,tipe:$tipe,permukaan:$permukaan,indoor:$indoor,tarifPerJam:$tarifPerJam,kapasitas:$kapasitas,status:$status,keterangan:$keterangan){ id } }`;
const DELETE_LAPANGAN = gql`mutation D($id:ID!){ deleteLapangan(id:$id) }`;

interface GorRef { id: string; nama: string; }
interface LapData {
  id: string; gorId: string; nama: string; tipe: string; permukaan?: string;
  indoor?: boolean; tarifPerJam?: number; kapasitas?: number; status?: string; keterangan?: string;
}

const empty = { gorId: '', nama: '', tipe: '', permukaan: '', indoor: false, tarifPerJam: '', kapasitas: '', status: 'aktif', keterangan: '' };

export default function LapanganManagement() {
  const { data, loading, error, refetch } = useQuery<{ lapangan: LapData[] }>(GET_LAPANGAN, { fetchPolicy: 'cache-and-network' });
  const { data: gorData } = useQuery<{ gor: GorRef[] }>(GET_GOR);
  const [createLapangan] = useMutation(CREATE_LAPANGAN);
  const [updateLapangan] = useMutation(UPDATE_LAPANGAN);
  const [deleteLapangan] = useMutation(DELETE_LAPANGAN);
  const { ask, dialog } = useConfirmDialog();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<LapData | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [saving, setSaving] = useState(false);

  const gorMap = (gorData?.gor || []).reduce((acc, g) => { acc[g.id] = g.nama; return acc; }, {} as Record<string, string>);

  const openCreate = () => { setFormMode('create'); setSelected(null); setForm(empty); setDialogOpen(true); };
  const openEdit = (row: LapData) => {
    setFormMode('edit'); setSelected(row);
    setForm({
      gorId: row.gorId || '', nama: row.nama || '', tipe: row.tipe || '', permukaan: row.permukaan || '',
      indoor: !!row.indoor, tarifPerJam: row.tarifPerJam != null ? String(row.tarifPerJam) : '',
      kapasitas: row.kapasitas != null ? String(row.kapasitas) : '', status: row.status || 'aktif', keterangan: row.keterangan || '',
    });
    setDialogOpen(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.gorId) { toast.error('Pilih GOR terlebih dahulu.'); return; }
    if (!form.nama.trim()) { toast.error('Nama lapangan wajib diisi.'); return; }
    if (!form.tipe.trim()) { toast.error('Tipe lapangan wajib diisi.'); return; }
    setSaving(true);
    const vars: any = {
      gorId: form.gorId, nama: form.nama, tipe: form.tipe, permukaan: form.permukaan || null,
      indoor: form.indoor, status: form.status, keterangan: form.keterangan || null,
      tarifPerJam: form.tarifPerJam === '' ? null : parseFloat(form.tarifPerJam),
      kapasitas: form.kapasitas === '' ? null : parseInt(form.kapasitas, 10),
    };
    try {
      if (formMode === 'create') { await createLapangan({ variables: vars }); toast.success('Lapangan ditambahkan.'); }
      else { await updateLapangan({ variables: { id: selected!.id, ...vars } }); toast.success('Lapangan diperbarui.'); }
      setDialogOpen(false); refetch();
    } catch (err: any) { toast.error(err?.message || 'Gagal menyimpan.'); }
    finally { setSaving(false); }
  };

  const onDelete = (row: LapData) => ask({
    title: 'Hapus lapangan?',
    description: `Lapangan "${row.nama}" akan dihapus permanen.`,
    onConfirm: async () => {
      try { await deleteLapangan({ variables: { id: row.id } }); toast.success('Lapangan dihapus.'); refetch(); }
      catch (err: any) { toast.error(err?.message || 'Gagal menghapus.'); }
    },
  });

  const columns: ColumnDef<LapData>[] = [
    { header: 'Nama Lapangan', accessorKey: 'nama', className: 'font-extrabold text-sm text-foreground' },
    { header: 'GOR', cell: (row: LapData) => gorMap[row.gorId] || '-', className: 'text-xs font-semibold' },
    { header: 'Tipe', accessorKey: 'tipe', className: 'text-xs font-bold uppercase text-primary/80' },
    { header: 'Spesifikasi', cell: (row: LapData) => `${row.permukaan || '-'} (${row.indoor ? 'Indoor' : 'Outdoor'})`, className: 'text-xs' },
    { header: 'Tarif / Jam', cell: (row: LapData) => (row.tarifPerJam != null ? 'Rp ' + Number(row.tarifPerJam).toLocaleString('id-ID') : '-'), className: 'text-xs font-bold' },
    { header: 'Kapasitas', cell: (row: LapData) => row.kapasitas != null ? `${row.kapasitas} orang` : '-', className: 'text-xs' },
    { header: 'Status', cell: (row: LapData) => <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${row.status === 'aktif' ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>{row.status}</span>, className: 'text-xs' },
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
          Lapangan Olahraga <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">Fasilitas</span>
        </h2>
        <p className="text-xs text-muted-foreground font-medium">Kelola lapangan olahraga, tipe arena, dan tarif sewa per jam.</p>
      </div>

      {error ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs">
          <AlertCircle className="w-4 h-4" />
          <span className="font-bold">{error.message}</span>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
          <DataTable
            data={data?.lapangan || []}
            columns={columns}
            loading={loading}
            searchPlaceholder="Cari lapangan..."
            searchKeys={['nama', 'tipe', 'permukaan']}
            emptyMessage="Belum ada lapangan terdaftar."
            actions={
              <Button onClick={openCreate} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer">
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Lapangan</span>
              </Button>
            }
          />
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">{formMode === 'create' ? 'Tambah Lapangan' : 'Ubah Lapangan'}</DialogTitle></DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Pilih GOR *</label>
              <select value={form.gorId} onChange={e => setForm({ ...form, gorId: e.target.value })} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required>
                <option value="">-- Pilih GOR --</option>
                {(gorData?.gor || []).map(g => <option key={g.id} value={g.id}>{g.nama}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nama Lapangan *" value={form.nama} onChange={v => setForm({ ...form, nama: v })} required />
              <Field label="Tipe Lapangan *" placeholder="futsal / badminton" value={form.tipe} onChange={v => setForm({ ...form, tipe: v })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Permukaan" placeholder="vinyl / sintetis" value={form.permukaan} onChange={v => setForm({ ...form, permukaan: v })} />
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Spesifikasi Lokasi</label>
                <div className="flex items-center gap-2 pt-2">
                  <input id="indoor" type="checkbox" checked={form.indoor} onChange={e => setForm({ ...form, indoor: e.target.checked })} className="h-4 w-4 rounded-sm border-border bg-background focus:ring-primary text-primary" />
                  <label htmlFor="indoor" className="text-xs font-bold text-foreground cursor-pointer select-none">Indoor (Dalam Ruangan)</label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tarif / Jam (Rp)" type="number" value={form.tarifPerJam} onChange={v => setForm({ ...form, tarifPerJam: v })} />
              <Field label="Kapasitas (Orang)" type="number" value={form.kapasitas} onChange={v => setForm({ ...form, kapasitas: v })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium">
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Non-Aktif</option>
                </select>
              </div>
              <Field label="Keterangan" value={form.keterangan} onChange={v => setForm({ ...form, keterangan: v })} />
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
      {dialog}
    </div>
  );
}
