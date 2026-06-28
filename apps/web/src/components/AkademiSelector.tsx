'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth-store';

interface AkademiOption {
  id: string;
  namaAkademi: string;
  role: string;
}

export function AkademiSelector() {
  const { activeAkademiId, setActiveAkademiId, setRolesAndPermissions } = useAuthStore();
  const [akademis, setAkademis] = useState<AkademiOption[]>([]);
  const [loading, setLoading] = useState(false);

  // Simulasi fetch akademi list dan permissionnya
  // Pada real code, ini memanggil REST API atau GraphQL query
  useEffect(() => {
    async function fetchUserAkademis() {
      setLoading(true);
      try {
        // Simulasi response data dari backend
        const mockedAkademis: AkademiOption[] = [
          { id: 'akademi-a-uuid', namaAkademi: 'SSB Garuda Jaya', role: 'admin' },
          { id: 'akademi-b-uuid', namaAkademi: 'Barito Putera Ananta', role: 'pelatih' },
        ];
        setAkademis(mockedAkademis);

        // Jika belum ada akademi aktif terpilih, set default ke yang pertama
        if (!activeAkademiId && mockedAkademis[0]) {
          setActiveAkademiId(mockedAkademis[0].id);
        }
      } catch (err) {
        console.error('Gagal mengambil daftar akademi:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserAkademis();
  }, [activeAkademiId, setActiveAkademiId]);

  // Simulasi update permission saat akademi berubah
  useEffect(() => {
    if (!activeAkademiId) return;

    // Di real code, query ke backend API dengan header x-akademi-id
    // Untuk mendapatkan roles dan permissions dinamis
    const currentAkademi = akademis.find((a) => a.id === activeAkademiId);
    
    if (currentAkademi) {
      if (currentAkademi.role === 'admin') {
        setRolesAndPermissions(
          ['admin'],
          ['siswa.create', 'siswa.view', 'siswa.update', 'siswa.delete', 'keuangan.view', 'keuangan.manage']
        );
      } else if (currentAkademi.role === 'pelatih') {
        setRolesAndPermissions(
          ['pelatih'],
          ['siswa.view', 'absensi.manage', 'absensi.view', 'evaluasi.manage', 'evaluasi.view']
        );
      }
    }
  }, [activeAkademiId, akademis, setRolesAndPermissions]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveAkademiId(e.target.value);
  };

  if (loading) return <span className="text-sm text-gray-500">Loading akademi...</span>;

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="akademi-select" className="text-sm font-semibold text-gray-700">
        Akademi Aktif:
      </label>
      <select
        id="akademi-select"
        value={activeAkademiId || ''}
        onChange={handleChange}
        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {akademis.map((a) => (
          <option key={a.id} value={a.id}>
            {a.namaAkademi} ({a.role})
          </option>
        ))}
      </select>
    </div>
  );
}
export default AkademiSelector;
