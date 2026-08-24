'use client';

import React, { useState } from 'react';
import { useUser } from '@/features/cms/admin/user/hooks/useUser';
import UserTable from '@/features/cms/admin/user/components/UserTable';
import UserForm from '@/features/cms/admin/user/components/UserForm';
import { User } from '@/features/cms/admin/user/types';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

export default function AdminUsersPage() {
  const { users, loading, createUser, updateUserRoles, deleteUser } = useUser();
  const { ask, dialog } = useConfirmDialog();
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

  const handleOpenCreate = () => {
    setFormMode('create');
    setSelectedUser(undefined);
    setFormOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setFormMode('edit');
    setSelectedUser(user);
    setFormOpen(true);
  };

  const handleDelete = (user: User) => ask({
    title: 'Hapus user?',
    description: `User "${user.name}" akan dihapus permanen.`,
    onConfirm: async () => {
      try {
        await deleteUser(user.id);
        toast.success(`User "${user.name}" berhasil dihapus.`);
      } catch (err: any) {
        toast.error(err?.message || 'Gagal menghapus user.');
      }
    },
  });

  const handleFormSubmit = async (data: any) => {
    if (formMode === 'create') {
      await createUser(data.name, data.email, data.password, data.roleIds);
      toast.success(`User "${data.name}" berhasil ditambahkan.`);
    } else {
      await updateUserRoles(data.userId, data.roleIds);
      toast.success(`Roles user berhasil diperbarui.`);
    }
  };

  return (
    <div className="space-y-5 w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          Daftar Anggota Akademi
          <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">
            RBAC
          </span>
        </h2>
        <p className="text-xs text-muted-foreground font-medium">
          Daftar akun terdaftar di sistem. Anda dapat memodifikasi hak akses/peran (Role) dan menghapus user.
        </p>
      </div>

      {/* User Table */}

      <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
        <UserTable
          users={users}
          loading={loading}
          onEditRoles={handleOpenEdit}
          onDelete={handleDelete}
          actions={
            <Button
              onClick={handleOpenCreate}
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Tambah Anggota</span>
            </Button>
          }
        />
      </div>

      {/* User Form Dialog Popup */}
      <UserForm
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        user={selectedUser}
        onSubmit={handleFormSubmit}
      />
      {dialog}
    </div>
  );
}
