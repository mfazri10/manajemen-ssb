'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Zap, MapPin, Save } from 'lucide-react';
import { toast } from 'sonner';

const GET_JADWAL = gql`query GetJadwalCepat { jadwalLatihan { id hari tanggal waktuMulai lokasi materi status } }`;
const GET_SISWA = gql`query GetSiswaCepat { siswa { id namaLengkap } }`;
const GET_ABSENSI = gql`query GetAbsensiCepat { absensi { id jadwalId siswaId tanggal status } }`;
const CREATE_ABSENSI = gql`mutation CreateAbsensiCepat($jadwalId:ID!,$siswaId:ID!,$tanggal:String!,$status:String!) { createAbsensi(jadwalId:$jadwalId,siswaId:$siswaId,tanggal:$tanggal,status:$status) { id } }`;

interface JadwalItem { id: string; hari?: string; tanggal?: string; waktuMulai?: string; lokasi?: string; materi?: string; status: string; }
interface SiswaItem { id: string; namaLengkap: string; }
interface AbsensiItem { id: string; jadwalId: string; siswaId: string; tanggal: string; status: string; }

const STATUS_LIST = [
  { key: 'hadir', label: 'Hadir', cls: 'bg-green-500/15 border-green-500/30 text-green-600' },
  { key: 'izin', label: 'Izin', cls: 'bg-blue-500/15 border-blue-500/30 text-blue-600' },
  { key: 'sakit', label: 'Sakit', cls: 'bg-amber-500/15 border-amber-500/30 text-amber-600' },
  { key: 'alpha', label: 'Alpha', cls: 'bg-destructive/15 border-destructive/30 text-destructive' },
];

/**
 * Flow absensi satu-tap untuk pelatih:
 * pilih jadwal hari ini → tap status per siswa → simpan semua.
 */
