"use client";

import React, { useState } from "react";
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
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

const GET_ROLES = gql`
  query GetRoles {
    roles {
      id
      name
      label
    }
  }
`;

const CREATE_ROLE = gql`
  mutation CreateRole($name: String!, $label: String) {
    createRole(name: $name, label: $label) {
      id
      name
      label
    }
  }
`;

const UPDATE_ROLE = gql`
  mutation UpdateRole($id: Int!, $name: String!, $label: String) {
    updateRole(id: $id, name: $name, label: $label) {
      id
      name
      label
    }
  }
`;

const DELETE_ROLE = gql`
  mutation DeleteRole($id: Int!) {
    deleteRole(id: $id) {
      id
    }
  }
`;

interface GQLRole {
  id: number;
  name: string;
  label: string | null;
}

export default function AdminGrupPage() {
  const { data, loading, error, refetch } = useQuery<{ roles: GQLRole[] }>(GET_ROLES, {
    fetchPolicy: "cache-and-network",
  });

  const [createRole] = useMutation(CREATE_ROLE);
  const [updateRole] = useMutation(UPDATE_ROLE);
  const [deleteRole] = useMutation(DELETE_ROLE);
  const { ask, dialog } = useConfirmDialog();

  // States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedRole, setSelectedRole] = useState<GQLRole | null>(null);

  // Form Fields
  const [roleIdName, setRoleIdName] = useState("");
  const [roleLabel, setRoleLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleOpenCreate = () => {
    setFormMode("create");
    setRoleIdName("");
    setRoleLabel("");
    setDialogOpen(true);
  };

  const handleOpenEdit = (role: GQLRole) => {
    setFormMode("edit");
    setSelectedRole(role);
    setRoleIdName(role.name);
    setRoleLabel(role.label || "");
    setDialogOpen(true);
  };

  const handleDelete = (role: GQLRole) => ask({
    title: 'Hapus grup/role?',
    description: `Grup/role "${role.label || role.name}" akan dihapus permanen.`,
    onConfirm: async () => {
      try {
        await deleteRole({ variables: { id: role.id } });
        toast.success(`Grup "${role.label || role.name}" berhasil dihapus.`);
        refetch();
      } catch (err: any) {
        toast.error(err?.message || "Gagal menghapus grup.");
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (formMode === "create") {
        await createRole({
          variables: {
            name: roleIdName,
            label: roleLabel || undefined,
          },
        });
        toast.success("Grup baru berhasil ditambahkan.");
      } else if (formMode === "edit" && selectedRole) {
        await updateRole({
          variables: {
            id: selectedRole.id,
            name: roleIdName,
            label: roleLabel || undefined,
          },
        });
        toast.success("Grup berhasil diperbarui.");
      }
      setDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  // Define columns for reuseable DataTable component
  const columns: ColumnDef<GQLRole>[] = [
    {
      header: "ID Fitur",
      accessorKey: "name",
      className: "font-mono text-xs font-semibold text-foreground",
    },
    {
      header: "Nama Fitur",
      cell: (role) => role.label || role.name,
      className: "font-extrabold text-sm text-foreground",
    },
    {
      header: "Aksi",
      className: "text-right w-24",
      cell: (role) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            onClick={() => handleOpenEdit(role)}
            variant="ghost"
            size="sm"
            className="h-8 px-2 bg-background border border-border hover:bg-muted text-foreground rounded-lg cursor-pointer transition-all"
          >
            <Edit2 className="w-3.5 h-3.5 text-primary" />
          </Button>
          <Button
            onClick={() => handleDelete(role)}
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
          <span className="text-primary font-black">Grup Pengguna</span>
        </div>
        <h2 className="text-2xl font-black text-foreground tracking-tight">
          Grup Pengguna
        </h2>
        <p className="text-xs text-muted-foreground font-medium">
          Definisikan kelompok hak akses atau peran (Role) untuk mengelompokkan
          otorisasi akun pengguna.
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
            data={data?.roles || []}
            columns={columns}
            loading={loading}
            searchPlaceholder="Cari nama grup atau ID..."
            searchKeys={["name", "label"]}
            emptyMessage="Belum ada grup pengguna terdaftar."
            actions={
              <Button
                onClick={handleOpenCreate}
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Grup</span>
              </Button>
            }
          />
        </div>
      )}

      {/* Tambah / Ubah Grup Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-2xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-black text-xl text-foreground tracking-tight">
              {formMode === "create" ? "Tambah Grup" : "Ubah Grup"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">
                ID Peran / Name
              </label>
              <input
                type="text"
                placeholder="Contoh: bendahara"
                value={roleIdName}
                onChange={(e) => setRoleIdName(e.target.value)}
                disabled={formMode === "edit"}
                className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">
                Nama Peran / Label
              </label>
              <input
                type="text"
                placeholder="Contoh: Bendahara Akademi"
                value={roleLabel}
                onChange={(e) => setRoleLabel(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
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
