'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, gql } from '@apollo/client';
import { Copy, CheckCheck, TrendingUp, Users, DollarSign, MousePointerClick, ExternalLink } from 'lucide-react';
import { PageLoader } from '@/components/page-states';

const QUERY_AFFILIATE = gql`query { myAffiliate { id kodeReferral tier status saldoTersedia saldoPending totalKomisi totalKlik totalReferral } }`;
const QUERY_STATS = gql`query { myAffiliateStats { totalKlik totalReferral totalKomisi saldoTersedia saldoPending referralAktif tierSaatIni tierProgress { current next currentCount nextTarget } } }`;
const QUERY_LINKS = gql`query { myAffiliateLinks { id nama slug totalKlik totalKonversi aktif createdAt } }`;

export default function AffiliateDashboardPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const { data: affiliateData, loading: loadingAffiliate } = useQuery(QUERY_AFFILIATE, { fetchPolicy: 'cache-and-network' });
  const { data: statsData } = useQuery(QUERY_STATS, { fetchPolicy: 'cache-and-network' });
  const { data: linksData, loading: loadingLinks } = useQuery(QUERY_LINKS, { fetchPolicy: 'cache-and-network' });

  const loading = loadingAffiliate || loadingLinks;
  const affiliate = affiliateData?.myAffiliate;
  const stats = statsData?.myAffiliateStats;
  const links = linksData?.myAffiliateLinks ?? [];

  const copyLink = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const buildLink = (slug: string) =>
    `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${slug}`;

  if (loading) return <PageLoader />;

  if (!affiliate) {
    return (
      <div className="min-h-screen bg-[#f4f6fc] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-10 text-center max-w-md shadow-sm border border-slate-100">
          <p className="text-xl font-bold text-slate-800 mb-2">Anda Belum Terdaftar</p>
          <p className="text-slate-500 text-sm mb-6">Daftar sebagai affiliate untuk mulai mendapatkan komisi.</p>
          <Link
            href="/affiliate/daftar"
            className="inline-block px-8 py-3 bg-[#5873c4] text-white font-bold rounded-xl hover:bg-[#4660b0] transition-all"
          >
            Daftar Sekarang
          </Link>
        </div>
      </div>
    );
  }

  const isActive = affiliate.status === 'active';
  const tierProgress = stats?.tierProgress;
  const progressPct = tierProgress?.nextTarget
    ? Math.min(100, Math.round((tierProgress.currentCount / tierProgress.nextTarget) * 100))
    : 100;

  const statCards = [
    { icon: MousePointerClick, label: 'Total Klik', value: (stats?.totalKlik ?? 0).toLocaleString('id-ID'), color: 'text-sky-600', bg: 'bg-sky-50' },
    { icon: Users, label: 'Referral Aktif', value: stats?.referralAktif ?? 0, color: 'text-violet-600', bg: 'bg-violet-50' },
    { icon: TrendingUp, label: 'Total Komisi', value: `Rp ${Number(stats?.totalKomisi ?? 0).toLocaleString('id-ID')}`, color: 'text-green-600', bg: 'bg-green-50' },
    { icon: DollarSign, label: 'Saldo Tersedia', value: `Rp ${Number(stats?.saldoTersedia ?? 0).toLocaleString('id-ID')}`, color: 'text-[#5873c4]', bg: 'bg-[#eef2ff]' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6fc] px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">Dashboard Affiliate</h1>
            <p className="text-sm text-slate-500 mt-1">
              Kode Referral:{' '}
              <span className="font-bold text-slate-700">{affiliate.kodeReferral}</span>
              {' '}·{' '}
              <span className={`font-semibold ${isActive ? 'text-green-600' : 'text-amber-500'}`}>
                {isActive ? '✅ Aktif' : '⏳ Menunggu Persetujuan'}
              </span>
            </p>
          </div>
          <Link
            href="/affiliate/dashboard/pencairan"
            className="px-5 py-2.5 bg-[#5873c4] text-white text-sm font-bold rounded-xl hover:bg-[#4660b0] transition-all shadow-md shadow-[#5873c4]/15 whitespace-nowrap"
          >
            💸 Ajukan Pencairan
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-xs font-semibold text-slate-500 mb-1">{card.label}</p>
              <p className={`text-xl font-extrabold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Tier Progress */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm font-bold text-slate-700">
                Tier Saat Ini: <span className="text-[#5873c4]">{tierProgress?.current?.toUpperCase() ?? '-'}</span>
              </p>
              {tierProgress?.next && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {tierProgress.currentCount} / {tierProgress.nextTarget} referral menuju tier{' '}
                  <strong>{tierProgress.next}</strong>
                </p>
              )}
            </div>
            <span className="text-xs font-bold text-[#5873c4] bg-[#eef2ff] px-3 py-1 rounded-full">
              {progressPct}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-[#5873c4] to-[#7048e8] h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Links */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 flex items-center justify-between border-b border-slate-50">
            <h2 className="font-bold text-slate-800">Link Tracking Saya</h2>
            <Link
              href="/affiliate/dashboard/links"
              className="text-xs font-semibold text-[#5873c4] hover:underline flex items-center gap-1"
            >
              Kelola Semua <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {links.slice(0, 3).map((link: any) => {
              const url = buildLink(link.slug);
              return (
                <div key={link.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{link.nama}</p>
                    <p className="text-xs text-slate-400 truncate font-mono">{url}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs text-slate-500">{link.totalKlik} klik</span>
                    <button
                      onClick={() => copyLink(url, link.id)}
                      id={`copy-link-${link.id}`}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#5873c4] hover:text-[#4660b0] transition-colors"
                    >
                      {copied === link.id ? <CheckCheck className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      {copied === link.id ? 'Disalin!' : 'Salin'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nav shortcuts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { href: '/affiliate/dashboard/referrals', label: '📊 Riwayat Referral' },
            { href: '/affiliate/dashboard/links', label: '🔗 Kelola Link' },
            { href: '/affiliate/dashboard/pencairan', label: '💸 Pencairan Komisi' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-sm font-semibold text-slate-700 hover:border-[#5873c4] hover:text-[#5873c4] transition-all hover:shadow-md text-center"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
