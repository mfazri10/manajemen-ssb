'use client';

import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { CheckCircle2, Circle, Rocket, ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const MY_ONBOARDING_PROGRESS = gql`
  query MyOnboardingProgress {
    myOnboardingProgress {
      step
      completed
    }
  }
`;

export default function OnboardingChecklist() {
  const { data, loading, error } = useQuery(MY_ONBOARDING_PROGRESS, {
    pollInterval: 10000, // refresh setiap 10 detik untuk auto-complete
  });

  const [isOpen, setIsOpen] = useState(true);

  if (loading || error || !data?.myOnboardingProgress) return null;

  const progressSteps = data.myOnboardingProgress;
  const totalSteps = progressSteps.length;
  const completedSteps = progressSteps.filter((s: any) => s.completed).length;
  const percent = Math.round((completedSteps / totalSteps) * 100);

  // Jika semua langkah onboarding selesai, sembunyikan checklist otomatis
  if (completedSteps === totalSteps) return null;

  const stepLabels: Record<string, { title: string; link: string; desc: string }> = {
    register: {
      title: 'Daftar Akun Baru',
      link: '#',
      desc: 'Registrasi email & kata sandi Anda.',
    },
    survey: {
      title: 'Isi Survey Onboarding',
      link: '/onboarding/survey',
      desc: 'Tentukan jenis produk yang ingin dikelola.',
    },
    academy: {
      title: 'Daftarkan Bisnis Anda',
      link: '/register/academy',
      desc: 'Masukkan nama, slug, & info tempat olahraga.',
    },
    siswa: {
      title: 'Tambah Anggota / Pelanggan',
      link: '/admin/siswa',
      desc: 'Masukkan data siswa, member, atau pelanggan pertama.',
    },
    jadwal: {
      title: 'Setup Jadwal / Lapangan',
      link: '/admin/jadwal',
      desc: 'Tambahkan jadwal latihan, kelas studio, atau lapangan.',
    },
    spp: {
      title: 'Buat Transaksi / Tagihan',
      link: '/admin/spp',
      desc: 'Kirim tagihan SPP, buat booking sewa, atau membership.',
    },
  };

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl z-40 overflow-hidden transition-all duration-300">
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-4 bg-slate-950/60 border-b border-slate-800/80 flex justify-between items-center cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-indigo-400 animate-bounce" />
          <span className="text-xs font-black text-white tracking-wide">
            Setup Bisnis Olahraga Anda
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold px-2 py-0.5 bg-indigo-600/20 text-indigo-400 rounded-full border border-indigo-500/20">
            {completedSteps}/{totalSteps}
          </span>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-800 w-full relative">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        ></div>
      </div>

      {isOpen && (
        <div className="p-5 max-h-72 overflow-y-auto space-y-4 font-sans scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {progressSteps.map((s: any) => {
            const detail = stepLabels[s.step] || { title: s.step, link: '#', desc: '' };
            return (
              <div key={s.step} className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  {s.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-1">
                    <span
                      className={`text-xs font-bold ${
                        s.completed ? 'text-slate-400 line-through' : 'text-white'
                      }`}
                    >
                      {detail.title}
                    </span>
                    {!s.completed && detail.link !== '#' && (
                      <Link
                        href={detail.link}
                        className="text-[10px] font-extrabold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider shrink-0"
                      >
                        Mulai
                      </Link>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">
                    {detail.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
