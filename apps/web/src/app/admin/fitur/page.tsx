"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { DataTable, ColumnDef } from "@/components/ui/table/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

const GET_PERMISSIONS = gql`
  query GetPermissions {
    permissions {
      id
      name
      label
    }
  }
`;

const CREATE_FEATURE = gql`
  mutation CreateFeature($id: String!, $label: String!, $fungsi: [String!]!) {
    createFeature(id: $id, label: $label, fungsi: $fungsi)
  }
`;

const UPDATE_FEATURE = gql`
  mutation UpdateFeature($oldId: String!, $newId: String!, $label: String!, $fungsi: [String!]!) {
    updateFeature(oldId: $oldId, newId: $newId, label: $label, fungsi: $fungsi)
  }
`;

const DELETE_FEATURE = gql`
  mutation DeleteFeature($id: String!) {
    deleteFeature(id: $id)
  }
`;

interface GQLPermission {
  id: number;
  name: string;
  label: string;
}

interface Feature {
  id: string; // prefix, e.g. "siswa"
  name: string; // base label, e.g. "Siswa"
  fungsi: string[]; // e.g. ["create", "view", "update", "delete"]
}

const AVAILABLE_FUNCTIONS = [
  { value: "view", label: "Lihat" },
  { value: "create", label: "Tambah" },
  { value: "update", label: "Ubah" },
  { value: "delete", label: "Hapus" },
  { value: "print", label: "Cetak" },
  { value: "detail", label: "Detail" },
  { value: "import", label: "Import" },
  { value: "export", label: "Ekspor" },
];

