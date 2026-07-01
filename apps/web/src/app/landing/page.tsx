'use client';

import React from 'react';
import Link from 'next/link';
/**
 * Landing Page Publik — Manajemen SSB / Sport Management Platform.
 * Halaman marketing multi-cabang olahraga (sepak bola, futsal, bulutangkis)
 * dengan teaser ekspansi manajemen GOR / lapangan / inventaris.
 * Route: /landing (tanpa sidebar admin).
 */

const sports = [
  {
    emoji: '⚽',
    name: 'Sepak Bola',
    desc: 'Kelola akademi SSB: siswa, kelompok umur, jadwal latihan, evaluasi, hingga turnamen & klasemen.',
    tone: 'from-emerald-500/15 to-emerald-500/5',
  },
  {
    emoji: '🥅',
    name: 'Futsal',
    desc: 'Manajemen tim futsal, jadwal pertandingan, statistik pemain, dan pembagian lapangan indoor.',
    tone: 'from-amber-500/15 to-amber-500/5',
  },
  {
    emoji: '🏸',
    name: 'Bulutangkis',
    desc: 'Booking lapangan, kelas coaching, turnamen ranking, dan manajemen membership pemain.',
    tone: 'from-sky-500/15 to-sky-500/5',
  },
];

const features = [
  { icon: Users, title: 'Manajemen Anggota', desc: 'Data siswa, pelatih, & orang tua lengkap dengan RBAC berlapis.' },
  { icon: CalendarDays, title: 'Jadwal & Absensi', desc: 'Atur jadwal latihan/pertandingan dan pantau kehadiran real-time.' },
  { icon: Wallet, title: 'Keuangan & SPP', desc: 'Tagihan SPP otomatis, buku kas, tabungan siswa, & payment gateway.' },
  { icon: Trophy, title: 'Turnamen & Match', desc: 'Kelola turnamen, lineup, event pertandingan, dan klasemen otomatis.' },
  { icon: LineChart, title: 'Evaluasi & Tes Fisik', desc: 'Rekam perkembangan atlet dengan evaluasi terukur dan tes fisik.' },
  { icon: ShieldCheck, title: 'Multi-Tenant Aman', desc: 'Isolasi data per akademi (schema-per-tenant) yang aman & scalable.' },
];

const stats = [
  { value: '30+', label: 'Modul Terintegrasi' },
  { value: '3', label: 'Cabang Olahraga' },
  { value: '100%', label: 'Cloud & Multi-Tenant' },
  { value: '24/7', label: 'Akses Kapan Saja' },
];

const expansion = [
  { icon: Building2, title: 'Manajemen GOR', desc: 'Kelola gedung olahraga: profil venue, fasilitas, operasional, dan staf.' },
  { icon: MapPin, title: 'Booking Lapangan', desc: 'Reservasi lapangan online, kalender ketersediaan, tarif dinamis & pembayaran.' },
  { icon: Package, title: 'Inventaris Aset', desc: 'Kelola aset & perlengkapan olahraga, peminjaman, perawatan, dan penyusutan.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20">
              G
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-black tracking-tight">GARUDA SPORT</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Management Platform</span>
            </div>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#cabang" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">Cabang</a>
            <a href="#fitur" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">Fitur</a>
            <a href="#ekspansi" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">Roadmap</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-semibold text-foreground transition-colors hover:text-primary">Masuk</Link>
            <Link href="/register" className="group flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40">
              Mulai Gratis <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute top-20 right-1/4 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-6 py-24 text-center md:py-32">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-bold text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Platform Manajemen Olahraga #1 untuk Indonesia
          </div>
          <h1 className="mx-auto max-w-4xl text-balance text-4xl font-black leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            Kelola Akademi Olahraga Anda,{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Semudah Menendang Bola.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            Satu platform untuk mengelola SSB, tim futsal, dan klub bulutangkis — dari data atlet,
            jadwal, keuangan, hingga turnamen. Otomatis, aman, dan terukur.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register" className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-bold text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:scale-[1.02] hover:shadow-primary/40 sm:w-auto">
              Coba Gratis Sekarang <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#fitur" className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-7 py-3.5 text-base font-bold text-foreground transition-all hover:border-primary/40 sm:w-auto">
              Lihat Fitur <ChevronRight className="h-4 w-4" />
            </a>
          </div>

          {/* STATS */}
          <div className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-6">
                <div className="text-3xl font-black text-primary md:text-4xl">{s.value}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CABANG OLAHRAGA */}
      <section id="cabang" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-black uppercase tracking-widest text-primary">Multi-Cabang</span>
          <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Satu Sistem, Semua Cabang Olahraga</h2>
          <p className="mt-4 text-muted-foreground">Dirancang fleksibel untuk berbagai disiplin olahraga populer di Indonesia.</p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {sports.map((sp) => (
            <div key={sp.name} className={`group relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b ${sp.tone} p-8 transition-all hover:-translate-y-1 hover:shadow-xl`}>
              <div className="text-5xl">{sp.emoji}</div>
              <h3 className="mt-5 text-xl font-black">{sp.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{sp.desc}</p>
              <div className="mt-5 flex items-center gap-1 text-sm font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Pelajari <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FITUR */}
      <section id="fitur" className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-black uppercase tracking-widest text-primary">Fitur Lengkap</span>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Semua yang Anda Butuhkan</h2>
            <p className="mt-4 text-muted-foreground">Dari operasional harian hingga strategi jangka panjang — semua dalam satu dashboard.</p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-card p-7 transition-all hover:border-primary/40 hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-black">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EKSPANSI GOR */}
      <section id="ekspansi" className="mx-auto max-w-7xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/10 via-card to-primary/10 p-10 md:p-14">
          <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-accent-foreground">
              <Zap className="h-3.5 w-3.5" /> Segera Hadir
            </div>
            <h2 className="mt-5 max-w-2xl text-3xl font-black tracking-tight md:text-4xl">
              Ekspansi ke Manajemen Gedung Olahraga (GOR)
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Kami sedang membangun modul untuk bisnis venue olahraga — kelola GOR,
              booking lapangan, dan inventaris aset dalam satu platform terpadu.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {expansion.map((e) => (
                <div key={e.title} className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground">
                    <e.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-black">{e.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{e.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <Star className="mx-auto h-8 w-8 text-accent" />
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-black tracking-tight md:text-5xl">
            Siap Membawa Klub Anda ke Level Berikutnya?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Bergabunglah dengan akademi & klub olahraga yang sudah beralih ke digital.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register" className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:scale-[1.02] sm:w-auto">
              Daftar Gratis <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/auth/login" className="flex w-full items-center justify-center rounded-xl border border-border bg-card px-8 py-4 text-base font-bold transition-all hover:border-primary/40 sm:w-auto">
              Masuk ke Akun
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {['Tanpa kartu kredit', 'Setup 5 menit', 'Dukungan lokal'].map((t) => (
              <span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" />{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black">G</div>
            <span className="text-sm font-black">GARUDA SPORT</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Garuda Sport Management. Dibuat untuk olahraga Indonesia. 🇮🇩</p>
        </div>
      </footer>
    </div>
  );
}
