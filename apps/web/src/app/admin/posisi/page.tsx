'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const GET_MASTER_POSISI = gql`
  query GetMasterPosisi {
    masterPosisi {
      id
      kode
      nama
      createdAt
    }
  }
`;

const CREATE_MASTER_POSISI = gql`
  mutation CreateMasterPosisi($kode: String!, $nama: String!) {
    createMasterPosisi(kode: $kode, nama: $nama) {
      id
      kode
      nama
    }
  }
`;

const UPDATE_MASTER_POSISI = gql`
  mutation UpdateMasterPosisi($id: ID!, $kode: String, $nama: String) {
    updateMasterPosisi(id: $id, kode: $kode, nama: $nama) {
      id
      kode
      nama
    }
  }
`;

const DELETE_MASTER_POSISI = gql`
  mutation DeleteMasterPosisi($id: ID!) {
    deleteMasterPosisi(id: $id)
  }
`;

interface MasterPosisi {
  id: string;
  kode: string;
  nama: string;
  createdAt: string;
}

export default function AdminPosisiPage() {
  const { data, loading, error, refetch } = useQuery<{ masterPosisi: MasterPosisi[] }>(
    GET_MASTER_POSISI,
    { fetchPolicy: 'cache-and-network' }
  );

  const [createPosisi] = useMutation(CREATE_MASTER_POSISI);
  const [updatePosisi] = useMutation(UPDATE_MASTER_POSISI);
  const [deletePosisi] = useMutation(DELETE_MASTER_POSISI);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<MasterPosisi | null>(null);

  const [kode, setKode] = useState('');
  const [nama, setNama] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleOpenCreate = () => {
    setFormMode('create');
    setSelected(null);
    setKode('');
    setNama('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: MasterPosisi) => {
    setFormMode('edit');
    setSelected(item);
    setKode(item.kode);
    setNama(item.nama);
    setDialogOpen(true);
  };

  const handleDelete = async (item: MasterPosisi) => {
    if (confirm(`Hapus posisi "${item.nama}" (${item.kode})?`)) {
      try {
        await deletePosisi({ variables: { id: item.id } });
        toast.success(`"${item.nama}" berhasil dihapus.`);
        refetch();
      } catch (err: any) {
        toast.error(err?.message || 'Gagal menghapus.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (formMode === 'create') {
        await createPosisi({ variables: { kode, nama } });
        toast.success('Posisi baru berhasil ditambahkan.');
      } else if (selected) {
        await updatePosisi({ variables: { id: selected.id, kode, nama } });
        toast.success('Posisi berhasil diperbarui.');
      }
      setDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnDef<MasterPosisi>[] = [
    {
      header: 'Kode',
      accessorKey: 'kode',
      className: 'font-mono text-xs font-bold text-primary uppercase',
    },
    {
      header: 'Nama Posisi',
      accessorKey: 'nama',
      className: 'font-extrabold text-sm text-foreground',
    },
    {
      header: 'Aksi',
      className: 'text-right w-24',
      cell: (item) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            onClick={() => handleOpenEdit(item)}
            variant="ghost"
            size="sm"
            className="h-8 px-2 bg-background border border-border hover:bg-muted text-foreground rounded-lg cursor-pointer transition-all"
          >
            <Edit2 className="w-3.5 h-3.5 text-primary" />
          </Button>
          <Button
            onClick={() => handleDelete(item)}
            variant="ghost"
            size="sm"
            className="h-8 px-2 bg-destructive/10 border border-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg cursor-pointer transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          Master Posisi
          <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">
            Master Data
          </span>
        </h2>
        <p className="text-xs text-muted-foreground font-medium">
          Kelola data posisi pemain (GK, DF, MF, FW, dll) untuk penugasan siswa.
        </p>
      </div>

      {error ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs">
          <AlertCircle className="w-4 h-4" />
          <span className="font-bold">Gagal memuat data: {error.message}</span>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
          <DataTable
            data={data?.masterPosisi || []}
            columns={columns}
            loading={loading}
            searchPlaceholder="Cari posisi..."
            searchKeys={['kode', 'nama']}
            emptyMessage="Belum ada data posisi."
            actions={
              <Button
                onClick={handleOpenCreate}
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </Button>
            }
          />
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-2xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-black text-xl text-foreground tracking-tight">
              {formMode === 'create' ? 'Tambah Posisi' : 'Ubah Posisi'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">
                Kode Posisi
              </label>
              <input
                type="text"
                placeholder="Contoh: GK, DF, MF, FW"
                value={kode}
                onChange={(e) => setKode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-mono font-bold uppercase"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">
                Nama Posisi
              </label>
              <input
                type="text"
                placeholder="Contoh: Goalkeeper, Defender"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
                required
              />
            </div>
            <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <Button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{formMode === 'create' ? 'Tambah' : 'Simpan'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
