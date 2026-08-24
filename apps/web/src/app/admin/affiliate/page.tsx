'use client';

import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { CheckCircle, XCircle, Clock, Ban, Loader2, Users, DollarSign, TrendingUp } from 'lucide-react';

const QUERY_ALL_AFFILIATES = gql`
  query($status: String) {
    allAffiliates(status: $status) {
      id userId kodeReferral tier status
      totalKlik totalReferral totalKomisi saldoTersedia saldoPending
      joinedAt approvedAt namaBank nomorRekening atasNama
    }
  }
`;

const QUERY_ALL_PAYOUTS = gql`
  query($status: String) {
    allPayouts(status: $status) {
      id affiliateId jumlah metode status requestedAt paidAt buktiTransfer referensiBiaya
    }
  }
`;

const MUTATION_APPROVE = gql`mutation($id: ID!) { approveAffiliate(id: $id) { id status approvedAt } }`;
const MUTATION_SUSPEND = gql`mutation($id: ID!, $alasan: String) { suspendAffiliate(id: $id, alasan: $alasan) { id status } }`;
const MUTATION_PROCESS_PAYOUT = gql`
  mutation($id: ID!, $referensiBiaya: String, $buktiTransfer: String) {
    processPayout(id: $id, referensiBiaya: $referensiBiaya, buktiTransfer: $buktiTransfer) {
      id status paidAt
    }
  }
`;

const TIER_BADGE: Record<string, string> = {
  starter: 'bg-slate-100 text-slate-600',
  growth:  'bg-blue-50 text-blue-600',
  pro:     'bg-amber-50 text-amber-600',
  elite:   'bg-purple-50 text-purple-600',
};

const STATUS_BADGE: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-600 border-amber-200',
  active:    'bg-green-50 text-green-600 border-green-200',
  suspended: 'bg-red-50 text-red-600 border-red-200',
  rejected:  'bg-slate-100 text-slate-500 border-slate-200',
  requested: 'bg-amber-50 text-amber-600 border-amber-200',
  processing:'bg-blue-50 text-blue-600 border-blue-200',
  paid:      'bg-green-50 text-green-600 border-green-200',
  failed:    'bg-red-50 text-red-600 border-red-200',
};

const fmt = (n: unknown) => `Rp ${Number(n ?? 0).toLocaleString('id-ID')}`;

const REFETCH_ALL = [
  { query: QUERY_ALL_AFFILIATES },
  { query: QUERY_ALL_PAYOUTS },
];

