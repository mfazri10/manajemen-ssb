'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth-client';
import { Lock, Mail, User, Loader2, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden px-4">
      {/* Glow effects background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
          
          {/* Accent decoration line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-t-3xl"></div>

          {/* Logo / Header */}
          <div className="text-center mb-8 mt-2">
            <span className="text-4xl">⚽</span>
            <h1 className="text-2xl font-extrabold tracking-tight text-white mt-3">
              Daftar Akun Baru
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Buat akun Anda untuk mulai mengelola SSB.
            </p>
          </div>

          {/* Success message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl text-green-200 text-sm text-center">
              Pendaftaran berhasil! Mengalihkan ke halaman login...
            </div>
          )}

          {/* Alert Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-red-200 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Nama Lengkap
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Alamat Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Kata Sandi
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
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
            <a href="/auth/login" className="font-bold text-blue-400 hover:text-blue-300 transition-colors">
              Masuk di sini
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
