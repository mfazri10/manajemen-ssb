# Standar dan Pattern Mobile React Native / Expo (TypeScript)

Dokumen ini merangkum _best practices_, standar arsitektur, dan _pattern_ yang wajib diikuti saat mengembangkan aplikasi mobile SaaS Sport Management menggunakan **Expo Router**, **React Native**, dan **TypeScript**.

> **Filosofi:** Pola ini mengadopsi pendekatan **Feature-Sliced** yang sama dengan frontend Next.js — menjaga mental model yang konsisten antar tim dan memastikan setiap fitur _self-contained_.

---

## 1. Arsitektur & Struktur Direktori

Gunakan struktur **Feature-Sliced** — `app/` hanya untuk routing, semua logika & UI per fitur ada di `features/`.

```text
apps/mobile/sport-mobile/
│
├── app/                            # Routing Expo Router (HANYA routing & screen shell)
│   ├── (auth)/                     # Route group: autentikasi
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                     # Route group: tab navigation utama
│   │   ├── _layout.tsx
│   │   ├── index.tsx               # Tab: Dashboard (screen shell saja)
│   │   ├── siswa.tsx               # Tab: Data Siswa
│   │   ├── jadwal.tsx              # Tab: Jadwal Latihan
│   │   ├── absensi.tsx             # Tab: Absensi
│   │   └── profile.tsx             # Tab: Profil Akademi
│   ├── siswa/                      # Route group: detail siswa
│   ├── evaluasi/                   # Route group: evaluasi/rapor
│   ├── keuangan/                   # Route group: keuangan SPP
│   ├── turnamen/                   # Route group: turnamen
│   └── pengumuman/                 # Route group: pengumuman
│
├── features/                       # ★ Feature modules — satu folder per domain bisnis
│   ├── siswa/                      # Manajemen siswa/pemain
│   │   ├── components/             # SiswaCard, SiswaForm, SiswaList
│   │   ├── hooks/                  # useSiswa.ts
│   │   └── types.ts                # Tipe spesifik siswa
│   ├── pelatih/                    # Manajemen pelatih
│   │   ├── components/             # PelatihCard, PelatihForm
│   │   └── hooks/                  # usePelatih.ts
│   ├── jadwal/                     # Jadwal latihan
│   │   ├── components/             # JadwalCard, JadwalCalendar, JadwalForm
│   │   └── hooks/                  # useJadwal.ts
│   ├── absensi/                    # Absensi digital
│   │   ├── components/             # AbsensiForm, AbsensiRow, AbsensiSummary
│   │   └── hooks/                  # useAbsensi.ts
│   ├── keuangan/                   # SPP & keuangan
│   │   ├── components/             # SPPTagihanCard, PembayaranForm, BukuKasItem
│   │   └── hooks/                  # useKeuangan.ts
│   ├── evaluasi/                   # Raport & evaluasi pemain
│   │   ├── components/             # EvaluasiCard, RaportSummary, RadarChart
│   │   └── hooks/                  # useEvaluasi.ts
│   ├── tes-fisik/                  # Tes fisik pemain
│   │   ├── components/             # TesFisikForm, RankingList, GrafikTes
│   │   └── hooks/                  # useTesFisik.ts
│   ├── turnamen/                   # Turnamen & pertandingan
│   │   ├── components/             # TurnamenCard, MatchCard, KlasemenTable
│   │   └── hooks/                  # useTurnamen.ts
│   ├── pengumuman/                 # Komunikasi & pengumuman
│   │   ├── components/             # PengumumanCard, PengumumanForm
│   │   └── hooks/                  # usePengumuman.ts
│   ├── materi/                     # Materi latihan / kurikulum
│   │   ├── components/             # MateriCard, MateriDetail
│   │   └── hooks/                  # useMateri.ts
│   └── dashboard/                  # Dashboard & statistik
│       ├── components/             # StatsCard, GrafikKehadiran, JadwalHariIni
│       └── hooks/                  # useDashboard.ts
│
├── components/                     # UI global (design system SAJA)
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Header.tsx
│       └── ProgressBar.tsx
│
├── context/                        # React Context — state benar-benar global
│   └── AppContext.tsx
│
├── constants/                      # Token desain & konfigurasi
│   ├── theme.ts                    # Colors, Spacing, FontSize, BorderRadius
│   └── config.ts                   # App config, API endpoints
│
├── types/                          # TypeScript types GLOBAL lintas fitur
│   └── index.ts
│
├── utils/                          # Helper functions murni (tanpa side effect)
│   ├── storage.ts                  # AsyncStorage CRUD helpers
│   ├── date.ts                     # Format tanggal, hitung umur siswa
│   └── format.ts                   # Format currency, nomor HP
│
├── lib/                            # Konfigurasi library pihak ketiga
│   └── apollo.ts                   # Apollo Client setup
│
└── data/                           # Data statis JSON
    ├── posisi.json                 # Master posisi (GK, DF, MF, FW)
    └── pelanggaran.json            # Master pelanggaran
```

