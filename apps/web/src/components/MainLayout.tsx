'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useTheme } from 'next-themes';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { LogOut, Loader2, User, Sun, Moon } from 'lucide-react';
import { useQuery, gql } from '@apollo/client';
import DemoBanner from '@/components/DemoBanner';
import TrialBanner from '@/components/TrialBanner';
import OnboardingChecklist from '@/components/OnboardingChecklist';
import AkademiSelector from '@/components/AkademiSelector';
import { useSignOut } from '@/hooks/useSignOut';

const GET_MY_AKADEMIS = gql`
  query GetMyAkademis {
    myAkademis {
      id
      nama
      slug
    }
  }
`;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { handleSignOut } = useSignOut();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isAuthPage =
    pathname?.startsWith('/auth/login') ||
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/auth/') ||
    pathname?.startsWith('/landing') ||
    pathname?.startsWith('/onboarding');

  const { data: akademiData, loading: akademiLoading } = useQuery(GET_MY_AKADEMIS, {
    skip: isAuthPage || isPending || !session?.user,
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (!isAuthPage && !pathname?.startsWith('/admin') && !isPending && session?.user && !akademiLoading && akademiData) {
      if (akademiData.myAkademis.length === 0) {
        router.push('/onboarding/survey');
      }
    }
  }, [akademiData, akademiLoading, isAuthPage, pathname, isPending, session, router]);


  if (isAuthPage) {
    return <>{children}</>;
  }

  // Menentukan nama halaman berdasarkan path
  const getPageTitle = () => {
    if (pathname === '/') return 'Beranda';
    if (pathname === '/admin/users') return 'Kelola Anggota';
    if (pathname === '/admin/roles') return 'Matriks Otorisasi (RBAC)';
    if (pathname === '/admin/siswa') return 'Kelola Siswa';
    if (pathname === '/admin/jadwal') return 'Jadwal Latihan';
    if (pathname === '/admin/absensi') return 'Absensi Latihan';
    if (pathname === '/admin/transaksi') return 'Transaksi';
    if (pathname === '/admin/kelompok-umur') return 'Kelompok Umur';
    if (pathname === '/admin/posisi') return 'Master Posisi';
    if (pathname === '/admin/pelanggaran') return 'Master Pelanggaran';
    if (pathname === '/admin/pelatih') return 'Manajemen Pelatih';
    if (pathname === '/admin/orang-tua') return 'Data Orang Tua';
    if (pathname === '/admin/spp') return 'SPP & Tagihan';
    if (pathname === '/admin/buku-kas') return 'Buku Kas';
    if (pathname === '/admin/tabungan') return 'Tabungan Siswa';
    if (pathname === '/admin/tes-fisik') return 'Tes Fisik';
    if (pathname === '/admin/evaluasi') return 'Evaluasi Siswa';
    if (pathname === '/admin/pengumuman') return 'Pengumuman';
    if (pathname === '/admin/turnamen') return 'Turnamen';
    if (pathname === '/admin/inventaris') return 'Inventaris';
    if (pathname === '/admin/dashboard') return 'Dashboard';
    if (pathname === '/admin/match') return 'Pertandingan & Klasemen';
    if (pathname === '/admin/notifikasi') return 'Notifikasi';
    if (pathname === '/admin/materi') return 'Materi Latihan';
    if (pathname === '/admin/seleksi') return 'Seleksi Pemain';
    if (pathname === '/admin/log-pelatih') return 'Log Pelatih';
    if (pathname === '/admin/pendaftaran') return 'Pendaftaran Online';
    if (pathname === '/portal') return 'Portal Orang Tua';
    if (pathname === '/admin/langganan') return 'Langganan';
    if (pathname === '/admin/audit-log') return 'Log Audit';
    if (pathname === '/admin/payment') return 'Pembayaran';
    if (pathname === '/admin/billing') return 'Billing & Langganan';
    if (pathname === '/admin/klasemen') return 'Klasemen Turnamen';
    if (pathname === '/admin/absensi-cepat') return 'Absensi Cepat';
    if (pathname === '/admin/dokumen-siswa') return 'Dokumen Siswa';
    if (pathname === '/admin/inventaris-detail') return 'Distribusi & Mutasi Inventaris';
    return 'Manajemen';
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full text-foreground relative">
        {/* Sidebar Component */}
        <AppSidebar />
        
        {/* Main Content Pane */}
        <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
          {/* Top Banners */}
          <DemoBanner />
          <TrialBanner />

          {/* Top Navbar Header */}
          <div className="p-4 border-b border-border bg-card/85 backdrop-blur-md flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-foreground/80 hover:text-foreground border border-border bg-background rounded-xl cursor-pointer transition-all" />
              <div className="flex flex-col text-left">
                <span className="text-xs font-black text-foreground tracking-tight">
                  {getPageTitle()}
                </span>
                <span className="text-5xs text-muted-foreground font-extrabold uppercase tracking-widest font-mono">
                  Sistem Otorisasi Garuda
                </span>
              </div>
            </div>

            {/* Tenant Switcher, Theme Toggle, Profile & Logout Capsule on Top-bar */}
            <div className="flex items-center gap-3">
              {!isPending && session?.user && (
                <>
                  {/* Pemilih akademi aktif (multi-tenant) — persist ke localStorage */}
                  <div className="hidden md:block">
                    <AkademiSelector />
                  </div>

                  {/* Toggle tema terang/gelap (next-themes) */}
                  {mounted && (
                    <button
                      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                      className="p-2 bg-background border border-border hover:bg-muted text-foreground/80 hover:text-foreground rounded-xl transition-all cursor-pointer"
                      title={resolvedTheme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
                    >
                      {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                  )}
                </>
              )}
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : (
                session?.user && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2.5 px-3 py-1.5 bg-background border border-border rounded-xl">
                      <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-xs">
                        {session.user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden sm:inline text-2xs font-bold text-foreground max-w-[100px] truncate">
                        {session.user.name}
                      </span>
                    </div>

                    <button
                      onClick={handleSignOut}
                      className="p-2 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 hover:border-destructive/40 text-destructive rounded-xl transition-all"
                      title="Keluar Akun"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Child Page Content */}
          <div className="flex-1 w-full p-6 md:p-8 relative z-10">
            {children}
          </div>
        </main>

        {/* Floating Onboarding Checklist */}
        <OnboardingChecklist />
      </div>
    </SidebarProvider>
  );
}