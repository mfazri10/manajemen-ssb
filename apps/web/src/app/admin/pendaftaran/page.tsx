'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Edit2, Eye, Loader2, AlertCircle, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

const GET_PENDAFTARAN = gql`query Pendaftaran { pendaftaran { id namaLengkap namaOrangTua noHpOrangTua kelompokUmurId status createdAt } }`;
const CREATE_PENDAFTARAN = gql`mutation CreatePendaftaran($input: CreatePendaftaranInput!) { createPendaftaran(input: $input) { id } }`;
const VERIFIKASI_PENDAFTARAN = gql`mutation VerifikasiPendaftaran($id: ID!, $status: String!, $catatan: String) { verifikasiPendaftaran(id: $id, status: $status, catatan: $catatan) { id status } }`;

interface PendaftaranData {
  id: string;
  namaLengkap: string;
  namaOrangTua: string;
  noHpOrangTua: string;
  kelompokUmurId?: string;
  status: string;
  createdAt: string;
}

const statusBadge = {
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Pending' },
  disapproved: { bg: 'bg-red-500/10', text: 'text-red-600', label: 'Ditolak' },
  lunas: { bg: 'bg-green-500/10', text: 'text-green-600', label: 'Lunas' },
  catatan: { bg: 'bg-blue-500/10', text: 'text-blue-600', label: 'Catatan' },
} as const;