**Aturan pokok:**
- `app/` hanya berisi screen shell & routing — **nol logika bisnis**
- Setiap fitur hidup sepenuhnya di `features/<nama-fitur>/` (**colocation**)
- `components/ui/` hanya untuk design system primitif yang benar-benar global
- Komponen spesifik domain ada di `features/<fitur>/components/`, bukan di `components/`
- `types/index.ts` hanya untuk tipe yang dipakai lintas banyak fitur; tipe spesifik ada di `features/<fitur>/types.ts`
- Tidak ada inline style; semua style di `StyleSheet.create()` di akhir file

---

## 1a. Perbandingan: Sebelum vs Sesudah Feature-Sliced

Pola ini selaras dengan **frontend Next.js** — menjaga mental model yang sama antar tim.

```text
── Frontend (Next.js)          ── Mobile (Expo) — ADAPTASI
   features/                     features/
   └── authentication/           └── siswa/
       ├── components/               ├── components/
       ├── hooks/          ≈         ├── hooks/
       ├── actions.ts  →  (tidak ada, diganti hooks karena all-client)
       └── types.ts                  └── types.ts
```

| Aspek | Next.js Frontend | Mobile (Adaptasi) |
|---|---|---|
| Routing | `app/` file-based | `app/` file-based |
| Feature isolation | `features/<fitur>/` | `features/<fitur>/` |
| Logic layer | `actions.ts` (server) | `hooks/` (client) |
| UI global | `components/` | `components/ui/` |
| Tipe spesifik fitur | `features/<fitur>/types.ts` | `features/<fitur>/types.ts` |
| Tipe global | `types/` | `types/index.ts` |
| Perbedaan | Server Actions ada | Tidak perlu — semua client |

**Keuntungan colocation untuk SaaS Sport Management (12+ fitur):**

```text
❌ SEBELUM — semua tersebar:
hooks/useSiswa.ts
hooks/useAbsensi.ts      → Tidak jelas hubungannya
hooks/useEvaluasi.ts
components/SiswaCard.tsx
components/AbsensiForm.tsx → Campur aduk domain
components/EvaluasiCard.tsx

✅ SESUDAH — terorganisir per fitur:
features/siswa/
  ├── components/SiswaCard.tsx      → Semua siswa di sini
  └── hooks/useSiswa.ts
features/absensi/
  ├── components/AbsensiForm.tsx    → Semua absensi di sini
  └── hooks/useAbsensi.ts
features/evaluasi/
  ├── components/EvaluasiCard.tsx   → Semua evaluasi di sini
  └── hooks/useEvaluasi.ts
```

---

## 2. Pola Penulisan Screen (app/)

Screen adalah **kontainer tipis** yang mengorkestrasi hooks dan komponen dari `features/`. Jaga screen tetap pendek dan mudah dibaca — idealnya di bawah 80 baris.

```typescript
// app/(tabs)/index.tsx
// ✅ Screen: import dari features/, orkestrasi, tidak ada logika bisnis inline

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';

// ✅ Import dari features/ — bukan dari hooks/ atau components/ langsung
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { StatsCard } from '@/features/dashboard/components/StatsCard';
import { JadwalHariIni } from '@/features/dashboard/components/JadwalHariIni';
import { useJadwal } from '@/features/jadwal/hooks/useJadwal';

// ✅ Import dari components/ui/ untuk design system global
import Card from '@/components/ui/Card';
import { Colors, Spacing } from '@/constants/theme';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { akademi } = useApp();
  const { stats, isLoading } = useDashboard(akademi?.id);
  const { jadwalHariIni } = useJadwal(akademi?.id);

  if (!akademi) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <StatsCard stats={stats} />
        <JadwalHariIni jadwal={jadwalHariIni} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
});
```

---

## 2b. Pola Feature Module

