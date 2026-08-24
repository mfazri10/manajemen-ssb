'use client';
import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Loader2, AlertCircle, Radar as RadarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

const GET = gql`query GetEvaluasi { evaluasi { id siswaId pelatihId semester tahunAjaran teknik fisik taktik mental catatanPelatih } }`;
const GET_SISWA = gql`query GetSiswaEv { siswa { id namaLengkap } }`;
const CREATE = gql`mutation CreateEv($siswaId:ID!,$semester:String!,$tahunAjaran:String!,$pelatihId:ID,$teknik:Int,$fisik:Int,$taktik:Int,$mental:Int,$catatanPelatih:String) { createEvaluasi(siswaId:$siswaId,semester:$semester,tahunAjaran:$tahunAjaran,pelatihId:$pelatihId,teknik:$teknik,fisik:$fisik,taktik:$taktik,mental:$mental,catatanPelatih:$catatanPelatih) { id } }`;
const DELETE = gql`mutation DeleteEv($id:ID!) { deleteEvaluasi(id:$id) }`;

interface EvData { id: string; siswaId: string; pelatihId?: string; semester: string; tahunAjaran: string; teknik?: number; fisik?: number; taktik?: number; mental?: number; catatanPelatih?: string; }

export default function AdminEvaluasiPage() {
  const { data, loading, error, refetch } = useQuery<{ evaluasi: EvData[] }>(GET, { fetchPolicy: 'cache-and-network' });
  const { data: siswaData } = useQuery<{ siswa: { id: string; namaLengkap: string }[] }>(GET_SISWA);
  const [createEv] = useMutation(CREATE);
  const [deleteEv] = useMutation(DELETE);
  const { ask, dialog } = useConfirmDialog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [f, setF] = useState({ siswaId: '', semester: '1', tahunAjaran: '2025/2026', teknik: '', fisik: '', taktik: '', mental: '', catatanPelatih: '' });
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));
  const siswaMap = Object.fromEntries((siswaData?.siswa || []).map(s => [s.id, s.namaLengkap]));

  // === Radar chart 4 dimensi (teknik/fisik/taktik/mental) per siswa ===
  const [radarSiswa, setRadarSiswa] = useState('');
  const evaluasiList = data?.evaluasi || [];

  const radarData = useMemo(() => {
    if (!radarSiswa) return null;
    const milik = evaluasiList.filter(e => e.siswaId === radarSiswa);
    if (milik.length === 0) return null;
    // Ambil evaluasi terbaru (tahun ajaran desc, lalu semester desc)
    const terbaru = [...milik].sort((a, b) =>
      b.tahunAjaran.localeCompare(a.tahunAjaran) || String(b.semester).localeCompare(String(a.semester)),
    )[0]!;
    return {
      label: `Sem ${terbaru.semester} ${terbaru.tahunAjaran}`,
      dimensi: [
        { dimensi: 'Teknik', nilai: Number(terbaru.teknik ?? 0) },
        { dimensi: 'Fisik', nilai: Number(terbaru.fisik ?? 0) },
        { dimensi: 'Taktik', nilai: Number(terbaru.taktik ?? 0) },
        { dimensi: 'Mental', nilai: Number(terbaru.mental ?? 0) },
      ],
    };
  }, [radarSiswa, evaluasiList]);

  const handleDelete = (i: EvData) => ask({
    title: 'Hapus evaluasi?',
    description: `Evaluasi ${siswaMap[i.siswaId] || i.siswaId} semester ${i.semester} ${i.tahunAjaran} akan dihapus permanen.`,
    onConfirm: async () => { try { await deleteEv({ variables: { id: i.id } }); toast.success('Dihapus.'); refetch(); } catch (e: any) { toast.error(e?.message); } },
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const vars: Record<string, unknown> = { siswaId: f.siswaId, semester: f.semester, tahunAjaran: f.tahunAjaran };
      for (const k of ['teknik', 'fisik', 'taktik', 'mental']) { const v = f[k as keyof typeof f]; if (v) vars[k] = parseInt(v as string); }
      if (f.catatanPelatih) vars.catatanPelatih = f.catatanPelatih;
      await createEv({ variables: vars }); toast.success('Ditambahkan.'); setDialogOpen(false); refetch();
    } catch (e: any) { toast.error(e?.message); } finally { setSubmitting(false); }
  };

  const columns: ColumnDef<EvData>[] = [
    { header: 'Siswa', cell: i => siswaMap[i.siswaId] || '-', className: 'font-extrabold text-sm' },
    { header: 'Semester', cell: i => `Sem ${i.semester} ${i.tahunAjaran}`, className: 'text-xs' },
    { header: 'Teknik', cell: i => i.teknik ?? '-', className: 'text-xs font-bold text-center' },
    { header: 'Fisik', cell: i => i.fisik ?? '-', className: 'text-xs font-bold text-center' },
    { header: 'Taktik', cell: i => i.taktik ?? '-', className: 'text-xs font-bold text-center' },
    { header: 'Mental', cell: i => i.mental ?? '-', className: 'text-xs font-bold text-center' },
    { header: 'Catatan', cell: i => i.catatanPelatih ? (i.catatanPelatih.length > 30 ? i.catatanPelatih.slice(0, 30) + '...' : i.catatanPelatih) : '-', className: 'text-xs' },
    { header: '', className: 'text-right w-12', cell: i => <Button onClick={() => handleDelete(i)} variant="ghost" size="sm" className="h-8 px-2 bg-destructive/10 border border-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></Button> },
  ];

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">Evaluasi Siswa <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">Evaluasi</span></h2>
        <p className="text-xs text-muted-foreground font-medium">Evaluasi perkembangan siswa per semester (teknik, fisik, taktik, mental).</p>
      </div>
      {error ? <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs"><AlertCircle className="w-4 h-4" /><span className="font-bold">{error.message}</span></div> : (
        <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
          <DataTable data={data?.evaluasi || []} columns={columns} loading={loading} searchPlaceholder="Cari..." searchKeys={['siswaId']} emptyMessage="Belum ada evaluasi." actions={<Button onClick={() => { setF({ siswaId: '', semester: '1', tahunAjaran: '2025/2026', teknik: '', fisik: '', taktik: '', mental: '', catatanPelatih: '' }); setDialogOpen(true); }} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"><Plus className="w-3.5 h-3.5" /><span>Tambah</span></Button>} />
        </div>
      )}

      {/* Radar chart 4 dimensi per siswa */}
      <div className="bg-card border border-border rounded-md p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-black text-sm text-foreground flex items-center gap-2"><RadarIcon className="w-4 h-4 text-primary" /> Profil Kemampuan (Radar 4 Dimensi)</h3>
          <select value={radarSiswa} onChange={e => setRadarSiswa(e.target.value)} className="px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-bold">
            <option value="">-- Pilih Siswa --</option>
            {(siswaData?.siswa || []).map(s => <option key={s.id} value={s.id}>{s.namaLengkap}</option>)}
          </select>
        </div>
        {!radarSiswa ? (
          <div className="h-56 flex items-center justify-center text-2xs text-muted-foreground font-semibold">Pilih siswa untuk melihat profil kemampuannya.</div>
        ) : !radarData ? (
          <div className="h-56 flex items-center justify-center text-2xs text-muted-foreground font-semibold">Belum ada evaluasi untuk siswa ini.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData.dimensi} outerRadius="75%">
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="dimensi" tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontWeight: 700 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} tickCount={5} />
                  <Radar dataKey="nilai" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.35} />
                  <Tooltip formatter={(v) => [`${v} / 100`, 'Nilai']} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wide">Evaluasi terbaru: {radarData.label}</p>
              <div className="grid grid-cols-2 gap-2">
                {radarData.dimensi.map(d => (
                  <div key={d.dimensi} className="p-3 bg-background border border-border rounded-xl">
                    <p className="text-4xs font-bold text-muted-foreground uppercase">{d.dimensi}</p>
                    <p className="text-lg font-black text-primary">{d.nilai}<span className="text-4xs text-muted-foreground font-bold"> /100</span></p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-lg rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">Tambah Evaluasi</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Siswa</label><select value={f.siswaId} onChange={e => set('siswaId', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required><option value="">-- Pilih --</option>{(siswaData?.siswa || []).map(s => <option key={s.id} value={s.id}>{s.namaLengkap}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Semester</label><select value={f.semester} onChange={e => set('semester', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"><option value="1">Semester 1</option><option value="2">Semester 2</option></select></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tahun Ajaran</label><input type="text" value={f.tahunAjaran} onChange={e => set('tahunAjaran', e.target.value)} placeholder="2025/2026" className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required /></div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {['teknik', 'fisik', 'taktik', 'mental'].map(k => (
                <div key={k} className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">{k}</label><input type="number" min="1" max="100" value={f[k as keyof typeof f]} onChange={e => set(k, e.target.value)} placeholder="0-100" className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
              ))}
            </div>
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Catatan Pelatih</label><textarea value={f.catatanPelatih} onChange={e => set('catatanPelatih', e.target.value)} rows={3} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
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