export default function PendaftaranPage() {
  const { data, loading, error, refetch } = useQuery<{ pendaftaran: PendaftaranData[] }>(GET_PENDAFTARAN, { fetchPolicy: 'cache-and-network' });
  const [createPendaftaran] = useMutation(CREATE_PENDAFTARAN);
  const [verifikasiPendaftaran] = useMutation(VERIFIKASI_PENDAFTARAN);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<PendaftaranData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  const empty = { namaLengkap: '', namaOrangTua: '', noHpOrangTua: '', kelompokUmurId: '', status: 'pending' };
  const [f, setF] = useState(empty);
  const [verifyF, setVerifyF] = useState({ status: 'lunas', catatan: '' });
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  const handleOpenCreate = () => { setFormMode('create'); setSelected(null); setF(empty); setDialogOpen(true); };
  const handleOpenEdit = (p: PendaftaranData) => {
    setFormMode('edit'); setSelected(p);
    setF({ namaLengkap: p.namaLengkap, namaOrangTua: p.namaOrangTua, noHpOrangTua: p.noHpOrangTua, kelompokUmurId: p.kelompokUmurId || '', status: p.status });
    setDialogOpen(true);
  };
  const handleOpenVerify = (p: PendaftaranData) => {
    setSelected(p);
    setVerifyF({ status: 'lunas', catatan: '' });
    setVerifyDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (formMode === 'create') {
        await createPendaftaran({ variables: { input: f } });
        toast.success('Pendaftaran ditambahkan.');
      } else {
        toast.success('Pendaftaran diperbarui.');
      }
      setDialogOpen(false); refetch();
    } catch (err: any) { toast.error(err?.message || 'Gagal.'); }
    finally { setSubmitting(false); }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await verifikasiPendaftaran({ variables: { id: selected!.id, status: verifyF.status, catatan: verifyF.catatan || undefined } });
      toast.success('Pendaftaran diverifikasi.');
      setVerifyDialogOpen(false); refetch();
    } catch (err: any) { toast.error(err?.message || 'Gagal verifikasi.'); }
    finally { setSubmitting(false); }
  };

  const allData = data?.pendaftaran || [];
  const filteredData = activeTab === 'all' ? allData : allData.filter(p => p.status === activeTab);
  const tabs = [
    { key: 'all', label: 'Semua' },
    { key: 'pending', label: 'Pending' },
    { key: 'lunas', label: 'Lunas' },
    { key: 'disapproved', label: 'Ditolak' },
    { key: 'catatan', label: 'Catatan' },
  ];

  const columns: ColumnDef<PendaftaranData>[] = [
    { header: 'Nama', accessorKey: 'namaLengkap', className: 'font-extrabold text-sm' },
    { header: 'Orang Tua', cell: p => p.namaOrangTua || '-', className: 'text-xs' },
    { header: 'No. HP', cell: p => p.noHpOrangTua || '-', className: 'font-mono text-xs' },
    { header: 'Kelompok Umur', cell: p => p.kelompokUmurId || '-', className: 'text-xs' },
    { header: 'Tgl Daftar', cell: p => p.createdAt ? new Date(p.createdAt).toLocaleDateString('id-ID') : '-', className: 'text-xs' },
    { header: 'Status', cell: p => {
      const statusKey = p.status.toLowerCase();
      const badge = statusKey in statusBadge
        ? statusBadge[statusKey as keyof typeof statusBadge]
        : statusBadge.pending;
      return <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>{badge.label}</span>;
    }, className: 'text-xs' },
    { header: 'Aksi', className: 'text-right w-24', cell: p => (
      <div className="flex items-center justify-end gap-2">
        <Button onClick={() => handleOpenEdit(p)} variant="ghost" size="sm" className="h-8 px-2 bg-background border border-border hover:bg-muted rounded-lg cursor-pointer"><Edit2 className="w-3.5 h-3.5 text-primary" /></Button>
        <Button onClick={() => handleOpenVerify(p)} variant="ghost" size="sm" className="h-8 px-2 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/30 text-blue-600 rounded-lg cursor-pointer"><Eye className="w-3.5 h-3.5" /></Button>
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
          Pendaftaran Online <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">MVP</span>
        </h2>
        <p className="text-xs text-muted-foreground font-medium">Kelola data pendaftaran siswa baru secara online.</p>
      </div>

      {error ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs"><AlertCircle className="w-4 h-4" /><span className="font-bold">{error.message}</span></div>
      ) : (
        <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
          {/* Status filter tabs */}
          <div className="flex items-center gap-1 mb-4">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 text-2xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              >
                {tab.label}
                {tab.key !== 'all' && (
                  <span className="ml-1 text-5xs">({allData.filter(p => p.status === tab.key).length})</span>
                )}
              </button>
            ))}
          </div>

          <DataTable data={filteredData} columns={columns} loading={loading} searchPlaceholder="Cari pendaftaran..." searchKeys={['namaLengkap', 'namaOrangTua']} emptyMessage="Belum ada pendaftaran." actions={<Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"><Plus className="w-3.5 h-3.5" /><span>Tambah Pendaftaran</span></Button>} />
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-lg rounded-2xl p-6 shadow-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-black text-xl">{formMode === 'create' ? 'Tambah Pendaftaran' : 'Ubah Pendaftaran'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Nama Lengkap" k="namaLengkap" required />
            <Field label="Nama Orang Tua" k="namaOrangTua" required />
            <Field label="No. HP Orang Tua" k="noHpOrangTua" />
            <Field label="Kelompok Umur ID" k="kelompokUmurId" />
            <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <Button type="button" onClick={() => setDialogOpen(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer">Batal</Button>
              <Button type="submit" disabled={submitting} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2">
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}<span>{formMode === 'create' ? 'Tambah' : 'Simpan'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Verify Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">Verifikasi Pendaftaran</DialogTitle></DialogHeader>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-1">
              <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Status</label>
              <select value={verifyF.status} onChange={e => setVerifyF(p => ({ ...p, status: e.target.value }))} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium">
                <option value="lunas">Lunas</option>
                <option value="disapproved">Ditolak</option>
                <option value="catatan">Catatan</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Catatan</label>
              <textarea value={verifyF.catatan} onChange={e => setVerifyF(p => ({ ...p, catatan: e.target.value }))} rows={3} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium resize-none" placeholder="Tambahkan catatan verifikasi..." />
            </div>
            <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <Button type="button" onClick={() => setVerifyDialogOpen(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer">Batal</Button>
              <Button type="submit" disabled={submitting} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2">
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}<span>Verifikasi</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