Setiap folder `features/<nama>/` memiliki struktur yang konsisten. Berikut contoh lengkap untuk fitur `absensi`:

```text
features/absensi/
├── components/
│   ├── AbsensiForm.tsx           # Form input absensi batch
│   ├── AbsensiRow.tsx            # Baris satu siswa dalam absensi
│   └── AbsensiSummary.tsx        # Ringkasan kehadiran (hadir/izin/sakit/alpha)
└── hooks/
    └── useAbsensi.ts             # Semua state & logic absensi
```

### Hook (logic layer)

```typescript
// features/absensi/hooks/useAbsensi.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import type { Siswa, StatusKehadiran } from '@/types';

interface AbsensiRecord {
  id: string;
  jadwalId: string;
  siswaId: string;
  tanggal: string;
  status: StatusKehadiran;
  keterangan?: string;
}

interface UseAbsensiReturn {
  siswaList: Siswa[];
  absensi: Map<string, StatusKehadiran>;
  setAbsensiStatus: (siswaId: string, status: StatusKehadiran) => void;
  submitAbsensi: () => Promise<void>;
  summary: { hadir: number; izin: number; sakit: number; alpha: number };
  isLoading: boolean;
}

export function useAbsensi(jadwalId: string): UseAbsensiReturn {
  const [absensi, setAbsensi] = useState<Map<string, StatusKehadiran>>(new Map());

  const { data, loading } = useQuery(GET_SISWA_BY_JADWAL, {
    variables: { jadwalId },
  });

  const [submitMutation] = useMutation(SUBMIT_ABSENSI);

  const siswaList = useMemo(() => data?.siswaByJadwal ?? [], [data]);

  const setAbsensiStatus = useCallback((siswaId: string, status: StatusKehadiran) => {
    setAbsensi((prev) => new Map(prev).set(siswaId, status));
  }, []);

  const submitAbsensi = useCallback(async () => {
    const records = Array.from(absensi.entries()).map(([siswaId, status]) => ({
      jadwalId,
      siswaId,
      status,
      tanggal: new Date().toISOString().split('T')[0],
    }));

    await submitMutation({ variables: { input: records } });
  }, [absensi, jadwalId, submitMutation]);

  const summary = useMemo(() => {
    const counts = { hadir: 0, izin: 0, sakit: 0, alpha: 0 };
    absensi.forEach((status) => { counts[status]++; });
    return counts;
  }, [absensi]);

  return { siswaList, absensi, setAbsensiStatus, submitAbsensi, summary, isLoading: loading };
}
```

### Component (presentasi)

```typescript
// features/absensi/components/AbsensiRow.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import type { StatusKehadiran } from '@/types';

interface AbsensiRowProps {
  nama: string;
  status: StatusKehadiran | null;
  onStatusChange: (status: StatusKehadiran) => void;
}

const STATUS_OPTIONS: { key: StatusKehadiran; label: string; color: string }[] = [
  { key: 'hadir', label: 'Hadir', color: Colors.success },
  { key: 'izin', label: 'Izin', color: '#F59E0B' },
  { key: 'sakit', label: 'Sakit', color: '#3B82F6' },
  { key: 'alpha', label: 'Alpha', color: Colors.danger },
];

export function AbsensiRow({ nama, status, onStatusChange }: AbsensiRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.nama}>{nama}</Text>
      <View style={styles.buttons}>
        {STATUS_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.badge,
              status === opt.key && { backgroundColor: opt.color },
            ]}
            onPress={() => onStatusChange(opt.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.badgeText,
                status === opt.key && { color: Colors.white },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  nama: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  buttons: { flexDirection: 'row', gap: Spacing.xs },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
});
```

### Penggunaan di Screen (app/)

```typescript
// app/absensi/[jadwalId].tsx
import { useLocalSearchParams } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { useAbsensi } from '@/features/absensi/hooks/useAbsensi';
import { AbsensiRow } from '@/features/absensi/components/AbsensiRow';
import { AbsensiSummary } from '@/features/absensi/components/AbsensiSummary';

export default function AbsensiScreen() {
  const { jadwalId } = useLocalSearchParams<{ jadwalId: string }>();
  const { siswaList, absensi, setAbsensiStatus, submitAbsensi, summary } = useAbsensi(jadwalId);

  return (
    <ScrollView>
      <AbsensiSummary summary={summary} total={siswaList.length} />
      {siswaList.map((siswa) => (
        <AbsensiRow
          key={siswa.id}
          nama={siswa.namaLengkap}
          status={absensi.get(siswa.id) ?? null}
          onStatusChange={(status) => setAbsensiStatus(siswa.id, status)}
        />
      ))}
      <Button onPress={submitAbsensi}>Simpan Absensi</Button>
    </ScrollView>
  );
}
```

