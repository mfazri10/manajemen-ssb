'use client';
import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import { AlertCircle, ArrowDownCircle, ArrowUpCircle, Wallet, ReceiptText } from 'lucide-react';

const GET_KAS = gql`query GetKasTransaksi { bukuKas { id tanggal tipe kategori jumlah keterangan } }`;
const GET_TAGIHAN = gql`query GetTagihanTransaksi { sppTagihan { id siswaId bulan tahun jumlah status jatuhTempo } }`;
const GET_SISWA = gql`query GetSiswaTransaksi { siswa { id namaLengkap } }`;

interface KasData { id: string; tanggal: string; tipe: string; kategori?: string; jumlah: number; keterangan?: string; }
interface TagihanData { id: string; siswaId: string; bulan: number; tahun: number; jumlah: number; status: string; jatuhTempo?: string; }
interface SiswaOption { id: string; namaLengkap: string; }

const NAMA_BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const rupiah = (n: number) => `Rp ${Number(n).toLocaleString('id')}`;

export default function AdminTransaksiPage() {
  const { data: kasData, loading: kasLoading, error: kasError } = useQuery<{ bukuKas: KasData[] }>(GET_KAS, { fetchPolicy: 'cache-and-network' });
  const { data: tagihanData, loading: tagihanLoading } = useQuery<{ sppTagihan: TagihanData[] }>(GET_TAGIHAN, { fetchPolicy: 'cache-and-network' });
  const { data: siswaData } = useQuery<{ siswa: SiswaOption[] }>(GET_SISWA, { fetchPolicy: 'cache-and-network' });

  const kasList = kasData?.bukuKas || [];
  const tagihanList = tagihanData?.sppTagihan || [];
  const siswaList = siswaData?.siswa || [];
  const namaSiswa = (id: string) => siswaList.find(s => s.id === id)?.namaLengkap || '-';

  const totalMasuk = kasList.filter(k => k.tipe === 'masuk').reduce((s, k) => s + Number(k.jumlah), 0);
  const totalKeluar = kasList.filter(k => k.tipe === 'keluar').reduce((s, k) => s + Number(k.jumlah), 0);
  const tagihanBelum = tagihanList.filter(t => t.status !== 'lunas');
  const totalTunggakan = tagihanBelum.reduce((s, t) => s + Number(t.jumlah), 0);

  const kolomKas: ColumnDef<KasData>[] = [
    { header: 'Tanggal', accessorKey: 'tanggal', className: 'text-xs' },
    { header: 'Tipe', cell: i => <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${i.tipe === 'masuk' ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>{i.tipe}</span> },
    { header: 'Kategori', cell: i => i.kategori || '-', className: 'text-xs' },
    { header: 'Jumlah', cell: i => rupiah(i.jumlah), className: 'text-xs font-bold' },
    { header: 'Keterangan', cell: i => i.keterangan || '-', className: 'text-xs' },
  ];

  const kolomTagihan: ColumnDef<TagihanData>[] = [
    { header: 'Siswa', cell: i => namaSiswa(i.siswaId), className: 'text-xs font-bold' },
    { header: 'Periode', cell: i => `${NAMA_BULAN[(Number(i.bulan) - 1 + 12) % 12]} ${i.tahun}`, className: 'text-xs' },
    { header: 'Jumlah', cell: i => rupiah(i.jumlah), className: 'text-xs font-bold' },
    { header: 'Jatuh Tempo', cell: i => i.jatuhTempo || '-', className: 'text-xs' },
    {
      header: 'Status', cell: i => {
        const style = i.status === 'lunas'
          ? 'bg-green-500/10 text-green-600 border-green-500/20'
          : i.status === 'dispensasi'
            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
            : 'bg-destructive/10 text-destructive border-destructive/20';
        return <span className={`text-2xs font-bold px-2 py-0.5 rounded-full border ${style}`}>{i.status}</span>;
      },
    },
  ];

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          Transaksi <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">Keuangan &amp; SPP</span>
        </h2>
        <p className="text-xs text-muted-foreground font-medium">Ringkasan arus kas dan status tagihan SPP seluruh siswa.</p>
      </div>

      {/* Kartu ringkasan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
          <p className="text-3xs font-bold text-green-600 uppercase flex items-center gap-1"><ArrowDownCircle className="w-3.5 h-3.5" /> Pemasukan</p>
          <p className="text-lg font-black text-green-600 mt-1">{rupiah(totalMasuk)}</p>
        </div>
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
          <p className="text-3xs font-bold text-destructive uppercase flex items-center gap-1"><ArrowUpCircle className="w-3.5 h-3.5" /> Pengeluaran</p>
          <p className="text-lg font-black text-destructive mt-1">{rupiah(totalKeluar)}</p>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <p className="text-3xs font-bold text-primary uppercase flex items-center gap-1"><Wallet className="w-3.5 h-3.5" /> Saldo Kas</p>
          <p className="text-lg font-black text-primary mt-1">{rupiah(totalMasuk - totalKeluar)}</p>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <p className="text-3xs font-bold text-amber-600 uppercase flex items-center gap-1"><ReceiptText className="w-3.5 h-3.5" /> Tunggakan SPP</p>
          <p className="text-lg font-black text-amber-600 mt-1">{rupiah(totalTunggakan)}</p>
          <p className="text-4xs text-amber-600/80 font-semibold">{tagihanBelum.length} tagihan belum lunas</p>
        </div>
      </div>

      {kasError ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs">
          <AlertCircle className="w-4 h-4" /><span className="font-bold">{kasError.message}</span>
        </div>
      ) : (
        <>
          <div className="bg-card border border-border rounded-md p-5 shadow-2xs space-y-2">
            <h3 className="font-black text-sm text-foreground">Arus Buku Kas</h3>
            <DataTable data={kasList} columns={kolomKas} loading={kasLoading} searchPlaceholder="Cari transaksi kas..." searchKeys={['kategori', 'keterangan']} emptyMessage="Belum ada transaksi kas." />
          </div>

          <div className="bg-card border border-border rounded-md p-5 shadow-2xs space-y-2">
            <h3 className="font-black text-sm text-foreground">Tagihan SPP</h3>
            <DataTable data={tagihanList} columns={kolomTagihan} loading={tagihanLoading} searchPlaceholder="Cari tagihan..." searchKeys={[]} emptyMessage="Belum ada tagihan SPP." />
          </div>
        </>
      )}
    </div>
  );
}
