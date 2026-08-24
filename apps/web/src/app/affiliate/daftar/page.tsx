'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, gql } from '@apollo/client';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const REGISTER_AFFILIATE = gql`
  mutation RegisterAffiliate($namaBank: String, $nomorRekening: String, $atasNama: String) {
    registerAffiliate(namaBank: $namaBank, nomorRekening: $nomorRekening, atasNama: $atasNama) {
      id
      kodeReferral
      tier
      status
    }
  }
`;

export default function AffiliateDaftarPage() {
  const router = useRouter();
  const [namaBank, setNamaBank] = useState('');
  const [nomorRekening, setNomorRekening] = useState('');
  const [atasNama, setAtasNama] = useState('');
  const [setuju, setSetuju] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [registerAffiliate, { loading }] = useMutation(REGISTER_AFFILIATE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setuju) {
      setError('Anda harus menyetujui syarat & ketentuan program affiliate.');
      return;
    }
    setError(null);

    try {
      await registerAffiliate({
        variables: {
          namaBank: namaBank || undefined,
          nomorRekening: nomorRekening || undefined,
          atasNama: atasNama || undefined,
        },
      });

      setSuccess(true);
      setTimeout(() => router.push('/affiliate/dashboard'), 2500);
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fc] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        {/* Back link */}
        <Link href="/affiliate" className="text-sm text-[#5873c4] font-semibold hover:underline mb-6 inline-block">
          ← Kembali ke Info Program
        </Link>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sm:p-10">
          <h1 className="text-2xl font-extrabold text-slate-800 mb-1">Daftar Program Affiliate</h1>
          <p className="text-sm text-slate-500 mb-8">
            Isi data rekening bank untuk pencairan komisi. Anda bisa melengkapinya nanti di dashboard.
          </p>

          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">Pendaftaran Berhasil!</h2>
              <p className="text-slate-500 text-sm">Mengalihkan ke dashboard affiliate Anda…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Info bank (opsional) */}
              <div className="bg-[#f8f9ff] rounded-2xl p-5 space-y-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Info Rekening Bank (Opsional)</p>

                <div className="space-y-2">
                  <label htmlFor="namaBank" className="block text-sm font-semibold text-slate-600">Nama Bank</label>
                  <input
                    id="namaBank"
                    type="text"
                    value={namaBank}
                    onChange={(e) => setNamaBank(e.target.value)}
                    placeholder="Contoh: BCA, Mandiri, BNI"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:border-[#5873c4] focus:ring-4 focus:ring-[#5873c4]/10 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="nomorRekening" className="block text-sm font-semibold text-slate-600">Nomor Rekening</label>
                  <input
                    id="nomorRekening"
                    type="text"
                    value={nomorRekening}
                    onChange={(e) => setNomorRekening(e.target.value)}
                    placeholder="Nomor rekening Anda"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:border-[#5873c4] focus:ring-4 focus:ring-[#5873c4]/10 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="atasNama" className="block text-sm font-semibold text-slate-600">Atas Nama</label>
                  <input
                    id="atasNama"
                    type="text"
                    value={atasNama}
                    onChange={(e) => setAtasNama(e.target.value)}
                    placeholder="Nama sesuai rekening bank"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:border-[#5873c4] focus:ring-4 focus:ring-[#5873c4]/10 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Persetujuan S&K */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  id="syarat"
                  type="checkbox"
                  checked={setuju}
                  onChange={(e) => setSetuju(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-[#5873c4] cursor-pointer"
                />
                <span className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-800 transition-colors">
                  Saya menyetujui{' '}
                  <a href="#" className="text-[#5873c4] font-semibold hover:underline">
                    Syarat &amp; Ketentuan Program Affiliate
                  </a>{' '}
                  dan memahami struktur komisi yang berlaku.
                </span>
              </label>

              {error && (
                <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-sm font-medium">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                id="affiliate-daftar-submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#5873c4] hover:bg-[#4660b0] text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-[#5873c4]/20 flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Mendaftarkan…</span></> : 'Daftar Sekarang'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