---

## 3. Pola Custom Hook

Pindahkan semua logika `useState` + `useEffect` yang kompleks ke custom hook. Nama hook selalu diawali `use`.

```typescript
// features/dashboard/hooks/useDashboard.ts
import { useState, useEffect, useCallback } from 'react';
import { gql, useQuery } from '@apollo/client';

interface DashboardStats {
  totalSiswa: number;
  siswaAktif: number;
  pelatihAktif: number;
  absensiHariIni: number;
  sppLunas: number;
  sppBelum: number;
}

interface UseDashboardReturn {
  stats: DashboardStats;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useDashboard(akademiId?: string): UseDashboardReturn {
  const { data, loading, refetch } = useQuery(GET_DASHBOARD_STATS, {
    variables: { akademiId },
    skip: !akademiId,
  });

  const stats: DashboardStats = data?.dashboardStats ?? {
    totalSiswa: 0,
    siswaAktif: 0,
    pelatihAktif: 0,
    absensiHariIni: 0,
    sppLunas: 0,
    sppBelum: 0,
  };

  return { stats, isLoading: loading, refresh: refetch };
}
```

---

## 4. Pola Komponen UI

### 4a. Komponen UI Primitif (design system)

Komponen di `components/ui/` harus:
- Menerima `style` prop untuk customisasi dari luar
- Tidak memiliki margin/padding luar (biarkan parent yang mengatur jarak)
- Memiliki prop type yang jelas dengan `interface`

```typescript
// components/ui/Card.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Shadow, Spacing } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outline';
}

export default function Card({ children, style, variant = 'default' }: CardProps) {
  return (
    <View style={[styles.card, styles[variant], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  default: {},
  elevated: {
    ...Shadow.md,
  },
  outline: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
```

### 4b. Komponen Domain (spesifik fitur)

Komponen domain boleh lebih kompleks dan memiliki logika internal, tapi tetap harus testable.

```typescript
// features/dashboard/components/StatsCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';

interface StatsCardProps {
  stats: {
    totalSiswa: number;
    siswaAktif: number;
    pelatihAktif: number;
    absensiHariIni: number;
    sppLunas: number;
    sppBelum: number;
  };
}

const STAT_ITEMS = [
  { key: 'siswaAktif', label: 'Siswa Aktif', icon: 'people' as const, color: '#3B82F6' },
  { key: 'pelatihAktif', label: 'Pelatih', icon: 'fitness' as const, color: '#10B981' },
  { key: 'absensiHariIni', label: 'Absensi Hari Ini', icon: 'checkmark-done' as const, color: '#F59E0B' },
  { key: 'sppBelum', label: 'SPP Belum', icon: 'wallet' as const, color: '#EF4444' },
];

export function StatsCard({ stats }: StatsCardProps) {
  return (
    <View style={styles.grid}>
      {STAT_ITEMS.map((item) => (
        <View key={item.key} style={styles.item}>
          <Ionicons name={item.icon} size={24} color={item.color} />
          <Text style={styles.value}>{stats[item.key as keyof typeof stats]}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  item: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  value: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  label: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
});
```

---

## 5. Pola State Management

### 5a. Global State — React Context

Gunakan Context hanya untuk state yang **benar-benar global** (akademi aktif, user login). Jangan menaruh data domain (siswa, absensi, evaluasi) di Context.

```typescript
// context/AppContext.tsx — PATTERN YANG BENAR

// ✅ Di Context: hal yang dibutuhkan di mana-mana
interface AppContextType {
  user: User | null;
  akademi: Akademi | null;
  setUser: (user: User | null) => void;
  setAkademi: (akademi: Akademi | null) => void;
}

// ❌ JANGAN di Context: data domain spesifik
// siswaList, absensiData, evaluasiData — taruh di custom hook masing-masing screen
```

### 5b. Local State — useState + useCallback

Gunakan `useCallback` untuk semua fungsi yang diteruskan sebagai prop ke child component, untuk mencegah render ulang yang tidak perlu.

