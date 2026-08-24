'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Loader2, AlertCircle, CreditCard, Zap, BellRing } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

const GET_TAGIHAN = gql`query GetTagihan { sppTagihan { id siswaId bulan tahun jumlah status jatuhTempo } }`;
const GET_SISWA = gql`query GetSiswaSpp { siswa { id namaLengkap } }`;
const CREATE_TAGIHAN = gql`mutation CreateTagihan($siswaId:ID!,$bulan:Int!,$tahun:Int!,$jumlah:Float!,$jatuhTempo:String,$status:String) { createSppTagihan(siswaId:$siswaId,bulan:$bulan,tahun:$tahun,jumlah:$jumlah,jatuhTempo:$jatuhTempo,status:$status) { id } }`;
const UPDATE_TAGIHAN = gql`mutation UpdateTagihan($id:ID!,$jumlah:Float,$status:String,$jatuhTempo:String) { updateSppTagihan(id:$id,jumlah:$jumlah,status:$status,jatuhTempo:$jatuhTempo) { id } }`;
const DELETE_TAGIHAN = gql`mutation DeleteTagihan($id:ID!) { deleteSppTagihan(id:$id) }`;
const GENERATE_SPP_OTOMATIS = gql`mutation GenerateSppOtomatis { generateSppTagihanOtomatis }`;

const GET_PEMBAYARAN = gql`query GetPembayaran($tagihanId:ID!) { sppPembayaran(tagihanId:$tagihanId) { id tanggalBayar jumlah metode buktiUrl keterangan } }`;
const CREATE_PEMBAYARAN = gql`mutation CreateBayar($tagihanId:ID!,$tanggalBayar:String!,$jumlah:Float!,$metode:String,$keterangan:String) { createSppPembayaran(tagihanId:$tagihanId,tanggalBayar:$tanggalBayar,jumlah:$jumlah,metode:$metode,keterangan:$keterangan) { id } }`;
const DELETE_PEMBAYARAN = gql`mutation DeleteBayar($id:ID!) { deleteSppPembayaran(id:$id) }`;

interface Tagihan { id: string; siswaId: string; bulan: number; tahun: number; jumlah: number; status: string; jatuhTempo?: string; }
interface Bayar { id: string; tanggalBayar: string; jumlah: number; metode?: string; keterangan?: string; }
interface RefData { id: string; namaLengkap?: string; }

const BULAN = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const STATUS_COLOR: Record<string, string> = { lunas: 'bg-green-500/10 text-green-600', belum: 'bg-amber-500/10 text-amber-600', dispensasi: 'bg-blue-500/10 text-blue-600' };

