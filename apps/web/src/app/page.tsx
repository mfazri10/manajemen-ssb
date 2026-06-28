'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { usePermissions } from '@/features/authentication/hooks/usePermissions';
import { useAuthStore } from '@/store/auth-store';
import PermissionGate from '@/components/PermissionGate';
import { useQuery, gql } from '@apollo/client';
import { User as UserIcon, Shield, Key, Loader2, Sparkles, Plus, Wallet, FileText, CheckCircle2 } from 'lucide-react';

const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      email
      roles
      permissions
    }
  }
`;

export default function HomePage() {
  const { data: sessionData, isPending: sessionPending } = useSession();
  const { setRolesAndPermissions } = useAuthStore();
  const { roles, permissions } = usePermissions();
  const router = useRouter();

  const { data: gqlData, loading: gqlLoading } = useQuery(GET_ME, {
    skip: !sessionData?.user,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (gqlData?.me) {
      setRolesAndPermissions(gqlData.me.roles, gqlData.me.permissions);
    }
  }, [gqlData, setRolesAndPermissions]);

  useEffect(() => {
    if (!sessionPending && !sessionData?.user) {
      router.push('/auth/login');
    }
  }, [sessionPending, sessionData, router]);

  if (sessionPending || (sessionData?.user && gqlLoading)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-semibold">Memuat profil aman Anda...</p>
      </div>
    );
  }

  if (!sessionData?.user) {
    return null;
  }

  const user = sessionData.user;

  return (
    <div className="space-y-8 w-full max-w-6xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl p-6 md:p-8 flex flex-col gap-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <span className="flex items-center gap-1.5 text-2xs font-extrabold text-primary uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" /> Sistem Autentikasi Siap
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
          Selamat Datang, {user.name}!
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground max-w-2xl font-medium leading-relaxed mt-1">
          Anda masuk sebagai <strong>{roles.join(', ') || 'Anggota'}</strong>. Semua fitur di bawah dikontrol secara dinamis melalui guard API dan visual wrapper berdasarkan hak akses database Anda.
        </p>
      </div>

      {/* Main Grid: Info Cards and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Card, Roles & Permissions */}
        <section className="lg:col-span-1 flex flex-col gap-6">
          {/* User Bio Card */}
          <div className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden shadow-2xs">
            <h2 className="text-muted-foreground text-3xs font-extrabold uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <UserIcon className="w-4 h-4 text-primary" /> Profil Akun Aktif
            </h2>
            <div className="space-y-3 font-medium text-xs text-foreground/90">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground/75">ID Anggota</span>
                <span className="font-mono text-3xs text-foreground font-semibold">{user.id.slice(0, 12)}...</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground/75">Nama</span>
                <span className="text-foreground font-black">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground/75">Email</span>
                <span className="text-foreground font-bold">{user.email}</span>
              </div>
            </div>
          </div>

          {/* Roles & Permissions Card */}
          <div className="bg-card border border-border rounded-3xl p-6 flex flex-col gap-5 shadow-2xs">
            <div>
              <h2 className="text-muted-foreground text-3xs font-extrabold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-primary" /> Peran Aktif (Roles)
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {roles.map((role) => (
                  <span key={role} className="px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary text-3xs font-black rounded-md uppercase tracking-wider">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-muted-foreground text-3xs font-extrabold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-primary" /> Hak Akses (Permissions)
              </h2>
              <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1">
                {permissions.map((perm) => (
                  <span key={perm} className="text-3xs text-foreground/80 bg-background border border-border px-3 py-2 rounded-xl font-mono flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Right Columns: Admin Dashboard Actions & Visualizations */}
        <section className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Quick Actions Panel */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-2xs">
            <h3 className="font-black text-lg text-foreground mb-5 tracking-tight">Manajemen Konten</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* PermissionGate: siswa.create */}
              <PermissionGate
                permission="siswa.create"
                fallback={
                  <div className="p-5 rounded-2xl border border-dashed border-border bg-background/50 flex flex-col items-center justify-center text-center opacity-50">
                    <span className="text-lg">🔒</span>
                    <span className="font-extrabold text-2xs text-muted-foreground/60 uppercase tracking-widest mt-2">Siswa Management</span>
                    <span className="text-4xs text-muted-foreground/40 font-mono mt-1">Butuh: siswa.create</span>
                  </div>
                }
              >
                <div className="p-5 bg-background border border-border hover:border-primary/40 rounded-2xl transition-all flex justify-between items-start group">
                  <div className="flex flex-col gap-1">
                    <span className="p-2 bg-primary/10 text-primary rounded-lg w-fit mb-2">👤</span>
                    <span className="font-extrabold text-sm text-foreground">Tambah Siswa Baru</span>
                    <span className="text-3xs text-muted-foreground font-medium">Daftarkan siswa baru ke program latihan.</span>
                  </div>
                  <button className="p-1.5 bg-primary text-primary-foreground rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </PermissionGate>

              {/* PermissionGate: keuangan.manage */}
              <PermissionGate
                permission="keuangan.manage"
                fallback={
                  <div className="p-5 rounded-2xl border border-dashed border-border bg-background/50 flex flex-col items-center justify-center text-center opacity-50">
                    <span className="text-lg">🔒</span>
                    <span className="font-extrabold text-2xs text-muted-foreground/60 uppercase tracking-widest mt-2">Kelola Keuangan</span>
                    <span className="text-4xs text-muted-foreground/40 font-mono mt-1">Butuh: keuangan.manage</span>
                  </div>
                }
              >
                <div className="p-5 bg-background border border-border hover:border-primary/40 rounded-2xl transition-all flex justify-between items-start group">
                  <div className="flex flex-col gap-1">
                    <span className="p-2 bg-primary/10 text-primary rounded-lg w-fit mb-2">💰</span>
                    <span className="font-extrabold text-sm text-foreground">Kelola SPP / Kas</span>
                    <span className="text-3xs text-muted-foreground font-medium">Verifikasi tagihan & buku kas masuk/keluar.</span>
                  </div>
                  <button className="p-1.5 bg-primary text-primary-foreground rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                    <Wallet className="w-4 h-4" />
                  </button>
                </div>
              </PermissionGate>

              {/* PermissionGate: materi.manage */}
              <PermissionGate
                permission="materi.manage"
                fallback={
                  <div className="p-5 rounded-2xl border border-dashed border-border bg-background/50 flex flex-col items-center justify-center text-center opacity-50">
                    <span className="text-lg">🔒</span>
                    <span className="font-extrabold text-2xs text-muted-foreground/60 uppercase tracking-widest mt-2">Materi Latihan</span>
                    <span className="text-4xs text-muted-foreground/40 font-mono mt-1">Butuh: materi.manage</span>
                  </div>
                }
              >
                <div className="p-5 bg-background border border-border hover:border-primary/40 rounded-2xl transition-all flex justify-between items-start group">
                  <div className="flex flex-col gap-1">
                    <span className="p-2 bg-primary/10 text-primary rounded-lg w-fit mb-2">📖</span>
                    <span className="font-extrabold text-sm text-foreground">Kurikulum Latihan</span>
                    <span className="text-3xs text-muted-foreground font-medium">Edit taktik, teknik, dan materi mingguan.</span>
                  </div>
                  <button className="p-1.5 bg-primary text-primary-foreground rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </PermissionGate>

            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