export default function AbsensiCepatPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: jadwalData, loading: jadwalLoading } = useQuery<{ jadwalLatihan: JadwalItem[] }>(GET_JADWAL, { fetchPolicy: 'cache-and-network' });
  const { data: siswaData } = useQuery<{ siswa: SiswaItem[] }>(GET_SISWA);
  const { data: absensiData, refetch } = useQuery<{ absensi: AbsensiItem[] }>(GET_ABSENSI, { fetchPolicy: 'cache-and-network' });
  const [createAbsensi] = useMutation(CREATE_ABSENSI);

  const [selectedJadwal, setSelectedJadwal] = useState<string>('');
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const jadwalList = jadwalData?.jadwalLatihan || [];
  const siswaList = siswaData?.siswa || [];
  const absensiList = absensiData?.absensi || [];

  // Jadwal hari ini di prioritaskan; sisanya tetap bisa dipilih
  const jadwalHariIni = useMemo(() => jadwalList.filter(j => j.tanggal === today), [jadwalList, today]);
  const jadwalLain = useMemo(() => jadwalList.filter(j => j.tanggal !== today), [jadwalList, today]);
  const jadwalAktif = jadwalHariIni.length > 0 ? jadwalHariIni : jadwalLain;

  const sudahTercatat = useMemo(() => {
    const set = new Set<string>();
    absensiList.forEach(a => { if (a.jadwalId === selectedJadwal) set.add(a.siswaId); });
    return set;
  }, [absensiList, selectedJadwal]);

  const labelJadwal = (j: JadwalItem) =>
    [j.materi || 'Latihan', j.waktuMulai, j.lokasi].filter(Boolean).join(' · ');

  const handleSave = async () => {
    if (!selectedJadwal) return;
    const target = siswaList.filter(s => !sudahTercatat.has(s.id));
    if (target.length === 0) {
      toast.info('Semua siswa sudah tercatat pada sesi ini.');
      return;
    }
    setSaving(true);
    try {
      let ok = 0;
      for (const s of target) {
        const status = marks[s.id] || 'hadir';
        try {
          await createAbsensi({ variables: { jadwalId: selectedJadwal, siswaId: s.id, tanggal: today, status } });
          ok += 1;
        } catch { /* lanjut ke siswa berikutnya */ }
      }
      toast.success(`Absensi tersimpan untuk ${ok} siswa.`);
      setMarks({});
      refetch();
    } finally {
      setSaving(false);
    }
  };

  const jumlahDitandai = Object.keys(marks).length;

  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          Absensi Cepat <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">Pelatih</span>
        </h2>
        <p className="text-xs text-muted-foreground font-medium">Pilih sesi latihan, tap status tiap siswa, lalu simpan — selesai dalam hitungan detik.</p>
      </div>

      {/* Pilih sesi latihan */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-3">
        <h3 className="font-black text-sm text-foreground flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Sesi Latihan</h3>
        {jadwalLoading ? (
          <div className="flex items-center gap-2 text-2xs text-muted-foreground font-semibold"><Loader2 className="w-4 h-4 animate-spin" /> Memuat jadwal...</div>
        ) : jadwalAktif.length === 0 ? (
          <p className="text-2xs text-muted-foreground font-semibold">Tidak ada jadwal latihan tersedia.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {jadwalAktif.slice(0, 6).map(j => (
              <button
                key={j.id}
                onClick={() => { setSelectedJadwal(j.id); setMarks({}); }}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${selectedJadwal === j.id ? 'bg-primary/10 border-primary/40' : 'bg-background border-border hover:border-primary/30'}`}
              >
                <p className="text-2xs font-extrabold text-foreground truncate">{j.materi || 'Latihan'}</p>
                <p className="text-4xs text-muted-foreground font-semibold flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {[j.tanggal ? format(new Date(j.tanggal), 'dd MMM', { locale: localeID }) : j.hari, j.waktuMulai, j.lokasi].filter(Boolean).join(' · ')}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tap status per siswa */}
      {selectedJadwal && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-foreground">Status Siswa</h3>
            <span className="text-4xs font-bold text-muted-foreground uppercase">{siswaList.length} siswa · {jumlahDitandai} ditandai manual</span>
          </div>
          {siswaList.length === 0 ? (
            <p className="text-2xs text-muted-foreground font-semibold">Belum ada siswa terdaftar.</p>
          ) : (
            <div className="space-y-2">
              {siswaList.map(s => {
                const tercatat = sudahTercatat.has(s.id);
                const current = marks[s.id] || (tercatat ? '' : 'hadir');
                return (
                  <div key={s.id} className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${tercatat ? 'bg-muted/40 border-border opacity-60' : 'bg-background border-border'}`}>
                    <div className="min-w-0">
                      <p className="text-2xs font-extrabold text-foreground truncate">{s.namaLengkap}</p>
                      {tercatat && <p className="text-4xs text-muted-foreground font-bold uppercase">Sudah tercatat di sesi ini</p>}
                    </div>
                    {!tercatat && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {STATUS_LIST.map(st => (
                          <button
                            key={st.key}
                            onClick={() => setMarks(p => ({ ...p, [s.id]: st.key }))}
                            className={`px-2.5 py-1.5 text-4xs font-black rounded-lg border transition-all cursor-pointer ${current === st.key ? st.cls : 'bg-card border-border text-muted-foreground hover:bg-muted'}`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
            <p className="text-4xs text-muted-foreground font-semibold">Siswa tanpa tanda dianggap <strong className="text-green-600">Hadir</strong>.</p>
            <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl gap-1.5 h-10 px-5 text-xs cursor-pointer">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Simpan Absensi</span>
            </Button>
          </div>
        </div>
      )}

      {!selectedJadwal && !jadwalLoading && (
        <div className="p-6 bg-card border border-dashed border-border rounded-xl text-center">
          <AlertCircle className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
          <p className="text-2xs text-muted-foreground font-semibold">Pilih sesi latihan di atas untuk mulai mencatat absensi.</p>
        </div>
      )}
    </div>
  );
}
