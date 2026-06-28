'use client';

import React, { useState, useEffect } from 'react';
import { User } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, AlertCircle } from 'lucide-react';

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  user?: User | undefined;
  onSubmit: (data: any) => Promise<void>;
}

export default function UserForm({ open, onOpenChange, mode, user, onSubmit }: UserFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableRoles = [
    { id: 1, name: 'superadmin', label: 'Super Administrator' },
    { id: 2, name: 'admin', label: 'Administrator Akademi' },
    { id: 3, name: 'pelatih', label: 'Pelatih' },
    { id: 4, name: 'orang_tua', label: 'Orang Tua / Wali' },
  ];

  useEffect(() => {
    if (open) {
      setError(null);
      if (mode === 'edit' && user) {
        setName(user.name);
        setEmail(user.email);
        setPassword('');
        setSelectedRoleIds(user.roleUsers.map((ru) => ru.roleId));
      } else {
        setName('');
        setEmail('');
        setPassword('');
        setSelectedRoleIds([]);
      }
    }
  }, [open, mode, user]);

  const toggleRole = (roleId: number) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'create') {
        await onSubmit({
          name,
          email,
          password: password || undefined,
          roleIds: selectedRoleIds,
        });
      } else {
        await onSubmit({
          userId: user?.id,
          roleIds: selectedRoleIds,
        });
      }
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat memproses data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-3xl p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-black text-xl text-foreground tracking-tight">
            {mode === 'create' ? 'Tambah Anggota Baru' : 'Edit Hak Akses / Role'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-2 text-destructive text-xs mt-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
          {mode === 'create' && (
            <>
              <div>
                <label className="block text-4xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap"
                  className="w-full px-4 py-2.5 bg-background border border-border focus:border-primary rounded-xl text-foreground placeholder-muted-foreground/60 text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-4xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-4 py-2.5 bg-background border border-border focus:border-primary rounded-xl text-foreground placeholder-muted-foreground/60 text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-4xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter (Opsional)"
                  className="w-full px-4 py-2.5 bg-background border border-border focus:border-primary rounded-xl text-foreground placeholder-muted-foreground/60 text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
                />
              </div>
            </>
          )}

          {mode === 'edit' && (
            <div className="p-4 bg-background rounded-2xl border border-border/80 mb-2">
              <span className="text-4xs text-muted-foreground font-extrabold uppercase tracking-wider block mb-1">
                Mengedit User
              </span>
              <span className="font-black text-sm text-foreground block">{user?.name}</span>
              <span className="text-xs text-muted-foreground block mt-0.5 font-medium">{user?.email}</span>
            </div>
          )}

          <div>
            <label className="block text-4xs font-bold text-muted-foreground uppercase tracking-widest mb-2.5">
              Pilih Roles / Peran
            </label>
            <div className="space-y-2.5">
              {availableRoles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => toggleRole(role.id)}
                  className="flex items-center gap-3 p-3 bg-background border border-border hover:border-border/80 rounded-2xl cursor-pointer transition-all shadow-3xs"
                >
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={selectedRoleIds.includes(role.id)}
                    onCheckedChange={() => {}}
                    className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-foreground">{role.label}</span>
                    <span className="text-5xs text-muted-foreground/80 font-bold font-mono uppercase mt-0.5">
                      {role.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-5 border-t border-border pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground font-semibold cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
