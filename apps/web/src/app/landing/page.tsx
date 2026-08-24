'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  CalendarDays,
  Wallet,
  Trophy,
  LineChart,
  ShieldCheck,
  Building2,
  MapPin,
  Package,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Zap,
  Star,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Activity,
  Compass,
} from 'lucide-react';

const sports = [
  {
    emoji: '⚽',
    name: 'Sepak Bola & Futsal',
    desc: 'Kelola SSB & Klub Futsal: data siswa, penempatan kelompok umur, jadwal latihan berkala, absensi terintegrasi, turnamen liga, hingga penyusunan lineup match.',
    tag: 'Populer',
    color: 'from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/20 text-emerald-400',
  },
  {
    emoji: '🏸',
    name: 'Bulu Tangkis & Tennis',
    desc: 'Sistem booking lapangan per sesi, manajemen keanggotaan (membership), kelas pelatihan terjadwal, pencatatan tanding, dan tracking iuran rutin bulanan.',
    tag: 'Olahraga Raket',
    color: 'from-sky-500/20 via-indigo-500/10 to-transparent border-sky-500/20 text-sky-400',
  },
  {
    emoji: '🏋️‍♂️',
    name: 'Gym, Yoga & Studio Kebugaran',
    desc: 'Keanggotaan harian/bulanan, absensi QR Code, manajemen paket kelas grup, registrasi instruktur/Personal Trainer, serta visualisasi grafik rekapitulasi kas masuk.',
    tag: 'Kebugaran',
    color: 'from-purple-500/20 via-pink-500/10 to-transparent border-purple-500/20 text-purple-400',
  },
  {
    emoji: '🧗‍♂️',
    name: 'Outbound & Komunitas Petualang',
    desc: 'Penyelenggaraan event musiman (running, cycling, hiking), pendaftaran tiket one-time publik, pemetaan rute jalur GPX, dan rundwon rundown kegiatan fisik.',
    tag: 'Model Baru D',
    color: 'from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/20 text-amber-400',
  },
];

const features = [
  { icon: Users, title: 'Manajemen Anggota', desc: 'Registrasi atlet, profiling siswa, penugasan pelatih, & akun orang tua terisolasi multi-tenant secara aman.' },
  { icon: CalendarDays, title: 'Jadwal & Absensi Digital', desc: 'Penyusunan agenda latihan per kelompok umur dan input absensi kehadiran digital di lapangan secara instan.' },
  { icon: Wallet, title: 'SPP & Buku Kas Otomatis', desc: 'Generator tagihan SPP bulanan otomatis (cron scheduler), pencatatan saldo tabungan siswa, dan riwayat mutasi kas.' },
  { icon: Trophy, title: 'Turnamen & Match Event', desc: 'Pengaturan turnamen internal/eksternal, setup lineup taktis pemain, rekap skor tanding, dan visualisasi klasemen otomatis.' },
  { icon: LineChart, title: 'Tes Fisik & Rapor Semester', desc: 'Rekam skor tes fisik (kecepatan, daya tahan), penilaian aspek mental/teknik, serta cetak dokumen rapor format PDF.' },
  { icon: ShieldCheck, title: 'Multi-Tenant Database Scoping', desc: 'Setiap tenant memiliki database schema terisolasi secara logis (`tenant_slug`) guna privasi dan integritas data tingkat tinggi.' },
];