```typescript
// ✅ Pola state lokal yang benar
const [siswa, setSiswa] = useState<Siswa[]>([]);

const handleStatusChange = useCallback(async (id: string, status: StatusSiswa) => {
  const updated = siswa.map((s) =>
    s.id === id ? { ...s, status } : s,
  );
  setSiswa(updated);
  await updateSiswaStatus(id, status);
}, [siswa]);
```

---

## 6. Pola Penyimpanan Data (Offline-First)

### 6a. Aturan storage.ts

- Semua akses `AsyncStorage` **harus** melalui `utils/storage.ts`
- Tidak boleh import `AsyncStorage` langsung di screen atau komponen
- Semua fungsi storage harus memiliki try-catch
- Gunakan tipe yang eksplisit, bukan `any`

```typescript
// utils/storage.ts — POLA YANG BENAR

// ✅ Generic dengan tipe
async function getItem<T>(key: string): Promise<T | null> {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch (error) {
    console.error(`[Storage] Error reading ${key}:`, error);
    return null;
  }
}

// ✅ Ekspor dengan tipe eksplisit
export const getAbsensiCache = () => getItem<AbsensiRecord[]>(STORAGE_KEYS.ABSENSI_CACHE);
export const saveAbsensiCache = (data: AbsensiRecord[]) => setItem(STORAGE_KEYS.ABSENSI_CACHE, data);

// ❌ HINDARI — menggunakan any
export const getAbsensiCache = () => getItem<any[]>(STORAGE_KEYS.ABSENSI_CACHE);
```

### 6b. Pattern Load Data di Screen

```typescript
// ✅ Pattern load data yang benar — gunakan useCallback + useEffect
const loadData = useCallback(async () => {
  if (!akademi) return;
  try {
    const data = await getSiswaByAkademi(akademi.id);
    setSiswa(data);
  } catch (error) {
    console.error('[SiswaScreen] load error:', error);
  }
}, [akademi]);

useEffect(() => {
  loadData();
}, [loadData]);
```

---

## 7. Pola Navigasi (Expo Router)

### 7a. Navigasi Antar Screen

```typescript
import { useRouter } from 'expo-router';

// Navigasi ke screen lain
const router = useRouter();
router.push('/siswa');
router.push({ pathname: '/siswa/[siswaId]', params: { siswaId: '1' } });
router.push('/absensi/jadwal-123');
router.replace('/login'); // Ganti history (tidak bisa back)
router.back();             // Kembali
```

### 7b. Terima Parameter dari Route

```typescript
// app/siswa/[siswaId].tsx
import { useLocalSearchParams } from 'expo-router';

export default function SiswaDetailScreen() {
  const { siswaId } = useLocalSearchParams<{ siswaId: string }>();
  // gunakan siswaId
}
```

### 7c. Layout Groups

```typescript
// app/(tabs)/_layout.tsx — Tab bar layout
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="siswa"
        options={{
          title: 'Siswa',
          tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="jadwal"
        options={{
          title: 'Jadwal',
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="absensi"
        options={{
          title: 'Absensi',
          tabBarIcon: ({ color }) => <Ionicons name="checkmark-done" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
```

---

## 8. Pola Theme & Styling

**Wajib** menggunakan konstanta dari `constants/theme.ts`. Tidak boleh menggunakan nilai warna/ukuran hardcoded di komponen.

```typescript
// constants/theme.ts — Satu sumber kebenaran untuk semua token desain

export const Colors = {
  primary: '#16A34A',       // Hijau — identitas sport/sepakbola
  secondary: '#2563EB',     // Biru
  background: '#F8F9FA',
  white: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',
  border: '#E5E7EB',
} as const;

export const Spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
} as const;

export const FontSize = {
  xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 24,
} as const;

export const BorderRadius = {
  sm: 6, md: 10, lg: 14, xl: 18, full: 999,
} as const;
```

```typescript
// ❌ HINDARI: hardcoded values
const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16 },
});

// ✅ GUNAKAN: konstanta dari theme
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
});
```

---

## 9. Standar Kebersihan TypeScript

- **`strict: true`** wajib di `tsconfig.json`
- **Tidak boleh `any`** — gunakan tipe eksplisit atau generics
- **Interface untuk props komponen**, `type` untuk union
- **Return type eksplisit** pada semua custom hook
- Tidak ada `@ts-ignore` tanpa penjelasan yang jelas

```typescript
// ❌ HINDARI
function processData(data: any): any { ... }

// ✅ GUNAKAN
function processData<T extends { id: string }>(data: T[]): Map<string, T> {
  return new Map(data.map((item) => [item.id, item]));
}
```

