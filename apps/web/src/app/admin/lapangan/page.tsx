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
import { Plus, Edit2, Trash2, Loader2, AlertCircle, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';

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

export default function LapanganPage() {
  const { data, loading, error, refetch } = useQuery<{ lapangan: LapData[] }>(GET_LAPANGAN, { fetchPolicy: 'cache-and-network' });
  const { data: gorData } = useQuery<{ gor: GorRef[] }>(GET_GOR);
  const [createLapangan] = useMutation(CREATE_LAPANGAN);
  const [updateLapangan] = useMutation(UPDATE_LAPANGAN);
  const [deleteLapangan] = useMutation(DELETE_LAPANGAN);

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

  const onDelete = async (row: LapData) => {
    if (!confirm(`Hapus lapangan "${row.nama}"?`)) return;
    try { await deleteLapangan({ variables: { id: row.id } }); toast.success('Lapangan dihapus.'); refetch(); }
    catch (err: any) { toast.error(err?.message || 'Gagal menghapus.'); }
  };

  const columns: ColumnDef<LapData>[] = [
    { header: 'GOR', cell: (row: LapData) => gorMap[row.gorId] || '-' },
    { header: 'Nama', accessorKey: 'nama' },
    { header: 'Tipe', accessorKey: 'tipe' },
    { header: 'Permukaan', accessorKey: 'permukaan' },
    { header: 'Indoor', cell: (row: LapData) => (row.indoor ? 'Ya' : 'Tidak') },
    { header: 'Tarif/Jam', cell: (row: LapData) => (row.tarifPerJam != null ? 'Rp ' + Number(row.tarifPerJam).toLocaleString('id-ID') : '-') },
    { header: 'Kapasitas', accessorKey: 'kapasitas' },
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
          <LayoutGrid className="h-6 w-6 text-emerald-600" />
          <h1 className="text-2xl font-bold">Data Lapangan</h1>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Tambah Lapangan</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{formMode === 'create' ? 'Tambah Lapangan' : 'Edit Lapangan'}</DialogTitle></DialogHeader>
            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <Label>GOR *</Label>
                <select className="w-full rounded-md border px-3 py-2 text-sm" value={form.gorId} onChange={(e) => setForm({ ...form, gorId: e.target.value })}>
                  <option value="">-- Pilih GOR --</option>
                  {(gorData?.gor || []).map((g) => (<option key={g.id} value={g.id}>{g.nama}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Nama *</Label><Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} /></div>
                <div><Label>Tipe *</Label><Input placeholder="futsal / sepakbola / bulutangkis" value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Permukaan</Label><Input placeholder="rumput sintetis / vinyl" value={form.permukaan} onChange={(e) => setForm({ ...form, permukaan: e.target.value })} /></div>
                <div className="flex items-end gap-2 pb-2">
                  <input id="indoor" type="checkbox" checked={form.indoor} onChange={(e) => setForm({ ...form, indoor: e.target.checked })} />
                  <Label htmlFor="indoor">Indoor</Label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Tarif / Jam (Rp)</Label><Input type="number" value={form.tarifPerJam} onChange={(e) => setForm({ ...form, tarifPerJam: e.target.value })} /></div>
                <div><Label>Kapasitas</Label><Input type="number" value={form.kapasitas} onChange={(e) => setForm({ ...form, kapasitas: e.target.value })} /></div>
              </div>
              <div><Label>Status</Label><Input value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} /></div>
              <div><Label>Keterangan</Label><Input value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} /></div>
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
        <DataTable columns={columns} data={data?.lapangan || []} />
      )}
    </div>
  );
}