const stats = [
  { value: '4 Model', label: 'Bisnis Olahraga' },
  { value: '100%', label: 'Cloud & Multi-Tenant' },
  { value: 'Cron-Job', label: 'Tagihan Otomatis' },
  { value: '100% Lulus', label: 'Typecheck TypeScript' },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden font-sans">
      <style>{`
        .bg-grid-pattern {
          background-size: 60px 60px;
          background-image:
            linear-gradient(to right, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
        }
        .spotlight {
          background: radial-gradient(circle at 50% -20%, rgba(99, 102, 241, 0.18) 0%, transparent 60%);
        }
        .spotlight-bottom {
          background: radial-gradient(circle at 50% 120%, rgba(236, 72, 153, 0.1) 0%, transparent 50%);
        }
        .glow-hover:hover {
          box-shadow: 0 0 30px 2px rgba(99, 102, 241, 0.15);
        }
      `}</style>

      {/* Grid Pattern & Spotlight */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none" />
      <div className="absolute inset-0 spotlight pointer-events-none" />
      <div className="absolute inset-0 spotlight-bottom pointer-events-none" />

      {/* NAVBAR */}
      <header className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        scrolled 
          ? 'bg-slate-950/80 backdrop-blur-md border-slate-800/80 py-3 shadow-lg shadow-black/40' 
          : 'bg-transparent border-transparent py-5'
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 text-white font-black shadow-lg shadow-indigo-500/25">
              G
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-black tracking-tight text-white">GARUDA SPORT</span>
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">Platform SaaS Olahraga</span>
            </div>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#cabang" className="text-xs font-bold text-slate-400 transition-colors hover:text-white uppercase tracking-wider">Kategori</a>
            <a href="#fitur" className="text-xs font-bold text-slate-400 transition-colors hover:text-white uppercase tracking-wider">Fitur Premium</a>
            <a href="#ekspansi" className="text-xs font-bold text-slate-400 transition-colors hover:text-white uppercase tracking-wider">Integrasi</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors">
              Masuk
            </Link>
            <Link href="/onboarding/survey" className="group flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4.5 py-2 text-xs font-black text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95">
              <span>Mulai Onboarding</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 px-6">
        <div className="mx-auto max-w-7xl text-center relative z-10">
          
          {/* Aceternity Badge */}
          <div className="mx-auto mb-6 inline-flex items-center gap-2.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-2xs font-extrabold uppercase tracking-widest text-indigo-400">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
            <span>SaaS Multi-Tenant Olahraga Terlengkap</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-balance text-4xl font-black leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
            Kelola Akademi & Event Olahraga Anda,{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">Semudah Menendang Bola.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-sm md:text-base text-slate-400 font-medium leading-relaxed">
            Satu-satunya platform SaaS di Indonesia yang mengisolasi database Anda secara independen (Schema-per-Tenant) untuk keandalan 100%. Kelola sekolah olahraga (SSB/Badminton), penyewaan GOR/Venue, kelas fitness, hingga event pariwisata outbound.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/onboarding/survey" className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-8 py-4 text-sm font-black text-white shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] sm:w-auto active:scale-98 cursor-pointer">
              <span>Mulai Onboarding Sekarang</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#fitur" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 px-8 py-4 text-sm font-black text-slate-300 transition-all sm:w-auto cursor-pointer">
              <span>Pelajari Fitur</span>
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>

          {/* STATS SECTION (Aceternity Style Cards) */}
          <div className="mx-auto mt-20 grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-900 bg-slate-900/30 backdrop-blur-xs p-5 shadow-2xs hover:border-slate-800 transition-colors">
                <div className="text-3xl font-black text-transparent bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text md:text-4xl">{s.value}</div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* CABANG OLAHRAGA (SPORTS CATEGORY SECTION) */}
      <section id="cabang" className="mx-auto max-w-7xl px-6 py-20 relative z-10">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Pilihan Jenis Bisnis</span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">Sesuaikan Kategori Olahraga Anda</h2>
          <p className="mt-4 text-xs md:text-sm text-slate-400 leading-relaxed">
            Pilih model bisnis Anda melalui onboarding survey, dan platform kami akan memprovisioning struktur database secara otomatis.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {sports.map((sp) => (
            <div key={sp.name} className={`group relative overflow-hidden rounded-3xl border bg-slate-900/40 p-8 transition-all hover:scale-[1.01] bg-gradient-to-br ${sp.color} hover:shadow-xl`}>
              <div className="flex justify-between items-start">
                <div className="text-5xl">{sp.emoji}</div>
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-slate-950/80 rounded-full border border-slate-800">
                  {sp.tag}
                </span>
              </div>
              <h3 className="mt-6 text-xl font-black text-white">{sp.name}</h3>
              <p className="mt-2 text-xs md:text-sm leading-relaxed text-slate-400">{sp.desc}</p>
              <div className="mt-6 flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
                <span>Coba model ini</span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FITUR PREMIUM SECTION */}
      <section id="fitur" className="border-t border-slate-900 bg-slate-900/10 py-24 relative z-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Modul Terintegrasi</span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">Fitur All-in-One Kelas Premium</h2>
            <p className="mt-4 text-xs md:text-sm text-slate-400 leading-relaxed">
              Mulai dari absensi lapangan harian hingga evaluasi rapor digital atlet yang terhitung secara otomatis.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-slate-900 hover:border-slate-800 bg-slate-950/60 p-7 hover:shadow-lg transition-all glow-hover">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-base font-black text-white">{f.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTEGRASI PAYMENT & SCHEDULER SECTION */}
      <section id="ekspansi" className="mx-auto max-w-7xl px-6 py-24 relative z-10">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 via-slate-900/40 to-pink-950/20 p-8 md:p-14">
          <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/40 bg-pink-500/10 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-pink-400">
              <Zap className="h-3.5 w-3.5 text-pink-400 animate-bounce" />
              <span>Otomatisasi & Integrasi</span>
            </div>
            
            <h2 className="mt-5 max-w-2xl text-2xl md:text-4xl font-black tracking-tight text-white leading-tight">
              Sistem Penagihan SPP & Payment Gateway Terintegrasi
            </h2>
            
            <p className="mt-4 max-w-2xl text-xs md:text-sm text-slate-400 leading-relaxed">
              Platform kami didukung oleh Cron Scheduler otomatis yang menerbitkan invoice SPP bulanan tepat waktu bagi seluruh siswa aktif, dan mengintegrasikannya dengan Xendit Payment Gateway untuk pembayaran instan via QRIS, Virtual Account, & retail outlet.
            </p>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Wallet className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-black text-white text-sm">Xendit API Integrasi</h3>
                <p className="mt-1.5 text-2xs leading-relaxed text-slate-400">Menerbitkan digital invoice interaktif yang terhubung langsung ke multi-bank Virtual Account & QRIS e-wallet.</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-black text-white text-sm">Automated Scheduler</h3>
                <p className="mt-1.5 text-2xs leading-relaxed text-slate-400">Menerbitkan tagihan SPP bulanan secara otomatis pada setiap tanggal 1 awal bulan bagi siswa terdaftar.</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-black text-white text-sm">Webhook Callback</h3>
                <p className="mt-1.5 text-2xs leading-relaxed text-slate-400">Pemberitahuan lunas instan dari Xendit langsung memperbarui record kas masuk di database tenant secara asinkron.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="border-t border-slate-900 bg-slate-950 py-24 relative z-10">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Star className="mx-auto h-8 w-8 text-indigo-400 animate-spin-slow" />
          <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-black tracking-tight text-white md:text-5xl">
            Tingkatkan Level Pengelolaan Klub Anda Sekarang
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-xs md:text-sm text-slate-400 leading-relaxed">
            Onboarding 5 menit tanpa perlu ribet. Coba trial gratis 7 hari, dan rasakan kemudahan pengelolaan berbasis digital.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/onboarding/survey" className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-8 py-4 text-sm font-black text-white shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] sm:w-auto active:scale-98 cursor-pointer">
              <span>Mulai Onboarding</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/auth/login" className="flex w-full items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 px-8 py-4 text-sm font-black text-slate-300 hover:bg-slate-900 transition-all sm:w-auto cursor-pointer">
              <span>Masuk ke Akun</span>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-2xs uppercase tracking-wider font-extrabold text-slate-500">
            {['Tanpa kartu kredit', 'Setup 5 menit', 'Multi-Tenant Terisolasi'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                <span>{t}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10 relative z-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-pink-500 text-white font-black">G</div>
            <span className="text-sm font-black text-white">GARUDA SPORT</span>
          </div>
          <p className="text-2xs text-slate-500">© 2026 Garuda Sport SaaS Platform. Dibuat dengan bangga untuk olahraga Indonesia. 🇮🇩</p>
        </div>
      </footer>
    </div>
  );
}