---

## 10. Pola Penanganan Error (Error Handling)

```typescript
// ✅ Pattern error handling yang konsisten di screen
const handleSubmit = async () => {
  if (!form.namaLengkap.trim()) {
    Alert.alert('Perhatian', 'Nama lengkap siswa harus diisi.');
    return; // Early return untuk validasi
  }

  try {
    await createSiswa(form);
    router.back();
  } catch (error) {
    console.error('[SiswaScreen] save error:', error);
    Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan. Silakan coba lagi.');
  }
};
```

---

## 11. Naming Convention

| Elemen | Convention | Contoh |
|---|---|---|
| Screen file | `kebab-case.tsx` | `siswa-detail.tsx` |
| Component file | `PascalCase.tsx` | `SiswaCard.tsx` |
| Hook file | `camelCase.ts` | `useSiswa.ts` |
| Utility file | `kebab-case.ts` | `date-utils.ts` |
| Type/Interface | `PascalCase` | `Siswa`, `Pelatih`, `Absensi` |
| Props interface | `PascalCase` + `Props` | `SiswaCardProps` |
| Constants | `UPPER_SNAKE_CASE` | `STORAGE_KEYS`, `MAX_PEMAIN` |
| StyleSheet key | `camelCase` | `container`, `headerTitle` |
| AsyncStorage key | `@app_snake_case` | `@sport_absensi_cache` |
| Route param | `camelCase` | `siswaId`, `jadwalId` |

---

## 12. Checklist Sebelum Commit

Sebelum setiap commit, pastikan:

- [ ] Tidak ada `any` yang tidak diperlukan
- [ ] Semua StyleSheet menggunakan konstanta dari `theme.ts`
- [ ] Semua akses storage melalui `utils/storage.ts`
- [ ] Komponen spesifik domain ada di `features/<fitur>/components/`, **bukan** di `components/`
- [ ] Hook spesifik domain ada di `features/<fitur>/hooks/`, **bukan** di root `hooks/`
- [ ] Screen (`app/`) hanya mengimport dari `features/`, `components/ui/`, dan `context/`
- [ ] Logika yang kompleks dipindah ke custom hook di dalam feature module
- [ ] Tidak ada logika bisnis di dalam JSX (di dalam `return`)
- [ ] `useCallback` digunakan pada semua fungsi yang jadi prop child
- [ ] Error handling dengan try-catch + `Alert` untuk aksi user
- [ ] Tidak ada `console.log` yang tertinggal (gunakan `console.error` untuk real errors)
- [ ] Import menggunakan path alias `@/` bukan path relatif panjang (`../../../`)

---

## 13. Ringkasan: Tanggung Jawab Setiap Layer

| Layer | Lokasi | Tanggung Jawab |
|---|---|---|
| **Screen** | `app/` | Routing, layout, orkestrasi — import dari `features/` |
| **Feature Hook** | `features/<fitur>/hooks/` | State, load data, side effect per domain |
| **Feature Component** | `features/<fitur>/components/` | UI spesifik domain, boleh punya logika ringan |
| **UI Primitif** | `components/ui/` | Design system global (Button, Card, Header) — zero business logic |
| **Context** | `context/` | State global lintas fitur (akademi aktif, user login) |
| **Storage** | `utils/storage.ts` | Satu-satunya pintu masuk ke AsyncStorage |
| **Utils** | `utils/` | Fungsi murni tanpa side effect (format tanggal, currency) |
| **Types** | `types/index.ts` | Tipe global; tipe fitur → `features/<fitur>/types.ts` |
| **Constants** | `constants/theme.ts` | Token desain — Colors, Spacing, FontSize, dll. |

### Aturan Import yang Diizinkan

```text
app/           → boleh import dari: features/, components/ui/, context/, constants/, types/
features/<f>/  → boleh import dari: utils/, constants/, types/, components/ui/, context/
               → TIDAK boleh import dari: features/<fitur lain>/ (hindari coupling)
components/ui/ → boleh import dari: constants/ SAJA
utils/         → boleh import dari: tidak ada (pure functions)
```

---

*Pattern ini berlaku untuk semua screen dan komponen di `apps/mobile/sport-mobile`. Filosofi Feature-Sliced memastikan setiap fitur dapat dikembangkan, ditest, dan di-maintain secara mandiri.*