export default function AdminFiturPage() {
  const { data, loading, error, refetch } = useQuery<{ permissions: GQLPermission[] }>(GET_PERMISSIONS, {
    fetchPolicy: "cache-and-network",
  });
  const [createFeature] = useMutation(CREATE_FEATURE);
  const [updateFeature] = useMutation(UPDATE_FEATURE);
  const [deleteFeature] = useMutation(DELETE_FEATURE);
  const { ask, dialog } = useConfirmDialog();

  // States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  // Form Fields
  const [featureId, setFeatureId] = useState("");
  const [featureName, setFeatureName] = useState("");
  const [selectedFuncs, setSelectedFuncs] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Helper to clean Indonesian action prefixes
  const cleanLabel = (label: string, prefix: string) => {
    let clean = label;
    const wordsToRemove = [
      "Tambah ",
      "Lihat Data ",
      "Lihat ",
      "Edit ",
      "Hapus ",
      "Kelola ",
      "Input ",
    ];
    wordsToRemove.forEach((w) => {
      if (clean.startsWith(w)) {
        clean = clean.substring(w.length);
      }
    });
    // Fallback if empty
    if (!clean.trim()) {
      clean = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
    return clean;
  };

  // Group permissions by prefix to form features list
  const features: Feature[] = useMemo(() => {
    if (!data?.permissions) return [];

    const group: { [key: string]: { name: string; fungsi: Set<string> } } = {};

    data.permissions.forEach((perm: GQLPermission) => {
      const parts = perm.name.split(".");
      const prefix = parts[0] || "other";
      const func = parts[1] || "view";

      if (!group[prefix]) {
        group[prefix] = {
          name: cleanLabel(perm.label || "", prefix),
          fungsi: new Set<string>(),
        };
      }
      group[prefix]!.fungsi.add(func);
    });

    return Object.entries(group).map(([id, val]) => ({
      id,
      name: val.name,
      fungsi: Array.from(val.fungsi),
    }));
  }, [data]);

  const handleOpenCreate = () => {
    setFormMode("create");
    setFeatureId("");
    setFeatureName("");
    setSelectedFuncs([]);
    setDialogOpen(true);
  };

  const handleOpenEdit = (feature: Feature) => {
    setFormMode("edit");
    setSelectedFeature(feature);
    setFeatureId(feature.id);
    setFeatureName(feature.name);
    setSelectedFuncs(feature.fungsi);
    setDialogOpen(true);
  };

  const handleDelete = (feature: Feature) => ask({
    title: 'Hapus fitur?',
    description: `Fitur "${feature.name}" dan semua permission terkait akan dihapus permanen.`,
    onConfirm: async () => {
      try {
        await deleteFeature({ variables: { id: feature.id } });
        toast.success(`Fitur "${feature.name}" berhasil dihapus.`);
        refetch();
      } catch (err: any) {
        toast.error(err?.message || "Gagal menghapus fitur.");
      }
    },
  });

  const toggleFunc = (val: string) => {
    setSelectedFuncs((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (formMode === "create") {
        await createFeature({
          variables: {
            id: featureId,
            label: featureName,
            fungsi: selectedFuncs,
          },
        });
        toast.success("Fitur baru berhasil ditambahkan.");
      } else if (formMode === "edit" && selectedFeature) {
        await updateFeature({
          variables: {
            oldId: selectedFeature.id,
            newId: featureId,
            label: featureName,
            fungsi: selectedFuncs,
          },
        });
        toast.success("Fitur berhasil diperbarui.");
      }
      setDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  // Columns definition for DataTable integration
  const columns: ColumnDef<Feature>[] = [
    {
      header: "ID Fitur",
      accessorKey: "id",
      className: "font-mono text-xs font-semibold text-foreground",
    },
    {
      header: "Nama Fitur",
      accessorKey: "name",
      className: "font-extrabold text-sm text-foreground",
    },
    {
      header: "Fungsi",
      cell: (feature) => (
        <div className="flex flex-wrap gap-1">
          {feature.fungsi.map((func) => {
            const label =
              AVAILABLE_FUNCTIONS.find((af) => af.value === func)?.label || func;
            return (
              <span
                key={func}
                className="px-2 py-0.5 bg-muted border border-border text-muted-foreground text-4xs font-bold rounded-md uppercase"
              >
                {label}
              </span>
            );
          })}
        </div>
      ),
    },
    {
      header: "Aksi",
      className: "text-right w-24",
      cell: (feature) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            onClick={() => handleOpenEdit(feature)}
            variant="ghost"
            size="sm"
            className="h-8 px-2 bg-background border border-border hover:bg-muted text-foreground rounded-lg cursor-pointer transition-all"
          >
            <Edit2 className="w-3.5 h-3.5 text-primary" />
          </Button>
          <Button
            onClick={() => handleDelete(feature)}
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
      {/* Breadcrumb & Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-5xs text-muted-foreground font-extrabold uppercase tracking-widest font-mono">
          <span>Poladkami</span>
          <span>&gt;</span>
          <span>Pengaturan</span>
          <span>&gt;</span>
          <span>Sistem</span>
          <span>&gt;</span>
          <span className="text-primary font-black">Fitur</span>
        </div>
        <h2 className="text-2xl font-black text-foreground tracking-tight">
          Fitur Sistem
        </h2>
        <p className="text-xs text-muted-foreground font-medium">
          Kelola fitur/modul sistem dan definisikan fungsi hak akses yang
          tersedia secara modular.
        </p>
      </div>

      {/* Data Table */}
      {error ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs">
          <AlertCircle className="w-4 h-4" />
          <span className="font-bold">Gagal memuat data: {error.message}</span>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
          <DataTable
            data={features}
            columns={columns}
            loading={loading}
            searchPlaceholder="Cari nama fitur atau ID..."
            searchKeys={["id", "name"]}
            emptyMessage="Belum ada fitur terdaftar."
            actions={
              <Button
                onClick={handleOpenCreate}
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Fitur</span>
              </Button>
            }
          />
        </div>
      )}

      {/* Tambah / Ubah Fitur Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-2xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-black text-xl text-foreground tracking-tight">
              {formMode === "create" ? "Tambah Fitur" : "Ubah Fitur"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-3">
            <div>
              <label className="block text-4xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                ID Fitur *
              </label>
              <input
                type="text"
                required
                value={featureId}
                onChange={(e) => setFeatureId(e.target.value)}
                placeholder="Masukan ID fitur (cth: siswa)"
                className="w-full px-4 py-2.5 bg-background border border-border focus:border-primary rounded-xl text-foreground placeholder-muted-foreground/60 text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-4xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                Nama Fitur *
              </label>
              <input
                type="text"
                required
                value={featureName}
                onChange={(e) => setFeatureName(e.target.value)}
                placeholder="Masukan Nama Fitur (cth: Siswa)"
                className="w-full px-4 py-2.5 bg-background border border-border focus:border-primary rounded-xl text-foreground placeholder-muted-foreground/60 text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-4xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Fungsi yang Tersedia *
              </label>
              <div className="grid grid-cols-4 gap-2 bg-muted/20 border border-border p-3.5 rounded-2xl">
                {AVAILABLE_FUNCTIONS.map((f) => {
                  const active = selectedFuncs.includes(f.value);
                  return (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => toggleFunc(f.value)}
                      className={`py-1.5 px-2 rounded-xl text-5xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
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
                <span>
                  {formMode === "create" ? "Tambah" : "Simpan Perubahan"}
                </span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {dialog}
    </div>
  );
}
