'use client';
import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Trash2, Loader2, AlertCircle, Trophy, Medal, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const GET = gql`query GetTesFisik { tesFisik { id siswaId kelompokUmurId tanggal jenisTes nilai satuan catatan } }`;
const GET_SISWA = gql`query GetSiswaTF { siswa { id namaLengkap } }`;
const GET_KU = gql`query GetKUTF { kelompokUmur { id nama } }`;
const CREATE = gql`mutation CreateTF($siswaId:ID!,$tanggal:String!,$jenisTes:String!,$nilai:Float!,$satuan:String,$catatan:String,$kelompokUmurId:ID) { createTesFisik(siswaId:$siswaId,tanggal:$tanggal,jenisTes:$jenisTes,nilai:$nilai,satuan:$satuan,catatan:$catatan,kelompokUmurId:$kelompokUmurId) { id } }`;
const DELETE = gql`mutation DeleteTF($id:ID!) { deleteTesFisik(id:$id) }`;

interface TFData { id: string; siswaId: string; kelompokUmurId?: string; tanggal: string; jenisTes: string; nilai: number; satuan?: string; catatan?: string; }
interface SiswaOption { id: string; namaLengkap: string; }
interface KuOption { id: string; nama: string; }

export default function AdminTesFisikPage() {
  const { data, loading, error, refetch } = useQuery<{ tesFisik: TFData[] }>(GET, { fetchPolicy: 'cache-and-network' });
  const { data: siswaData } = useQuery<{ siswa: SiswaOption[] }>(GET_SISWA);
  const { data: kuData } = useQuery<{ kelompokUmur: KuOption[] }>(GET_KU);
  const [createTF] = useMutation(CREATE);
  const [deleteTF] = useMutation(DELETE);
  const { ask, dialog } = useConfirmDialog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [f, setF] = useState({ siswaId: '', kelompokUmurId: '', tanggal: new Date().toISOString().split('T')[0], jenisTes: '', nilai: '', satuan: '', catatan: '' });
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));
  const siswaMap = Object.fromEntries((siswaData?.siswa || []).map(s => [s.id, s.namaLengkap]));
  const kuList = kuData?.kelompokUmur || [];
  const tesList = data?.tesFisik || [];

  // === Leaderboard ===
  const [filterKu, setFilterKu] = useState('');
  const jenisTesOptions = useMemo(() => Array.from(new Set(tesList.map(t => t.jenisTes))).sort(), [tesList]);
  const [filterTes, setFilterTes] = useState('');

  const leaderboard = useMemo(() => {
    let rows = tesList;
    if (filterKu) rows = rows.filter(t => t.kelompokUmurId === filterKu);
    if (filterTes) rows = rows.filter(t => t.jenisTes === filterTes);
    const bySiswa: Record<string, { total: number; count: number }> = {};
    rows.forEach(t => {
      if (!bySiswa[t.siswaId]) bySiswa[t.siswaId] = { total: 0, count: 0 };
      bySiswa[t.siswaId]!.total += Number(t.nilai);
      bySiswa[t.siswaId]!.count += 1;
    });
    return Object.entries(bySiswa)
      .map(([siswaId, v]) => ({ siswaId, rata: v.total / v.count, jumlahTes: v.count }))
      .sort((a, b) => b.rata - a.rata);
  }, [tesList, filterKu, filterTes]);

  // Data grafik: rata-rata nilai per siswa untuk filter KU/jenis tes aktif
  const grafikData = useMemo(() => leaderboard.map(row => ({
    nama: (siswaMap[row.siswaId] || 'Siswa').split(' ')[0] || 'Siswa',
    nilai: Number(row.rata.toFixed(2)),
  })), [leaderboard, siswaMap]);

  const PEDOMAN: { tes: string; tujuan: string; satuan: string; tips: string }[] = [
    { tes: 'Sprint 30m', tujuan: 'Kecepatan akselerasi', satuan: 'detik (semakin kecil semakin baik)', tips: 'Ukur dengan stopwatch digital; start dari posisi berdiri.' },
    { tes: 'Lari 1km', tujuan: 'Daya tahan kardiovaskular', satuan: 'menit:detik (semakin kecil semakin baik)', tips: 'Lakukan pagi hari sebelum latihan inti; catat cuaca.' },
    { tes: 'Vertical Jump', tujuan: 'Daya ledak otot tungkai', satuan: 'cm (semakin besar semakin baik)', tips: '3 kali percobaan, ambil hasil terbaik.' },
    { tes: 'Illinois Agility', tujuan: 'Kelincahan & perubahan arah', satuan: 'detik (semakin kecil semakin baik)', tips: 'Pastikan lintasan standar; permukaan rata dan kering.' },
    { tes: 'Sit-Up 1 Menit', tujuan: 'Kekuatan otot inti', satuan: 'jumlah repetisi', tips: 'Tempo konsisten; wasit menghitung hanya gerakan sempurna.' },
  ];

  const handleDelete = (i: TFData) => ask({
    title: 'Hapus hasil tes fisik?',
    description: `Hasil tes "${i.jenisTes}" milik ${siswaMap[i.siswaId] || 'siswa'} akan dihapus permanen.`,
    onConfirm: async () => {
      try { await deleteTF({ variables: { id: i.id } }); toast.success('Dihapus.'); refetch(); } catch (e: any) { toast.error(e?.message); }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const vars: Record<string, unknown> = { siswaId: f.siswaId, tanggal: f.tanggal, jenisTes: f.jenisTes, nilai: parseFloat(f.nilai) };
      if (f.satuan) vars.satuan = f.satuan;
      if (f.catatan) vars.catatan = f.catatan;
      if (f.kelompokUmurId) vars.kelompokUmurId = f.kelompokUmurId;
      await createTF({ variables: vars }); toast.success('Ditambahkan.'); setDialogOpen(false); refetch();
    } catch (e: any) { toast.error(e?.message); } finally { setSubmitting(false); }
  };

  const columns: ColumnDef<TFData>[] = [
    { header: 'Siswa', cell: i => siswaMap[i.siswaId] || '-', className: 'font-extrabold text-sm' },
    { header: 'Tanggal', accessorKey: 'tanggal', className: 'text-xs' },
    { header: 'Jenis Tes', accessorKey: 'jenisTes', className: 'text-xs font-bold' },
    { header: 'Nilai', cell: i => `${i.nilai} ${i.satuan || ''}`, className: 'text-xs font-bold' },
    { header: 'Catatan', cell: i => i.catatan || '-', className: 'text-xs' },
    { header: '', className: 'text-right w-12', cell: i => <Button onClick={() => handleDelete(i)} variant="ghost" size="sm" className="h-8 px-2 bg-destructive/10 border border-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></Button> },
  ];

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">Tes Fisik <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">Evaluasi</span></h2>
        <p className="text-xs text-muted-foreground font-medium">Catat hasil tes fisik siswa (sprint, endurance, dll) dan lihat peringkat per kelompok umur.</p>
      </div>

      {error ? <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs"><AlertCircle className="w-4 h-4" /><span className="font-bold">{error.message}</span></div> : (
        <Tabs defaultValue="data">
          <TabsList>
            <TabsTrigger value="data">Input &amp; Hasil</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
            <TabsTrigger value="grafik">Grafik</TabsTrigger>
            <TabsTrigger value="pedoman">Pedoman</TabsTrigger>
          </TabsList>

          <TabsContent value="data">
            <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
              <DataTable data={tesList} columns={columns} loading={loading} searchPlaceholder="Cari..." searchKeys={['jenisTes']} emptyMessage="Belum ada data." actions={<Button onClick={() => { setF({ siswaId: '', kelompokUmurId: '', tanggal: new Date().toISOString().split('T')[0], jenisTes: '', nilai: '', satuan: '', catatan: '' }); setDialogOpen(true); }} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"><Plus className="w-3.5 h-3.5" /><span>Tambah</span></Button>} />
            </div>
          </TabsContent>

          <TabsContent value="ranking">
            <div className="bg-card border border-border rounded-md p-5 shadow-2xs space-y-4">
              {/* Filter KU + jenis tes */}
              <div className="flex flex-wrap items-center gap-3">
                <select value={filterKu} onChange={e => setFilterKu(e.target.value)} className="px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-bold">
                  <option value="">Semua Kelompok Umur</option>
                  {kuList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
                <select value={filterTes} onChange={e => setFilterTes(e.target.value)} className="px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-bold">
                  <option value="">Semua Jenis Tes</option>
                  {jenisTesOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {leaderboard.length === 0 ? (
                <div className="py-10 text-center text-2xs text-muted-foreground font-semibold">Belum ada data untuk ditampilkan pada leaderboard.</div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((row, idx) => (
                    <div key={row.siswaId} className={`flex items-center gap-3 p-3 rounded-xl border ${idx < 3 ? 'bg-primary/5 border-primary/20' : 'bg-background border-border'}`}>
                      <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
                        {idx === 0 ? <Trophy className="w-4 h-4 text-yellow-500" /> : idx === 1 ? <Medal className="w-4 h-4 text-slate-400" /> : idx === 2 ? <Medal className="w-4 h-4 text-amber-600" /> : <span className="text-2xs font-black text-muted-foreground">{idx + 1}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-2xs font-extrabold text-foreground truncate">{siswaMap[row.siswaId] || 'Siswa'}</p>
                        <p className="text-4xs text-muted-foreground font-medium">{row.jumlahTes} catatan tes</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-primary">{row.rata.toLocaleString('id', { maximumFractionDigits: 2 })}</p>
                        <p className="text-4xs text-muted-foreground font-bold uppercase">Rata-rata</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="grafik">
            <div className="bg-card border border-border rounded-md p-5 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-black text-sm text-foreground">Grafik Rata-rata Nilai per Siswa</h3>
                <div className="flex items-center gap-2">
                  <select value={filterTes} onChange={e => setFilterTes(e.target.value)} className="px-3 py-1.5 text-2xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none font-bold">
                    <option value="">Semua Jenis Tes</option>
                    {jenisTesOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 text-2xs font-bold bg-primary/10 border border-primary/20 text-primary rounded-xl hover:bg-primary/20 transition-all cursor-pointer">
                    <Printer className="w-3.5 h-3.5" /> Cetak
                  </button>
                </div>
              </div>
              {grafikData.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-2xs text-muted-foreground font-semibold">Belum ada data untuk grafik.</div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={grafikData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="nama" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={35} />
                      <Tooltip cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
                      <Bar dataKey="nilai" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pedoman">
            <div className="bg-card border border-border rounded-md p-5 shadow-2xs space-y-3">
              <h3 className="font-black text-sm text-foreground">Pedoman Pelaksanaan Tes Fisik</h3>
              <p className="text-3xs text-muted-foreground font-medium">Referensi umum pengukuran — sesuaikan dengan standar kurikulum akademi Anda.</p>
              <div className="space-y-2.5">
                {PEDOMAN.map(p => (
                  <div key={p.tes} className="p-4 bg-background border border-border rounded-xl">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-2xs font-black text-foreground">{p.tes}</p>
                      <span className="text-4xs font-bold px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full">{p.tujuan}</span>
                    </div>
                    <p className="text-4xs text-muted-foreground font-medium mt-1.5"><strong className="text-foreground">Satuan:</strong> {p.satuan}</p>
                    <p className="text-4xs text-muted-foreground font-medium mt-1"><strong className="text-foreground">Tips:</strong> {p.tips}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">Tambah Tes Fisik</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Siswa</label><select value={f.siswaId} onChange={e => set('siswaId', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required><option value="">-- Pilih --</option>{(siswaData?.siswa || []).map(s => <option key={s.id} value={s.id}>{s.namaLengkap}</option>)}</select></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Kelompok Umur</label><select value={f.kelompokUmurId} onChange={e => set('kelompokUmurId', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"><option value="">-- Opsional --</option>{kuList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tanggal</label><input type="date" value={f.tanggal} onChange={e => set('tanggal', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required /></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Jenis Tes</label><input type="text" value={f.jenisTes} onChange={e => set('jenisTes', e.target.value)} placeholder="Sprint 30m, Lari 1km, dll" className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Nilai</label><input type="number" step="0.01" value={f.nilai} onChange={e => set('nilai', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required /></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Satuan</label><input type="text" value={f.satuan} onChange={e => set('satuan', e.target.value)} placeholder="detik, meter, dll" className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
            </div>
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Catatan</label><textarea value={f.catatan} onChange={e => set('catatan', e.target.value)} rows={2} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
            <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <Button type="button" onClick={() => setDialogOpen(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer">Batal</Button>
              <Button type="submit" disabled={submitting} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2">{submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}<span>Simpan</span></Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {dialog}
    </div>
  );
}
