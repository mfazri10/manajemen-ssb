'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, gql } from '@apollo/client';
import { ArrowLeft, Copy, CheckCheck, Plus, Loader2 } from 'lucide-react';

const QUERY_LINKS = gql`query { myAffiliateLinks { id nama slug totalKlik totalKonversi aktif createdAt } }`;
const MUTATION_CREATE = gql`
  mutation CreateLink($nama: String!, $utmCampaign: String) {
    createAffiliateLink(nama: $nama, utmCampaign: $utmCampaign) {
      id nama slug totalKlik totalKonversi aktif createdAt
    }
  }
`;

export default function LinksPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [namaLink, setNamaLink] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data, loading } = useQuery(QUERY_LINKS, { fetchPolicy: 'cache-and-network' });
  const links = data?.myAffiliateLinks ?? [];

  const [createLinkMutation, { loading: creating }] = useMutation(MUTATION_CREATE, {
    refetchQueries: [{ query: QUERY_LINKS }],
  });

  const buildLink = (slug: string) =>
    `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${slug}`;

  const copyLink = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const createLink = async () => {
    if (!namaLink.trim()) { setError('Nama link wajib diisi.'); return; }
    setError(null);
    try {
      await createLinkMutation({ variables: { nama: namaLink } });
      setShowForm(false);
      setNamaLink('');
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fc] px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/affiliate/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-extrabold text-slate-800">Kelola Link Tracking</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            id="btn-tambah-link"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#5873c4] text-white text-sm font-bold rounded-xl hover:bg-[#4660b0] transition-all"
          >
            <Plus className="w-4 h-4" /> Buat Link Baru
          </button>
        </div>

        {/* Form tambah link */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 border border-[#5873c4]/30 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-700">Buat Link Tracking Baru</h2>
            <input
              type="text"
              value={namaLink}
              onChange={(e) => setNamaLink(e.target.value)}
              placeholder="Nama link (mis. Instagram Bio, WhatsApp Group)"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:border-[#5873c4] focus:ring-4 focus:ring-[#5873c4]/10 focus:outline-none transition-all"
            />
            {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={createLink}
                disabled={creating}
                className="flex-1 py-2.5 bg-[#5873c4] text-white text-sm font-bold rounded-xl hover:bg-[#4660b0] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Membuat…</> : 'Buat Link'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-all">
                Batal
              </button>
            </div>
          </div>
        )}

        {/* List links */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#5873c4] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-50">
              {links.map((link: any) => {
                const url = buildLink(link.slug);
                return (
                  <div key={link.id} className="px-6 py-5 flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-800">{link.nama}</p>
                      <p className="text-xs font-mono text-slate-400 truncate mt-0.5">{url}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-slate-500">👆 {link.totalKlik} klik</span>
                        <span className="text-xs text-slate-500">✅ {link.totalKonversi} konversi</span>
                        <span className={`text-xs font-semibold ${link.aktif ? 'text-green-600' : 'text-slate-400'}`}>
                          {link.aktif ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => copyLink(url, link.id)}
                      id={`copy-${link.id}`}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#5873c4] hover:text-[#4660b0] transition-colors shrink-0 mt-0.5"
                    >
                      {copied === link.id ? <CheckCheck className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      {copied === link.id ? 'Disalin!' : 'Salin'}
                    </button>
                  </div>
                );
              })}
              {links.length === 0 && (
                <div className="px-6 py-10 text-center text-slate-400 text-sm">
                  Belum ada link. Klik "Buat Link Baru" untuk membuat link tracking pertama Anda.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
