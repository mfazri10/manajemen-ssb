'use client';

import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Trophy, Loader2, AlertCircle } from 'lucide-react';

const GET_TURNAMEN = gql`query GetTurnamenKlasemen { turnamen { id nama } }`;
const GET_KLASEMEN = gql`
  query GetKlasemen($turnamenId: ID!) {
    klasemen(turnamenId: $turnamenId) {
      tim main menang seri kalah golMasuk golKemasukan selisihGol poin
    }
  }
`;

interface TurnamenOption { id: string; nama: string; }
interface KlasemenRow { tim: string; main: number; menang: number; seri: number; kalah: number; golMasuk: number; golKemasukan: number; selisihGol: number; poin: number; }

export default function AdminKlasemenPage() {
  const { data: turnamenData } = useQuery<{ turnamen: TurnamenOption[] }>(GET_TURNAMEN, { fetchPolicy: 'cache-and-network' });
  const [turnamenId, setTurnamenId] = useState('');
  const { data: klasemenData, loading, error } = useQuery<{ klasemen: KlasemenRow[] }>(GET_KLASEMEN, {
    variables: { turnamenId },
    skip: !turnamenId,
    fetchPolicy: 'cache-and-network',
  });

  const rows = [...(klasemenData?.klasemen || [])].sort(
    (a, b) => b.poin - a.poin || b.selisihGol - a.selisihGol || b.golMasuk - a.golMasuk,
  );

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          Klasemen Turnamen <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">Kompetisi</span>
        </h2>
        <p className="text-xs text-muted-foreground font-medium">Klasemen otomatis dihitung dari hasil pertandingan per turnamen.</p>
      </div>

      {/* Pilih turnamen */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-2">
        <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Turnamen</label>
        <select
          value={turnamenId}
          onChange={e => setTurnamenId(e.target.value)}
          className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-bold"
        >
          <option value="">-- Pilih Turnamen --</option>
          {(turnamenData?.turnamen || []).map(t => <option key={t.id} value={t.id}>{t.nama}</option>)}
        </select>
      </div>

      {!turnamenId ? (
        <div className="p-8 bg-card border border-dashed border-border rounded-xl text-center">
          <Trophy className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-2xs text-muted-foreground font-semibold">Pilih turnamen untuk melihat klasemen.</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs">
          <AlertCircle className="w-4 h-4" /><span className="font-bold">{error.message}</span>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-2xs text-muted-foreground font-semibold">
          <Loader2 className="w-5 h-5 animate-spin text-primary" /> Menghitung klasemen...
        </div>
      ) : rows.length === 0 ? (
        <div className="p-8 bg-card border border-dashed border-border rounded-xl text-center">
          <Trophy className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-2xs text-muted-foreground font-semibold">Belum ada pertandingan tercatat untuk turnamen ini.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-2xs overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-5xs font-bold text-muted-foreground uppercase tracking-widest">#</th>
                <th className="px-4 py-3 text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tim</th>
                <th className="px-3 py-3 text-5xs font-bold text-muted-foreground uppercase tracking-widest text-center">M</th>
                <th className="px-3 py-3 text-5xs font-bold text-muted-foreground uppercase tracking-widest text-center">Mg</th>
                <th className="px-3 py-3 text-5xs font-bold text-muted-foreground uppercase tracking-widest text-center">S</th>
                <th className="px-3 py-3 text-5xs font-bold text-muted-foreground uppercase tracking-widest text-center">K</th>
                <th className="px-3 py-3 text-5xs font-bold text-muted-foreground uppercase tracking-widest text-center">GM</th>
                <th className="px-3 py-3 text-5xs font-bold text-muted-foreground uppercase tracking-widest text-center">GK</th>
                <th className="px-3 py-3 text-5xs font-bold text-muted-foreground uppercase tracking-widest text-center">SG</th>
                <th className="px-4 py-3 text-5xs font-bold text-muted-foreground uppercase tracking-widest text-center">Poin</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.tim} className={`border-b border-border last:border-0 ${idx < 3 ? 'bg-primary/5' : ''}`}>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-2xs font-black ${idx === 0 ? 'bg-yellow-500/20 text-yellow-600' : idx === 1 ? 'bg-slate-400/20 text-slate-500' : idx === 2 ? 'bg-amber-600/20 text-amber-600' : 'bg-muted text-muted-foreground'}`}>{idx + 1}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-extrabold text-foreground">{r.tim}</td>
                  <td className="px-3 py-3 text-xs text-center font-bold text-foreground">{r.main}</td>
                  <td className="px-3 py-3 text-xs text-center font-bold text-green-600">{r.menang}</td>
                  <td className="px-3 py-3 text-xs text-center font-bold text-foreground">{r.seri}</td>
                  <td className="px-3 py-3 text-xs text-center font-bold text-destructive">{r.kalah}</td>
                  <td className="px-3 py-3 text-xs text-center font-bold text-foreground">{r.golMasuk}</td>
                  <td className="px-3 py-3 text-xs text-center font-bold text-foreground">{r.golKemasukan}</td>
                  <td className="px-3 py-3 text-xs text-center font-bold text-foreground">{r.selisihGol > 0 ? `+${r.selisihGol}` : r.selisihGol}</td>
                  <td className="px-4 py-3 text-center"><span className="text-xs font-black text-primary">{r.poin}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
