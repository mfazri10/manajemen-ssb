'use client';

import React, { useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useAuthStore } from '../store/auth-store';
import { Shield } from 'lucide-react';

const GET_MY_AKADEMIS = gql`
  query GetMyAkademis {
    myAkademis {
      id
      nama
      slug
      paket
    }
  }
`;

interface Akademi {
  id: string;
  nama: string;
  slug: string;
  paket: string;
}

export function AkademiSelector() {
  const { activeAkademiId, setActiveAkademiId } = useAuthStore();
  const { data, loading, error } = useQuery<{ myAkademis: Akademi[] }>(GET_MY_AKADEMIS, {
    fetchPolicy: 'cache-and-network',
  });

  const akademis = data?.myAkademis || [];

  useEffect(() => {
    if (!loading && akademis.length > 0) {
      const exists = akademis.find((a) => a.id === activeAkademiId);
      if (!exists) {
        const defaultAkademi = akademis[0];
        if (defaultAkademi) {
          localStorage.setItem('activeAkademiId', defaultAkademi.id);
          localStorage.setItem('activeAkademiSlug', defaultAkademi.slug);
          setActiveAkademiId(defaultAkademi.id);
        }
      }
    }
  }, [akademis, activeAkademiId, loading, setActiveAkademiId]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selected = akademis.find((a) => a.id === selectedId);
    if (selected) {
      localStorage.setItem('activeAkademiId', selected.id);
      localStorage.setItem('activeAkademiSlug', selected.slug);
      setActiveAkademiId(selected.id);
      // Reload page to clear apollo cache and reload page under new tenant slug header
      window.location.reload();
    }
  };

  if (loading && akademis.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-3xs font-medium text-muted-foreground">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
        Memuat akademi...
      </div>
    );
  }

  if (error) {
    return (
      <span className="text-3xs text-destructive font-semibold">
        Gagal memuat list akademi
      </span>
    );
  }

  if (akademis.length === 0) {
    return (
      <span className="text-3xs text-muted-foreground font-semibold">
        Belum memiliki akademi
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-background border border-border rounded-xl">
        <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
        <select
          id="akademi-select"
          value={activeAkademiId || ''}
          onChange={handleChange}
          className="text-2xs font-extrabold text-foreground bg-transparent border-none p-0 pr-6 outline-none focus:ring-0 cursor-pointer"
        >
          {akademis.map((a) => (
            <option key={a.id} value={a.id} className="bg-card text-foreground font-bold">
              {a.nama}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default AkademiSelector;