export default function AdminAffiliatePage() {
  const [tab, setTab] = useState<'affiliates' | 'payouts'>('affiliates');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { data: affiliatesData, loading: loadingAffiliates } = useQuery(QUERY_ALL_AFFILIATES, { fetchPolicy: 'cache-and-network' });
  const { data: payoutsData, loading: loadingPayouts } = useQuery(QUERY_ALL_PAYOUTS, { fetchPolicy: 'cache-and-network' });

  const affiliates = affiliatesData?.allAffiliates ?? [];
  const payouts = payoutsData?.allPayouts ?? [];
  const loading = loadingAffiliates || loadingPayouts;

  const [approveAffiliateMutate] = useMutation(MUTATION_APPROVE, { refetchQueries: REFETCH_ALL });
  const [suspendAffiliateMutate] = useMutation(MUTATION_SUSPEND, { refetchQueries: REFETCH_ALL });
  const [processPayoutMutate] = useMutation(MUTATION_PROCESS_PAYOUT, { refetchQueries: REFETCH_ALL });

  const approveAffiliate = async (id: string) => {
    setActionLoading(id);
    try {
      await approveAffiliateMutate({ variables: { id } });
    } catch (err) {
      console.error('Approve failed:', err);
    }
    setActionLoading(null);
  };

  const suspendAffiliate = async (id: string) => {
    const alasan = prompt('Alasan penangguhan (opsional):') ?? '';
    setActionLoading(id);
    try {
      await suspendAffiliateMutate({ variables: { id, alasan } });
    } catch (err) {
      console.error('Suspend failed:', err);
    }
    setActionLoading(null);
  };

  const processPayout = async (id: string) => {
    const referensiBiaya = prompt('Nomor referensi transfer:') ?? '';
    setActionLoading(id);
    try {
      await processPayoutMutate({ variables: { id, referensiBiaya } });
    } catch (err) {
      console.error('Process payout failed:', err);
    }
    setActionLoading(null);
  };

  // === STATS SUMMARY ===
  const totalAffiliate = affiliates.length;
  const activeAffiliate = affiliates.filter((a: any) => a.status === 'active').length;
  const pendingPayout = payouts.filter((p: any) => p.status === 'requested').length;
  const totalPendingAmount = payouts
    .filter((p: any) => p.status === 'requested')
    .reduce((sum: number, p: any) => sum + Number(p.jumlah), 0);

  return (
    <div className="min-h-screen bg-[#f4f6fc] px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Admin — Manajemen Affiliate</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola pendaftar affiliate, setujui atau tangguhkan akun, dan proses pencairan komisi.</p>
        </div>

        {/* Stat summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { Icon: Users, label: 'Total Affiliate', value: totalAffiliate, color: 'text-slate-600', bg: 'bg-slate-100' },
            { Icon: CheckCircle, label: 'Aktif', value: activeAffiliate, color: 'text-green-600', bg: 'bg-green-50' },
            { Icon: Clock, label: 'Pencairan Pending', value: pendingPayout, color: 'text-amber-600', bg: 'bg-amber-50' },
            { Icon: DollarSign, label: 'Total Pending IDR', value: fmt(totalPendingAmount), color: 'text-[#5873c4]', bg: 'bg-[#eef2ff]' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-xs font-semibold text-slate-500 mb-0.5">{s.label}</p>
              <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tab */}
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm w-fit">
          {(['affiliates', 'payouts'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === t ? 'bg-[#5873c4] text-white shadow-md shadow-[#5873c4]/20' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t === 'affiliates' ? `👥 Affiliate (${affiliates.length})` : `💸 Pencairan (${payouts.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#5873c4] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tab === 'affiliates' ? (
          /* === TABLE AFFILIATES === */
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f8f9ff] text-xs font-bold text-slate-500 uppercase tracking-wide text-left">
                    <th className="px-5 py-4">Kode Referral</th>
                    <th className="px-5 py-4">Tier</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Referral</th>
                    <th className="px-5 py-4">Saldo Tersedia</th>
                    <th className="px-5 py-4">Bergabung</th>
                    <th className="px-5 py-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {affiliates.map((a: any) => (
                    <tr key={a.id} className="hover:bg-[#f8f9ff] transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-slate-700 text-xs">{a.kodeReferral}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${TIER_BADGE[a.tier] ?? ''}`}>
                          {a.tier}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-lg border text-xs font-semibold ${STATUS_BADGE[a.status] ?? ''}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium">{a.totalReferral}</td>
                      <td className="px-5 py-4 font-bold text-[#5873c4]">{fmt(a.saldoTersedia)}</td>
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {new Date(a.joinedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {a.status === 'pending' && (
                            <button
                              id={`approve-affiliate-${a.id}`}
                              onClick={() => approveAffiliate(a.id)}
                              disabled={actionLoading === a.id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                            >
                              {actionLoading === a.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                              Setujui
                            </button>
                          )}
                          {a.status === 'active' && (
                            <button
                              id={`suspend-affiliate-${a.id}`}
                              onClick={() => suspendAffiliate(a.id)}
                              disabled={actionLoading === a.id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                            >
                              {actionLoading === a.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
                              Tangguhkan
                            </button>
                          )}
                          {a.status === 'suspended' && (
                            <button
                              id={`reactivate-affiliate-${a.id}`}
                              onClick={() => approveAffiliate(a.id)}
                              disabled={actionLoading === a.id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-slate-500 hover:bg-slate-600 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                            >
                              <TrendingUp className="w-3 h-3" /> Aktifkan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {affiliates.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">
                        Belum ada pendaftar affiliate.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* === TABLE PAYOUTS === */
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f8f9ff] text-xs font-bold text-slate-500 uppercase tracking-wide text-left">
                    <th className="px-5 py-4">Affiliate ID</th>
                    <th className="px-5 py-4">Jumlah</th>
                    <th className="px-5 py-4">Metode</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Diminta</th>
                    <th className="px-5 py-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payouts.map((p: any) => (
                    <tr key={p.id} className="hover:bg-[#f8f9ff] transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-slate-500">{p.affiliateId?.slice(0, 8)}…</td>
                      <td className="px-5 py-4 font-bold text-slate-800">{fmt(p.jumlah)}</td>
                      <td className="px-5 py-4 text-slate-600 text-xs capitalize">{p.metode?.replace(/_/g, ' ')}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-lg border text-xs font-semibold ${STATUS_BADGE[p.status] ?? ''}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {new Date(p.requestedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        {(p.status === 'requested' || p.status === 'processing') && (
                          <button
                            id={`process-payout-${p.id}`}
                            onClick={() => processPayout(p.id)}
                            disabled={actionLoading === p.id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#5873c4] hover:bg-[#4660b0] text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                          >
                            {actionLoading === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                            Tandai Dibayar
                          </button>
                        )}
                        {p.status === 'paid' && (
                          <span className="text-xs text-green-600 font-semibold">✅ Lunas</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {payouts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-sm">
                        Belum ada permintaan pencairan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
