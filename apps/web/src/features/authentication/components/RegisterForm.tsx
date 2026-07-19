'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { signUp } from '@/lib/auth-client';
import { Loader2, AlertCircle } from 'lucide-react';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await signUp.email({
        email,
        password,
        name,
        callbackURL: '/auth/login',
      });

      if (response?.error) {
        setError(response.error.message || 'Pendaftaran gagal. Silakan coba lagi.');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan sistem. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6fc] dark:bg-slate-950 relative overflow-hidden px-4">
      {/* Decorative background shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-[440px] z-10">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-none relative">
          
          {/* Logo / Header */}
          <div className="flex flex-col items-center text-center mt-2">
            <Image
              src="/images/logo/silat.png"
              alt="Silat Logo"
              width={140}
              height={100}
              priority
              className="object-contain"
            />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] dark:text-white mt-5">
              Daftar Akun Baru
            </h1>
            <p className="text-sm text-slate-400 dark:text-slate-400 mt-2 font-medium">
              Buat akun Anda untuk mulai mengelola SSB.
            </p>
          </div>

          {/* Success message */}
          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-900/30 rounded-xl text-green-600 dark:text-green-400 text-xs font-semibold text-center animate-in fade-in slide-in-from-top-1 duration-200">
              Pendaftaran berhasil! Mengalihkan ke halaman login...
            </div>
          )}

          {/* Alert Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/30 rounded-xl flex items-start gap-2.5 text-red-600 dark:text-red-400 text-xs font-semibold animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleRegister} className="space-y-4 mt-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold text-[#475569] dark:text-slate-300">
                Nama Lengkap
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Lengkap"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-[#475569] dark:text-slate-300">
                Alamat Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-[#475569] dark:text-slate-300">
                Kata Sandi
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-6 py-3.5 px-4 bg-[#5873c4] hover:bg-[#4660b0] text-white font-bold rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-[#5873c4]/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-[#5873c4]/15"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Mendaftarkan...</span>
                </>
              ) : (
                <span>Daftar Sekarang</span>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-8 text-center text-xs text-slate-500">
            Sudah memiliki akun?{' '}
            <a
              href="/auth/login"
              className="font-bold text-[#5873c4] hover:text-[#4660b0] transition-colors"
            >
              Masuk di sini
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
