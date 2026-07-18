'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, gql } from '@apollo/client';
import { Sparkles, Building2, CalendarRange, Dumbbell, ArrowRight, Loader2, Trophy } from 'lucide-react';

const SUBMIT_SURVEY = gql`
  mutation SubmitOnboardingSurvey($productType: String!, $rawAnswersJson: String) {
    submitOnboardingSurvey(productType: $productType, rawAnswersJson: $rawAnswersJson) {
      id
      productType
    }
  }
`;

export default function OnboardingSurveyPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitSurvey, { loading }] = useMutation(SUBMIT_SURVEY);
  const router = useRouter();

  const options = [
    {
      id: 'akademi',
      title: 'Akademi / Sekolah Olahraga',
      desc: 'Latihan rutin kelompok umur, kurikulum olahraga, absensi berkala, dan iuran SPP bulanan tetap.',
      examples: 'Contoh: SSB (Sekolah Sepak Bola), Klub Badminton PB, Dojo Taekwondo/Karate, Sekolah Renang.',
      icon: <Building2 className="w-8 h-8 text-blue-400" />,
      color: 'from-blue-600/20 to-cyan-600/20 border-blue-500/30 hover:border-blue-500/80',
      badge: 'Model SPP Bulanan',
    },
    {
      id: 'gor',
      title: 'GOR / Tempat Sewa Lapangan',
      desc: 'Penyewaan lapangan atau arena olahraga per sesi atau per jam secara dinamis untuk umum.',
      examples: 'Contoh: Lapangan Futsal Center, GOR Bulu Tangkis, Court Tenis, Padel Club, Bilik Billiard.',
      icon: <CalendarRange className="w-8 h-8 text-emerald-400" />,
      color: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/30 hover:border-emerald-500/80',
      badge: 'Model Booking Lapangan',
    },
    {
      id: 'gym',
      title: 'Gym, Fitness & Studio Kebugaran',
      desc: 'Keanggotaan (membership) bulanan, kunjungan harian, kelas grup terjadwal, dan Personal Trainer.',
      examples: 'Contoh: Fitness Center, CrossFit Box, Studio Yoga, Reformer Pilates, Muay Thai Dojo.',
      icon: <Dumbbell className="w-8 h-8 text-purple-400" />,
      color: 'from-purple-600/20 to-pink-600/20 border-purple-500/30 hover:border-purple-500/80',
      badge: 'Model Membership & Kelas',
    },
    {
      id: 'outbound',
      title: 'Event, Komunitas & Wisata Olahraga',
      desc: 'Penyelenggaraan event olahraga musiman, pendaftaran peserta one-time, outbound, rute & tracking komunitas.',
      examples: 'Contoh: Event Lari (Running 5K/10K), Cycling Club, outbound, Turnamen Organizer, Komunitas Pendaki.',
      icon: <Trophy className="w-8 h-8 text-amber-400" />,
      color: 'from-amber-600/20 to-orange-600/20 border-amber-500/30 hover:border-amber-500/80',
      badge: 'Model Event & Tiket',
    },
  ];

  const handleNext = async () => {
    if (!selected) return;

    try {
      await submitSurvey({
        variables: {
          productType: selected,
          rawAnswersJson: JSON.stringify({ chosenAt: new Date().toISOString() }),
        },
      });
      // Redirect ke registrasi akademi/venue dengan parameter type
      router.push(`/register/academy?type=${selected}`);
    } catch {
      // Fallback jika API bermasalah, langsung lewat query param
      router.push(`/register/academy?type=${selected}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden px-4 py-8">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-6xl z-10">
        <div className="text-center mb-10">
          <span className="text-5xl">⚡</span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mt-4 flex items-center justify-center gap-2">
            Pilih Jenis Bisnis Olahraga Anda <Sparkles className="w-6 h-6 text-yellow-400" />
          </h1>
          <p className="text-slate-400 mt-2 max-w-lg mx-auto text-sm font-medium">
            Kami akan menyesuaikan skema database, menu admin, dan workflow aplikasi agar 100% pas dengan operasional harian Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {options.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={`cursor-pointer rounded-3xl p-6 border bg-slate-900/60 backdrop-blur-xl transition-all duration-300 relative flex flex-col justify-between hover:scale-[1.02] ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-2xl scale-[1.01] bg-slate-900/90'
                    : opt.color
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                      {opt.icon}
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-slate-950/80 text-slate-300 rounded-full border border-slate-800">
                      {opt.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white leading-tight mb-2">
                    {opt.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed mb-4">
                    {opt.desc}
                  </p>
                </div>

                <p className="text-[10px] text-slate-500 italic leading-relaxed border-t border-slate-800/60 pt-4 mt-auto">
                  {opt.examples}
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center mt-12">
          <button
            onClick={handleNext}
            disabled={!selected || loading}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold rounded-2xl text-sm transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:scale-100 cursor-pointer shadow-xl shadow-indigo-600/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Menyiapkan Kebutuhan Anda...</span>
              </>
            ) : (
              <>
                <span>Lanjutkan ke Pendaftaran</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
