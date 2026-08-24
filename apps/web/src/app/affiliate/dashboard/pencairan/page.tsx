'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, gql } from '@apollo/client';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, Clock, CheckCheck } from 'lucide-react';

const QUERY_STATS = gql`query { myAffiliateStats { saldoTersedia saldoPending } }`;
const QUERY_PAYOUTS = gql`query { myPayouts { id jumlah metode status requestedAt paidAt } }`;
const MUTATION_REQUEST = gql`
  mutation RequestPayout($jumlah: Float!, $metode: String!) {
    requestPayout(jumlah: $jumlah, metode: $metode) {
      id jumlah metode status requestedAt
    }
  }
`;

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: any }> = {
  requested:  { label: 'Diminta',    color: 'text-amber-600 bg-amber-50 border-amber-200',  Icon: Clock },
  processing: { label: 'Diproses',   color: 'text-blue-600 bg-blue-50 border-blue-200',    Icon: Loader2 },
  paid:       { label: 'Dibayar',    color: 'text-green-600 bg-green-50 border-green-200',  Icon: CheckCircle },
  failed:     { label: 'Gagal',      color: 'text-red-600 bg-red-50 border-red-200',        Icon: AlertCircle },
  cancelled:  { label: 'Dibatalkan', color: 'text-slate-500 bg-slate-100 border-slate-200', Icon: CheckCheck },
};

const METODE_OPTIONS = [
  { value: 'transfer_bank', label: '🏦 Transfer Bank' },
  { value: 'ewallet_gopay', label: '💚 GoPay' },
  { value: 'ewallet_ovo',   label: '🟣 OVO' },
  { value: 'ewallet_dana',  label: '🔵 DANA' },
];

const fmt = (n: unknown) => `Rp ${Number(n ?? 0).toLocaleString('id-ID')}`;

export default function PencairanPage() {
  const [jumlah, setJumlah] = useState('');
  const [metode, setMetode] = useState('transfer_bank');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { data: statsData, loading: loadingStats } = useQuery(QUERY_STATS, { fetchPolicy: 'cache-and-network' });
  const { data: payoutsData, loading: loadingPayouts } = useQuery(QUERY_PAYOUTS, { fetchPolicy: 'cache-and-network' });

  const stats = statsData?.myAffiliateStats ?? null;
  const payouts = payoutsData?.myPayouts ?? [];
  const loading = loadingStats || loadingPayouts;

  const [requestPayoutMutation, { loading: submitting }] = useMutation(MUTATION_REQUEST, {
    refetchQueries: [{ query: QUERY_PAYOUTS }],
  });

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(jumlah.replace(/\D/g, ''));
    if (isNaN(amount) || amount < 50000) { setError('Minimum pencairan adalah Rp 50.000.'); return; }
    setError(null);

    try {
      await requestPayoutMutation({ variables: { jumlah: amount, metode } });
      setSuccess(true);
      setJumlah('');
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fc] px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/affiliate/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-extrabold text-slate-800">Pencairan Komisi</h1>
        </div>

        {/* Saldo cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
            <p className="text-xs font-semibold text-slate-500 mb-1">Saldo Tersedia</p>
            <p className="text-2xl font-extrabold text-[#5873c4]">{fmt(stats?.saldoTersedia)}</p>
            <p className="text-xs text-slate-400 mt-1">Siap dicairkan</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
            <p className="text-xs font-semibold text-slate-500 mb-1">Saldo Pending</p>
            <p className="text-2xl font-extrabold text-amber-500">{fmt(stats?.saldoPending)}</p>
            <p className="text-xs text-slate-400 mt-1">Menunggu konfirmasi</p>
          </div>
        </div>

        {/* Form request pencairan */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Ajukan Pencairan</h2>

          {success && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-xl p-3 text-sm font-semibold mb-4">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Permintaan pencairan berhasil diajukan! Admin akan memproses dalam 1–3 hari kerja.
            </div>
          )}

          <form onSubmit={handleRequest} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Jumlah Pencairan (IDR)</label>
              <input
                type="text"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                placeholder="Contoh: 200000"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:border-[#5873c4] focus:ring-4 focus:ring-[#5873c4]/10 focus:outline-none transition-all"
              />
              <p className="text-xs text-slate-400">Minimum: Rp 50.000 · Maksimum: saldo tersedia</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Metode Pencairan</label>
              <div className="grid grid-cols-2 gap-2">
                {METODE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMetode(opt.value)}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                      metode === opt.value
                        ? 'border-[#5873c4] bg-[#eef2ff] text-[#5873c4]'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-sm font-medium">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}
              </div>
            )}

            <button
              type="submit"
              id="btn-request-payout"
              disabled={submitting}
              className="w-full py-3.5 bg-[#5873c4] hover:bg-[#4660b0] text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-[#5873c4]/15 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengajukan…</> : 'Ajukan Pencairan'}
            </button>
          </form>
        </div>

        {/* Riwayat pencairan */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50">
            <h2 className="text-sm font-bold text-slate-700">Riwayat Pencairan</h2>
          </div>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-4 border-[#5873c4] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : payouts.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-400 text-sm">Belum ada riwayat pencairan.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {payouts.map((p: any) => {
                const sc = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.requested!;
                return (
                  <div key={p.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{fmt(p.jumlah)}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {METODE_OPTIONS.find((m) => m.value === p.metode)?.label ?? p.metode} ·{' '}
                        {new Date(p.requestedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${sc.color}`}>
                      <sc.Icon className="w-3 h-3" />
                      {sc.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