export default function AdminSppPage() {
  const { data, loading, error, refetch } = useQuery<{ sppTagihan: Tagihan[] }>(GET_TAGIHAN, { fetchPolicy: 'cache-and-network' });
  const { data: siswaData } = useQuery<{ siswa: RefData[] }>(GET_SISWA);
  const [createTagihan] = useMutation(CREATE_TAGIHAN);
  const [updateTagihan] = useMutation(UPDATE_TAGIHAN);
  const [deleteTagihan] = useMutation(DELETE_TAGIHAN);
  const [createBayar] = useMutation(CREATE_PEMBAYARAN);
  const [deleteBayar] = useMutation(DELETE_PEMBAYARAN);
  const [generateSpp, { loading: generating }] = useMutation(GENERATE_SPP_OTOMATIS);
  const { ask, dialog } = useConfirmDialog();

  const handleGenerateOtomatis = () => ask({
    title: 'Generate tagihan otomatis?',
    description: 'Tagihan SPP akan dihasilkan untuk semua siswa aktif bulan ini.',
    destructive: false,
    confirmLabel: 'Ya, generate',
    onConfirm: async () => {
      try {
        const { data } = await generateSpp();
        const count = data?.generateSppTagihanOtomatis || 0;
        toast.success(`Berhasil menghasilkan ${count} tagihan SPP untuk bulan ini.`);
        refetch();
      } catch (e: any) {
        toast.error(e?.message || 'Gagal menghasilkan tagihan otomatis.');
      }
    },
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [bayarDialogOpen, setBayarDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<Tagihan | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date();
  const currentMonth = (today.getMonth() + 1).toString();
  const currentYear = today.getFullYear().toString();
  // Tanggal 10 bulan ini
  const defaultDueDate = `${currentYear}-${currentMonth.padStart(2, '0')}-10`;

  const empty = { 
    siswaId: '', 
    bulan: currentMonth, 
    tahun: currentYear, 
    jumlah: '150000', 
    jatuhTempo: defaultDueDate, 
    status: 'belum' 
  };
  const [f, setF] = useState(empty);
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  const emptyBayar = { tanggalBayar: new Date().toISOString().split('T')[0], jumlah: '', metode: 'tunai', keterangan: '' };
  const [fb, setFb] = useState(emptyBayar);
  const setB = (k: string, v: string) => setFb(p => ({ ...p, [k]: v }));

  const siswaMap = Object.fromEntries((siswaData?.siswa || []).map(s => [s.id, s.namaLengkap || '']));

  const handleOpenCreate = () => { setFormMode('create'); setSelected(null); setF(empty); setDialogOpen(true); };
  const handleOpenEdit = (t: Tagihan) => { setFormMode('edit'); setSelected(t); setF({ siswaId: t.siswaId, bulan: t.bulan.toString(), tahun: t.tahun.toString(), jumlah: t.jumlah.toString(), jatuhTempo: t.jatuhTempo || '', status: t.status }); setDialogOpen(true); };
  const handleOpenBayar = (t: Tagihan) => { setSelected(t); setFb(emptyBayar); setBayarDialogOpen(true); };
  const handleDelete = (t: Tagihan) => ask({
    title: 'Hapus tagihan?',
    description: `Tagihan ${BULAN[t.bulan]} ${t.tahun} milik ${siswaMap[t.siswaId] || 'siswa'} akan dihapus permanen.`,
    onConfirm: async () => {
      try { await deleteTagihan({ variables: { id: t.id } }); toast.success('Dihapus.'); refetch(); } catch (e: any) { toast.error(e?.message); }
    },
  });

  // Tunggakan: tagihan belum lunas yang sudah lewat jatuh tempo
  const now = new Date().toISOString().split('T')[0] ?? '';
  const tunggakan = (data?.sppTagihan || []).filter(t => t.status === 'belum' && t.jatuhTempo && t.jatuhTempo < now);
  const totalTunggakan = tunggakan.reduce((sum, t) => sum + Number(t.jumlah), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const vars: Record<string, unknown> = { siswaId: f.siswaId, bulan: parseInt(f.bulan), tahun: parseInt(f.tahun), jumlah: parseFloat(f.jumlah) };
      if (f.jatuhTempo) vars.jatuhTempo = f.jatuhTempo;
      if (f.status) vars.status = f.status;
      if (formMode === 'create') { await createTagihan({ variables: vars }); toast.success('Tagihan dibuat.'); }
      else { await updateTagihan({ variables: { id: selected!.id, jumlah: parseFloat(f.jumlah), status: f.status, jatuhTempo: f.jatuhTempo || undefined } }); toast.success('Diperbarui.'); }
      setDialogOpen(false); refetch();
    } catch (e: any) { toast.error(e?.message); } finally { setSubmitting(false); }
  };

  const handleBayar = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await createBayar({ variables: { tagihanId: selected!.id, tanggalBayar: fb.tanggalBayar, jumlah: parseFloat(fb.jumlah), metode: fb.metode, keterangan: fb.keterangan || undefined } });
      toast.success('Pembayaran dicatat.'); setBayarDialogOpen(false); refetch();
    } catch (e: any) { toast.error(e?.message); } finally { setSubmitting(false); }
  };

  const columns: ColumnDef<Tagihan>[] = [
    { header: 'Siswa', cell: t => siswaMap[t.siswaId] || '-', className: 'font-extrabold text-sm' },
    { header: 'Periode', cell: t => `${BULAN[t.bulan]} ${t.tahun}`, className: 'text-xs' },
    { header: 'Jumlah', cell: t => `Rp ${Number(t.jumlah).toLocaleString('id')}`, className: 'text-xs font-bold' },
    { header: 'Jatuh Tempo', cell: t => t.jatuhTempo || '-', className: 'text-xs' },
    { header: 'Status', cell: t => <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[t.status] || ''}`}>{t.status}</span> },
    { header: 'Aksi', className: 'text-right w-32', cell: t => (
      <div className="flex items-center justify-end gap-1">
        <Button onClick={() => handleOpenBayar(t)} variant="ghost" size="sm" className="h-8 px-2 bg-green-500/10 border border-green-500/20 hover:bg-green-500/30 text-green-600 rounded-lg cursor-pointer" title="Bayar"><CreditCard className="w-3.5 h-3.5" /></Button>
        <Button onClick={() => handleOpenEdit(t)} variant="ghost" size="sm" className="h-8 px-2 bg-background border border-border hover:bg-muted rounded-lg cursor-pointer"><Edit2 className="w-3.5 h-3.5 text-primary" /></Button>
        <Button onClick={() => handleDelete(t)} variant="ghost" size="sm" className="h-8 px-2 bg-destructive/10 border border-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></Button>
      </div>
    ) },
  ];

  const Field = ({ label, k, type = 'text', opts, ...props }: { label: string; k: string; type?: string; opts?: { v: string; l: string }[]; [key: string]: any }) => (
    <div className="space-y-1">
      <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">{label}</label>
      {opts ? (
        <select value={f[k as keyof typeof f]} onChange={e => set(k, e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" {...props}>
          <option value="">-- Pilih --</option>
          {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      ) : (
        <input type={type} value={f[k as keyof typeof f]} onChange={e => set(k, e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" {...props} />
      )}
    </div>
  );

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">SPP & Tagihan <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">Keuangan</span></h2>
        <p className="text-xs text-muted-foreground font-medium">Kelola tagihan SPP bulanan dan pembayaran siswa.</p>
      </div>

      {/* Alert tunggakan: tagihan belum lunas yang lewat jatuh tempo */}
      {tunggakan.length > 0 && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-center gap-3">
          <span className="p-2 bg-destructive/15 border border-destructive/25 rounded-lg shrink-0"><BellRing className="w-4 h-4 text-destructive" /></span>
          <div className="flex-1">
            <p className="text-2xs font-black text-destructive uppercase tracking-wide">Ada {tunggakan.length} tunggakan SPP</p>
            <p className="text-3xs text-destructive/80 font-semibold mt-0.5">
              Total Rp {totalTunggakan.toLocaleString('id')} sudah lewat jatuh tempo. Segera tindak lanjuti ke orang tua siswa.
            </p>
          </div>
        </div>
      )}

      {error ? <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs"><AlertCircle className="w-4 h-4" /><span className="font-bold">{error.message}</span></div> : (
        <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
          <DataTable
            data={data?.sppTagihan || []}
            columns={columns}
            loading={loading}
            searchPlaceholder="Cari tagihan..."
            searchKeys={['siswaId']}
            emptyMessage="Belum ada tagihan."
            actions={
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleGenerateOtomatis}
                  disabled={generating}
                  variant="outline"
                  className="border-border hover:bg-muted font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer flex items-center"
                >
                  {generating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  )}
                  <span>Generate Otomatis</span>
                </Button>
                <Button
                  onClick={handleOpenCreate}
                  className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Buat Tagihan</span>
                </Button>
              </div>
            }
          />
        </div>
      )}
      {/* Dialog Tagihan */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-lg rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">{formMode === 'create' ? 'Buat Tagihan' : 'Ubah Tagihan'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Siswa" k="siswaId" opts={(siswaData?.siswa || []).map(s => ({ v: s.id, l: s.namaLengkap || '' }))} required />
            <div className="grid grid-cols-3 gap-3">
              <Field label="Bulan" k="bulan" opts={BULAN.map((b, i) => i > 0 ? { v: i.toString(), l: b } : null).filter(Boolean) as any} required />
              <Field label="Tahun" k="tahun" type="number" required />
              <Field label="Jumlah (Rp)" k="jumlah" type="number" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Jatuh Tempo" k="jatuhTempo" type="date" />
              <Field label="Status" k="status" opts={[{ v: 'belum', l: 'Belum' }, { v: 'lunas', l: 'Lunas' }, { v: 'dispensasi', l: 'Dispensasi' }]} />
            </div>
            <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <Button type="button" onClick={() => setDialogOpen(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer">Batal</Button>
              <Button type="submit" disabled={submitting} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2">{submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}<span>{formMode === 'create' ? 'Buat' : 'Simpan'}</span></Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Dialog Bayar */}
      <Dialog open={bayarDialogOpen} onOpenChange={setBayarDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">Catat Pembayaran</DialogTitle></DialogHeader>
          <form onSubmit={handleBayar} className="space-y-4">
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tanggal Bayar</label><input type="date" value={fb.tanggalBayar} onChange={e => setB('tanggalBayar', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required /></div>
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Jumlah (Rp)</label><input type="number" value={fb.jumlah} onChange={e => setB('jumlah', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required /></div>
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Metode</label><select value={fb.metode} onChange={e => setB('metode', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium">{['tunai', 'transfer', 'qris', 'lainnya'].map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}</select></div>
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Keterangan</label><textarea value={fb.keterangan} onChange={e => setB('keterangan', e.target.value)} rows={2} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
            <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <Button type="button" onClick={() => setBayarDialogOpen(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer">Batal</Button>
              <Button type="submit" disabled={submitting} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2">{submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}<span>Bayar</span></Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {dialog}
    </div>
  );
}
