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

const GET_KELOMPOK_UMUR = gql`
  query GetKelompokUmur {
    kelompokUmur {
      id
      nama
      usiaMin
      usiaMax
      createdAt
    }
  }
`;

const CREATE_KELOMPOK_UMUR = gql`
  mutation CreateKelompokUmur($nama: String!, $usiaMin: Float, $usiaMax: Float) {
    createKelompokUmur(nama: $nama, usiaMin: $usiaMin, usiaMax: $usiaMax) {
      id
      nama
      usiaMin
      usiaMax
    }
  }
`;

const UPDATE_KELOMPOK_UMUR = gql`
  mutation UpdateKelompokUmur($id: ID!, $nama: String, $usiaMin: Float, $usiaMax: Float) {
    updateKelompokUmur(id: $id, nama: $nama, usiaMin: $usiaMin, usiaMax: $usiaMax) {
      id
      nama
      usiaMin
      usiaMax
    }
  }
`;

const DELETE_KELOMPOK_UMUR = gql`
  mutation DeleteKelompokUmur($id: ID!) {
    deleteKelompokUmur(id: $id)
  }
`;

interface KelompokUmur {
  id: string;
  nama: string;
  usiaMin: number | null;
  usiaMax: number | null;
  createdAt: string;
}

export default function AdminKelompokUmurPage() {
  const { data, loading, error, refetch } = useQuery<{ kelompokUmur: KelompokUmur[] }>(
    GET_KELOMPOK_UMUR,
    { fetchPolicy: 'cache-and-network' }
  );

  const [createKelompokUmur] = useMutation(CREATE_KELOMPOK_UMUR);
  const [updateKelompokUmur] = useMutation(UPDATE_KELOMPOK_UMUR);
  const [deleteKelompokUmur] = useMutation(DELETE_KELOMPOK_UMUR);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<KelompokUmur | null>(null);

  const [nama, setNama] = useState('');
  const [usiaMin, setUsiaMin] = useState('');
  const [usiaMax, setUsiaMax] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleOpenCreate = () => {
    setFormMode('create');
    setSelected(null);
    setNama('');
    setUsiaMin('');
    setUsiaMax('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: KelompokUmur) => {
    setFormMode('edit');
    setSelected(item);
    setNama(item.nama);
    setUsiaMin(item.usiaMin?.toString() || '');
    setUsiaMax(item.usiaMax?.toString() || '');
    setDialogOpen(true);
  };

  const handleDelete = async (item: KelompokUmur) => {
    if (confirm(`Hapus kelompok umur "${item.nama}"?`)) {
      try {
        await deleteKelompokUmur({ variables: { id: item.id } });
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
        await createKelompokUmur({
          variables: {
            nama,
            usiaMin: usiaMin ? parseInt(usiaMin) : undefined,
            usiaMax: usiaMax ? parseInt(usiaMax) : undefined,
          },
        });
        toast.success('Kelompok umur baru berhasil ditambahkan.');
      } else if (selected) {
        await updateKelompokUmur({
          variables: {
            id: selected.id,
            nama,
            usiaMin: usiaMin ? parseInt(usiaMin) : undefined,
            usiaMax: usiaMax ? parseInt(usiaMax) : undefined,
          },
        });
        toast.success('Kelompok umur berhasil diperbarui.');
      }
      setDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnDef<KelompokUmur>[] = [
    {
      header: 'Nama',
      accessorKey: 'nama',
      className: 'font-extrabold text-sm text-foreground',
    },
    {
      header: 'Usia Min',
      cell: (item) => item.usiaMin ?? '-',
      className: 'text-xs font-medium',
    },
    {
      header: 'Usia Max',
      cell: (item) => item.usiaMax ?? '-',
      className: 'text-xs font-medium',
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
          Kelompok Umur
          <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">
            Master Data
          </span>
        </h2>
        <p className="text-xs text-muted-foreground font-medium">
          Kelola data kelompok umur (U-6 s/d U-18) untuk pengelompokan siswa.
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
            data={data?.kelompokUmur || []}
            columns={columns}
            loading={loading}
            searchPlaceholder="Cari kelompok umur..."
            searchKeys={['nama']}
            emptyMessage="Belum ada kelompok umur."
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
              {formMode === 'create' ? 'Tambah Kelompok Umur' : 'Ubah Kelompok Umur'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">
                Nama Kelompok
              </label>
              <input
                type="text"
                placeholder="Contoh: U-12"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">
                  Usia Minimum
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 10"
                  value={usiaMin}
                  onChange={(e) => setUsiaMin(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">
                  Usia Maksimum
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 12"
                  value={usiaMax}
                  onChange={(e) => setUsiaMax(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
                />
              </div>
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
