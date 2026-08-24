'use client';

import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';
import { toast } from 'sonner';

/**
 * Hook logout terpusat — sebelumnya logika ini diduplikasi di
 * MainLayout.tsx dan AppSidebar.tsx.
 */
export function useSignOut() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Berhasil keluar dari akun.');
      router.push('/auth/login');
    } catch (err) {
      toast.error('Gagal keluar dari sesi.');
    }
  };

  return { handleSignOut };
}
