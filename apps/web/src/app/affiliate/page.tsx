import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Program Affiliate — Hasilkan Komisi dengan Merekomendasikan Platform SSB',
  description: 'Bergabunglah dengan program affiliate kami dan dapatkan komisi recurring setiap kali Anda merekomendasikan platform manajemen SSB ke rekan Anda.',
};

const TIER_DATA = [
  { tier: '🥉 Starter', min: '1–4', recurring: '20%', benefit: 'Dashboard + link tracking' },
  { tier: '🥈 Growth',  min: '5–14',  recurring: '25%', benefit: '+ Branded landing page' },
  { tier: '🥇 Pro',     min: '15–29', recurring: '30%', benefit: '+ Priority support' },
  { tier: '💎 Elite',   min: '30+',   recurring: '35%', benefit: '+ Revenue share premium' },
];

const STEPS = [
  { no: '01', title: 'Daftar Gratis', desc: 'Buat akun affiliate dalam hitungan menit, dapatkan link unik Anda.' },
  { no: '02', title: 'Bagikan Link', desc: 'Rekomendasikan ke rekan pelatih, akademi, atau komunitas olahraga Anda.' },
  { no: '03', title: 'Terima Komisi', desc: 'Komisi masuk otomatis setiap tenant referral Anda berlangganan.' },
];

export default function AffiliateLandingPage() {
  return (
    <div className="min-h-screen bg-[#f4f6fc] font-sans">
      {/* === HERO === */}
      <section className="bg-gradient-to-br from-[#3b5bdb] via-[#4c6ef5] to-[#7048e8] text-white px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-white/20 backdrop-blur text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            Program Affiliate
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
            Rekomendasikan &amp; Hasilkan Komisi Recurring
          </h1>
          <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-xl mx-auto">
            Perkenalkan platform manajemen SSB terbaik ke kolega Anda — dan dapatkan komisi selama mereka berlangganan aktif.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/affiliate/daftar"
              className="px-8 py-4 bg-white text-[#3b5bdb] font-bold rounded-2xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.99]"
            >
              Daftar Jadi Affiliate →
            </Link>
            <a
              href="#cara-kerja"
              className="px-8 py-4 bg-white/10 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all border border-white/30"
            >
              Pelajari Lebih Lanjut
            </a>
          </div>
        </div>
      </section>

      {/* === KOMISI HIGHLIGHT === */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: 'Komisi Flat', value: 'Rp 50.000', desc: 'Per tenant baru yang berhasil bayar' },
            { label: 'Komisi Recurring', value: 'Hingga 35%', desc: 'Dari setiap pembayaran langganan bulanan' },
            { label: 'Minimum Pencairan', value: 'Rp 50.000', desc: 'Transfer ke rekening bank Anda' },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center">
              <p className="text-sm font-semibold text-slate-500 mb-2">{item.label}</p>
              <p className="text-3xl font-extrabold text-[#3b5bdb] mb-1">{item.value}</p>
              <p className="text-sm text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* === CARA KERJA === */}
      <section id="cara-kerja" className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="text-3xl font-extrabold text-slate-800">Cara Kerja</h2>
          <p className="text-slate-500 mt-3">Tiga langkah mudah untuk mulai menghasilkan komisi</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          {STEPS.map((s) => (
            <div key={s.no} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#eef2ff] text-[#3b5bdb] text-2xl font-extrabold flex items-center justify-center mx-auto mb-4">
                {s.no}
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{s.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* === TIER TABLE === */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-800">Tier &amp; Keuntungan</h2>
          <p className="text-slate-500 mt-3">Semakin banyak referral aktif, semakin besar komisi Anda</p>
        </div>
        <div className="overflow-x-auto rounded-3xl border border-slate-100 shadow-sm">
          <table className="w-full bg-white">
            <thead>
              <tr className="bg-[#f8f9ff] text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Tier</th>
                <th className="px-6 py-4">Referral Aktif</th>
                <th className="px-6 py-4">Komisi Recurring</th>
                <th className="px-6 py-4">Benefit Tambahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {TIER_DATA.map((t) => (
                <tr key={t.tier} className="hover:bg-[#f8f9ff] transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{t.tier}</td>
                  <td className="px-6 py-4 text-slate-600">{t.min} referral</td>
                  <td className="px-6 py-4 font-bold text-[#3b5bdb]">{t.recurring}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{t.benefit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* === CTA BOTTOM === */}
      <section className="bg-gradient-to-br from-[#3b5bdb] to-[#7048e8] text-white text-center px-6 py-20">
        <h2 className="text-3xl font-extrabold mb-4">Siap Mulai Menghasilkan?</h2>
        <p className="text-white/80 mb-8 max-w-md mx-auto">
          Daftar sekarang gratis. Dapatkan link unik Anda dan mulai rekomendasikan ke komunitas olahraga Anda.
        </p>
        <Link
          href="/affiliate/daftar"
          id="affiliate-cta-daftar"
          className="inline-block px-10 py-4 bg-white text-[#3b5bdb] font-extrabold rounded-2xl hover:bg-gray-50 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.99]"
        >
          Daftar Jadi Affiliate Sekarang →
        </Link>
      </section>
    </div>
  );
}
