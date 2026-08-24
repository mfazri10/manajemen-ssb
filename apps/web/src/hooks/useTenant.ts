'use client';

import { useQuery, gql } from '@apollo/client';
import { useAuthStore } from '@/store/auth-store';

const GET_MY_AKADEMIS = gql`
  query GetMyAkademisTenant {
    myAkademis {
      id
      nama
      slug
      paket
    }
  }
`;

export interface TenantAkademi {
  id: string;
  nama: string;
  slug: string;
  paket: string;
}

/**
 * Hook tenant aktif — Lastfeature.md Fase 0.2.
 * Menyediakan data akademi aktif (id, slug, nama, paket) yang tersimpan di
 * localStorage (di-set oleh AkademiSelector) + daftar akademi milik user.
 */
export function useTenant() {
  const { activeAkademiId } = useAuthStore();
  const { data, loading, error, refetch } = useQuery<{ myAkademis: TenantAkademi[] }>(
    GET_MY_AKADEMIS,
    { fetchPolicy: 'cache-and-network' },
  );

  const akademis = data?.myAkademis || [];
  const slug =
    typeof window !== 'undefined' ? localStorage.getItem('activeAkademiSlug') || '' : '';

  const activeTenant =
    akademis.find((a) => a.id === activeAkademiId) ||
    akademis.find((a) => a.slug === slug) ||
    akademis[0] ||
    null;

  return {
    activeTenant,
    akademis,
    slug: activeTenant?.slug || slug,
    nama: activeTenant?.nama || '',
    loading,
    error,
    refetch,
  };
}
