'use client';

import Link from 'next/link';
import { useQuery, gql } from '@apollo/client';
import { ArrowLeft, CheckCircle, Clock, XCircle, Ban } from 'lucide-react';

const QUERY = gql`
  query {
    myReferrals {
      id akademiId paymentAmount paymentBulanKe
      komisiFlat komisiPctEarned komisiTotal
      status conversionAt approvedAt paidAt
    }
  }
`;

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: any }> = {
  pending:  { label: 'Menunggu',  color: 'text-amber-600 bg-amber-50 border-amber-200',  Icon: Clock },
  approved: { label: 'Disetujui', color: 'text-green-600 bg-green-50 border-green-200',  Icon: CheckCircle },
  paid:     { label: 'Dibayar',   color: 'text-blue-600 bg-blue-50 border-blue-200',     Icon: CheckCircle },
  rejected: { label: 'Ditolak',   color: 'text-red-600 bg-red-50 border-red-200',        Icon: XCircle },
  reversed: { label: 'Dibalik',   color: 'text-slate-600 bg-slate-100 border-slate-200', Icon: Ban },
};

const fmt = (n: unknown) =>
  `Rp ${Number(n ?? 0).toLocaleString('id-ID')}`;

export default function ReferralsPage() {
  const { data, loading } = useQuery(QUERY, { fetchPolicy: 'cache-and-network' });
  const referrals = data?.myReferrals ?? [];

  return (
    <div className="min-h-screen bg-[#f4f6fc] px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/affiliate/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-extrabold text-slate-800">Riwayat Referral</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#5873c4] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : referrals.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-sm">Belum ada referral. Bagikan link Anda dan mulai hasilkan komisi!</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8f9ff] text-xs font-bold text-slate-500 uppercase tracking-wide text-left">
                  <th className="px-6 py-4">Tenant ID</th>
                  <th className="px-6 py-4">Bulan ke-</th>
                  <th className="px-6 py-4">Pembayaran</th>
                  <th className="px-6 py-4">Komisi</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {referrals.map((r: any) => {
                  const sc = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.pending!;
                  return (
                    <tr key={r.id} className="hover:bg-[#f8f9ff] transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500 truncate max-w-[120px]">
                        {r.akademiId?.slice(0, 8)}…
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">#{r.paymentBulanKe}</td>
                      <td className="px-6 py-4 text-slate-700">{fmt(r.paymentAmount)}</td>
                      <td className="px-6 py-4 font-bold text-[#5873c4]">{fmt(r.komisiTotal)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${sc.color}`}>
                          <sc.Icon className="w-3 h-3" />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(r.conversionAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
