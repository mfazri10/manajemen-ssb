'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, gql } from '@apollo/client';
import { useAuthStore } from '@/store/auth-store';
import { Loader2, AlertCircle, Sparkles, Building2, MapPin, Phone, Mail, Globe } from 'lucide-react';

const REGISTER_AKADEMI = gql`
  mutation RegisterAkademi(
    $nama: String!
    $slug: String!
    $alamat: String
    $noHp: String
    $email: String
    $website: String
  ) {
    registerAkademi(
      nama: $nama
      slug: $slug
      alamat: $alamat
      noHp: $noHp
      email: $email
      website: $website
    ) {
      id
      nama
      slug
    }
  }
`;

export default function RegisterAcademyPage() {
  const [nama, setNama] = useState('');
  const [slug, setSlug] = useState('');
  const [alamat, setAlamat] = useState('');
  const [noHp, setNoHp] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { setActiveAkademiId } = useAuthStore();
  const router = useRouter();

  const [registerAkademi, { loading }] = useMutation(REGISTER_AKADEMI);

  // Auto-generate slug from name
  useEffect(() => {
    const slugified = nama
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-_]/g, '') // remove special characters
      .replace(/\s+/g, '-'); // replace spaces with -
    setSlug(slugified);
  }, [nama]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!slug) {
      setErrorMsg('Slug akademi tidak boleh kosong.');
      return;
    }

    const slugRegex = /^[a-z0-9_-]+$/;
    if (!slugRegex.test(slug)) {
      setErrorMsg('Slug hanya boleh berisi huruf kecil, angka, dash (-), dan underscore (_).');
      return;
    }

    try {
      const { data } = await registerAkademi({
        variables: {
          nama,
          slug,
          alamat: alamat || null,
          noHp: noHp || null,
          email: email || null,
          website: website || null,
        },
      });

      if (data?.registerAkademi) {
        const { id, slug: resSlug } = data.registerAkademi;
        // Save to localStorage so headers can pick it up dynamically
        localStorage.setItem('activeAkademiId', id);
        localStorage.setItem('activeAkademiSlug', resSlug);
        setActiveAkademiId(id);

        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 2000);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal mendaftarkan akademi. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden px-4 py-8">
      {/* Glow effects background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-xl z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl relative">
          {/* Accent decoration line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-t-3xl"></div>

          {/* Logo / Header */}
          <div className="text-center mb-8 mt-2">
            <span className="text-4xl">🏆</span>
            <h1 className="text-2xl font-black tracking-tight text-white mt-3 flex items-center justify-center gap-1.5">
              Daftarkan Akademi Baru <Sparkles className="w-5 h-5 text-yellow-400" />
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-medium">
              Satu langkah lagi untuk mulai mengelola sekolah sepak bola (SSB) Anda secara digital dan profesional.
            </p>
          </div>

          {/* Success message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl text-green-200 text-sm text-center font-bold">
              Registrasi Berhasil! Sedang menginisialisasi skema database tenant...
            </div>
          )}

          {/* Alert Error */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-red-200 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Nama Akademi
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: SSB Garuda Jaya"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Slug URL Akademi
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 text-xs font-bold select-none">
                    /
                  </span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    placeholder="ssb-garuda-jaya"
                    className="w-full pl-8 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Alamat Kantor / Lapangan
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <MapPin className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Jl. Stadion No. 42, Jakarta"
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  No. Telepon / WA
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    placeholder="08123456789"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Email Resmi
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@ssb.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Situs Web
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <Globe className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="www.ssb.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-2 py-4 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-2xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sedang Memproses & Membuat Skema DB...</span>
                </>
              ) : (
                <span>Daftarkan Akademi Sekarang</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
