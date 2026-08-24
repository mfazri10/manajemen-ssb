'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Loader2, AlertCircle, Trophy, Users, Target, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

const GET_MATCH = gql`query GetMatch($turnamenId:ID) { match(turnamenId:$turnamenId) { id turnamenId babak matchNo tanggal waktu lokasi timHome timAway skorHome skorAway status catatan } }`;
const GET_TURNAMEN = gql`query GetTurnamenM { turnamen { id nama } }`;
const GET_LINEUP = gql`query GetLineup($matchId:ID!) { matchLineup(matchId:$matchId) { id matchId siswaId tim posisi status menitMasuk menitKeluar } }`;
const GET_EVENTS = gql`query GetEvents($matchId:ID!) { matchEvent(matchId:$matchId) { id matchId siswaId tipe menit keterangan } }`;
const GET_KLASEMEN = gql`query GetKlasemen($turnamenId:ID!) { klasemen(turnamenId:$turnamenId) { tim main menang seri kalah golMasuk golKemasukan selisihGol poin } }`;
const GET_SISWA = gql`query GetSiswaM { siswa { id namaLengkap } }`;
const CREATE_MATCH = gql`mutation CM($turnamenId:ID!,$timHome:String,$timAway:String,$tanggal:String,$waktu:String,$lokasi:String,$babak:String) { createMatch(turnamenId:$turnamenId,timHome:$timHome,timAway:$timAway,tanggal:$tanggal,waktu:$waktu,lokasi:$lokasi,babak:$babak) { id } }`;
const UPDATE_MATCH = gql`mutation UM($id:ID!,$skorHome:Int,$skorAway:Int,$status:String) { updateMatch(id:$id,skorHome:$skorHome,skorAway:$skorAway,status:$status) { id } }`;
const DELETE_MATCH = gql`mutation DM($id:ID!) { deleteMatch(id:$id) }`;
const CREATE_LINEUP = gql`mutation CL($matchId:ID!,$siswaId:ID!,$tim:String,$posisi:String) { createMatchLineup(matchId:$matchId,siswaId:$siswaId,tim:$tim,posisi:$posisi) { id } }`;
const DELETE_LINEUP = gql`mutation DL($id:ID!) { deleteMatchLineup(id:$id) }`;
const CREATE_EVENT = gql`mutation CE($matchId:ID!,$tipe:String!,$siswaId:ID,$menit:Int,$keterangan:String) { createMatchEvent(matchId:$matchId,tipe:$tipe,siswaId:$siswaId,menit:$menit,keterangan:$keterangan) { id } }`;
const DELETE_EVENT = gql`mutation DE($id:ID!) { deleteMatchEvent(id:$id) }`;

type Tab = 'match' | 'klasemen';

export default function AdminMatchPage() {
  const [tab, setTab] = useState<Tab>('match');
  const [turnamenFilter, setTurnamenFilter] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<'lineup' | 'events'>('lineup');

  const { data: turnamenData } = useQuery<{ turnamen: { id: string; nama: string }[] }>(GET_TURNAMEN);
  const { data: siswaData } = useQuery<{ siswa: { id: string; namaLengkap: string }[] }>(GET_SISWA);

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2"><Trophy className="w-6 h-6 text-primary" /> Match & Klasemen</h2>
        <p className="text-xs text-muted-foreground font-medium">Kelola pertandingan, lineup, event, dan klasemen turnamen.</p>
      </div>
      <div className="flex gap-2 border-b border-border pb-2">
        <button onClick={() => setTab('match')} className={`text-xs font-bold px-3 py-1.5 rounded-t-lg cursor-pointer ${tab === 'match' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>Match</button>
        <button onClick={() => setTab('klasemen')} className={`text-xs font-bold px-3 py-1.5 rounded-t-lg cursor-pointer ${tab === 'klasemen' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>Klasemen</button>
      </div>
      <div className="mb-4">
        <select value={turnamenFilter} onChange={e => setTurnamenFilter(e.target.value)} className="px-3 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium">
          <option value="">-- Semua Turnamen --</option>
          {(turnamenData?.turnamen || []).map(t => <option key={t.id} value={t.id}>{t.nama}</option>)}
        </select>
      </div>
      {tab === 'match' && <MatchTab turnamenFilter={turnamenFilter} selectedMatch={selectedMatch} setSelectedMatch={setSelectedMatch} subTab={subTab} setSubTab={setSubTab} siswaMap={Object.fromEntries((siswaData?.siswa || []).map(s => [s.id, s.namaLengkap]))} siswaList={siswaData?.siswa || []} />}
      {tab === 'klasemen' && turnamenFilter && <KlasemenTab turnamenId={turnamenFilter} />}
      {tab === 'klasemen' && !turnamenFilter && <div className="text-xs text-muted-foreground p-4 bg-muted/30 rounded-xl">Pilih turnamen untuk melihat klasemen.</div>}
    </div>
  );
}

function MatchTab({ turnamenFilter, selectedMatch, setSelectedMatch, subTab, setSubTab, siswaMap, siswaList }: { turnamenFilter: string; selectedMatch: string | null; setSelectedMatch: (id: string | null) => void; subTab: 'lineup' | 'events'; setSubTab: (t: 'lineup' | 'events') => void; siswaMap: Record<string, string>; siswaList: { id: string; namaLengkap: string }[] }) {
  const { data, loading, refetch } = useQuery<{ match: any[] }>(GET_MATCH, { variables: turnamenFilter ? { turnamenId: turnamenFilter } : {}, fetchPolicy: 'cache-and-network' });
  const { data: lineupData, refetch: refetchLineup } = useQuery<{ matchLineup: any[] }>(GET_LINEUP, { variables: { matchId: selectedMatch || '' }, skip: !selectedMatch });
  const { data: eventsData, refetch: refetchEvents } = useQuery<{ matchEvent: any[] }>(GET_EVENTS, { variables: { matchId: selectedMatch || '' }, skip: !selectedMatch });
  const [createMatch] = useMutation(CREATE_MATCH);
  const [updateMatch] = useMutation(UPDATE_MATCH);
  const [deleteMatch] = useMutation(DELETE_MATCH);
  const [createLineup] = useMutation(CREATE_LINEUP);
  const [deleteLineup] = useMutation(DELETE_LINEUP);
  const [createEvent] = useMutation(CREATE_EVENT);
  const [deleteEvent] = useMutation(DELETE_EVENT);
  const { ask, dialog } = useConfirmDialog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lineupDialog, setLineupDialog] = useState(false);
  const [eventDialog, setEventDialog] = useState(false);
  const [skorDialog, setSkorDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [skorMatch, setSkorMatch] = useState<any>(null);
  const empty = { timHome: '', timAway: '', tanggal: '', waktu: '', lokasi: '', babak: 'penyisihan' };
  const [f, setF] = useState(empty);
  const [lf, setLf] = useState({ siswaId: '', tim: 'home', posisi: '' });
  const [ef, setEf] = useState({ siswaId: '', tipe: 'gol', menit: '', keterangan: '' });
  const [skor, setSkor] = useState({ home: 0, away: 0 });
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  const handleDelete = (id: string) => ask({
    title: 'Hapus match?',
    description: 'Data pertandingan ini akan dihapus permanen.',
    onConfirm: async () => { try { await deleteMatch({ variables: { id } }); toast.success('Dihapus.'); refetch(); } catch (e: any) { toast.error(e?.message); } },
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const vars: Record<string, unknown> = { turnamenId: turnamenFilter || data?.match?.[0]?.turnamenId };
      for (const [k, v] of Object.entries(f)) { if (v) vars[k] = v; }
      await createMatch({ variables: vars }); toast.success('Ditambahkan.'); setDialogOpen(false); refetch();
    } catch (e: any) { toast.error(e?.message); } finally { setSubmitting(false); }
  };
  const handleSkor = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await updateMatch({ variables: { id: skorMatch.id, skorHome: skor.home, skorAway: skor.away, status: 'selesai' } }); toast.success('Skor disimpan.'); setSkorDialog(false); refetch();
    } catch (e: any) { toast.error(e?.message); } finally { setSubmitting(false); }
  };
  const handleLineup = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await createLineup({ variables: { matchId: selectedMatch!, ...lf } }); toast.success('Ditambahkan.'); setLineupDialog(false); refetchLineup();
    } catch (e: any) { toast.error(e?.message); } finally { setSubmitting(false); }
  };
  const handleEvent = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const vars: Record<string, unknown> = { matchId: selectedMatch!, tipe: ef.tipe };
      if (ef.siswaId) vars.siswaId = ef.siswaId;
      if (ef.menit) vars.menit = parseInt(ef.menit);
      if (ef.keterangan) vars.keterangan = ef.keterangan;
      await createEvent({ variables: vars }); toast.success('Ditambahkan.'); setEventDialog(false); refetchEvents();
    } catch (e: any) { toast.error(e?.message); } finally { setSubmitting(false); }
  };

  const statusColor: Record<string, string> = { belum: 'bg-gray-500/10 text-gray-600', berlangsung: 'bg-blue-500/10 text-blue-600', selesai: 'bg-green-500/10 text-green-600', batal: 'bg-red-500/10 text-red-600' };
  const matchCols: ColumnDef<any>[] = [
    { header: 'No', cell: i => i.matchNo || '-', className: 'text-xs w-12' },
    { header: 'Babak', cell: i => i.babak?.replace('_', ' ') || '-', className: 'text-xs' },
    { header: 'Home', accessorKey: 'timHome', className: 'font-bold text-sm' },
    { header: 'Skor', cell: i => i.status === 'selesai' ? `${i.skorHome} - ${i.skorAway}` : 'vs', className: 'text-center font-black text-sm' },
    { header: 'Away', accessorKey: 'timAway', className: 'font-bold text-sm' },
    { header: 'Tanggal', cell: i => i.tanggal || '-', className: 'text-xs' },
    { header: 'Status', cell: i => <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${statusColor[i.status] || ''}`}>{i.status}</span> },
    { header: 'Aksi', className: 'text-right w-40', cell: i => (
      <div className="flex items-center justify-end gap-1">
        <Button onClick={() => { setSelectedMatch(i.id); }} variant="ghost" size="sm" className="h-7 px-2 text-2xs bg-muted border border-border rounded-lg cursor-pointer">Detail</Button>
        <Button onClick={() => { setSkorMatch(i); setSkor({ home: i.skorHome || 0, away: i.skorAway || 0 }); setSkorDialog(true); }} variant="ghost" size="sm" className="h-7 px-2 text-2xs bg-primary/10 border border-primary/20 text-primary rounded-lg cursor-pointer">Skor</Button>
        <Button onClick={() => handleDelete(i.id)} variant="ghost" size="sm" className="h-7 px-2 bg-destructive/10 border border-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg cursor-pointer"><Trash2 className="w-3 h-3" /></Button>
      </div>
    ) },
  ];

  const lineupCols: ColumnDef<any>[] = [
    { header: 'Pemain', cell: i => siswaMap[i.siswaId] || '-', className: 'font-bold text-sm' },
    { header: 'Tim', accessorKey: 'tim', className: 'text-xs' },
    { header: 'Posisi', accessorKey: 'posisi', className: 'text-xs' },
    { header: 'Status', accessorKey: 'status', className: 'text-xs' },
    { header: '', className: 'text-right w-12', cell: i => <Button onClick={() => { deleteLineup({ variables: { id: i.id } }).then(() => { toast.success('Dihapus.'); refetchLineup(); }); }} variant="ghost" size="sm" className="h-7 px-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg cursor-pointer"><Trash2 className="w-3 h-3" /></Button> },
  ];

  const eventCols: ColumnDef<any>[] = [
    { header: 'Tipe', accessorKey: 'tipe', className: 'font-bold text-sm' },
    { header: 'Pemain', cell: i => siswaMap[i.siswaId || ''] || '-', className: 'text-xs' },
    { header: 'Menit', cell: i => i.menit ? `${i.menit}'` : '-', className: 'text-xs' },
    { header: 'Keterangan', cell: i => i.keterangan || '-', className: 'text-xs' },
    { header: '', className: 'text-right w-12', cell: i => <Button onClick={() => { deleteEvent({ variables: { id: i.id } }).then(() => { toast.success('Dihapus.'); refetchEvents(); }); }} variant="ghost" size="sm" className="h-7 px-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg cursor-pointer"><Trash2 className="w-3 h-3" /></Button> },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
        <DataTable data={data?.match || []} columns={matchCols} loading={loading} searchPlaceholder="Cari..." searchKeys={['timHome', 'timAway']} emptyMessage="Belum ada match." actions={<Button onClick={() => { setF(empty); setDialogOpen(true); }} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"><Plus className="w-3.5 h-3.5" /><span>Tambah Match</span></Button>} />
      </div>

      {selectedMatch && (
        <div className="bg-card border border-border rounded-md p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-foreground">Detail Match</h3>
            <div className="flex gap-2">
              <button onClick={() => setSubTab('lineup')} className={`text-2xs font-bold px-3 py-1 rounded-lg cursor-pointer ${subTab === 'lineup' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>Lineup</button>
              <button onClick={() => setSubTab('events')} className={`text-2xs font-bold px-3 py-1 rounded-lg cursor-pointer ${subTab === 'events' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>Events</button>
            </div>
          </div>
          {subTab === 'lineup' && <DataTable data={lineupData?.matchLineup || []} columns={lineupCols} loading={false} searchPlaceholder="" emptyMessage="Belum ada lineup." actions={<Button onClick={() => { setLf({ siswaId: '', tim: 'home', posisi: '' }); setLineupDialog(true); }} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-8 px-2.5 text-2xs cursor-pointer"><Plus className="w-3 h-3" /><span>Tambah</span></Button>} />}
          {subTab === 'events' && <DataTable data={eventsData?.matchEvent || []} columns={eventCols} loading={false} searchPlaceholder="" emptyMessage="Belum ada event." actions={<Button onClick={() => { setEf({ siswaId: '', tipe: 'gol', menit: '', keterangan: '' }); setEventDialog(true); }} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-8 px-2.5 text-2xs cursor-pointer"><Plus className="w-3 h-3" /><span>Tambah</span></Button>} />}
        </div>
      )}

      {/* Add Match Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-lg rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">Tambah Match</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tim Home</label><input type="text" value={f.timHome} onChange={e => set('timHome', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required /></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tim Away</label><input type="text" value={f.timAway} onChange={e => set('timAway', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tanggal</label><input type="date" value={f.tanggal} onChange={e => set('tanggal', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Waktu</label><input type="time" value={f.waktu} onChange={e => set('waktu', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Babak</label><select value={f.babak} onChange={e => set('babak', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium">{['penyisihan', 'perempat_final', 'semi_final', 'final'].map(b => <option key={b} value={b}>{b.replace('_', ' ')}</option>)}</select></div>
            </div>
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Lokasi</label><input type="text" value={f.lokasi} onChange={e => set('lokasi', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" /></div>
            <DialogFooter className="pt-4 border-t border-border"><Button type="button" onClick={() => setDialogOpen(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer mr-2">Batal</Button><Button type="submit" disabled={submitting} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2">{submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}<span>Simpan</span></Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Skor Dialog */}
      <Dialog open={skorDialog} onOpenChange={setSkorDialog}>
        <DialogContent className="bg-card border border-border text-foreground max-w-sm rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">Input Skor</DialogTitle></DialogHeader>
          <form onSubmit={handleSkor} className="space-y-4">
            <div className="grid grid-cols-3 gap-3 items-end">
              <div className="space-y-1 text-center"><label className="text-5xs font-bold text-muted-foreground uppercase">{skorMatch?.timHome}</label><input type="number" min="0" value={skor.home} onChange={e => setSkor(p => ({ ...p, home: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 text-center text-lg font-black bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary" /></div>
              <div className="text-center text-lg font-black text-muted-foreground">vs</div>
              <div className="space-y-1 text-center"><label className="text-5xs font-bold text-muted-foreground uppercase">{skorMatch?.timAway}</label><input type="number" min="0" value={skor.away} onChange={e => setSkor(p => ({ ...p, away: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 text-center text-lg font-black bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary" /></div>
            </div>
            <DialogFooter className="pt-4 border-t border-border"><Button type="button" onClick={() => setSkorDialog(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer mr-2">Batal</Button><Button type="submit" disabled={submitting} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer">Simpan Skor</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lineup Dialog */}
      <Dialog open={lineupDialog} onOpenChange={setLineupDialog}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">Tambah Lineup</DialogTitle></DialogHeader>
          <form onSubmit={handleLineup} className="space-y-4">
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Pemain</label><select value={lf.siswaId} onChange={e => setLf(p => ({ ...p, siswaId: e.target.value }))} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium" required><option value="">-- Pilih --</option>{(siswaList || []).map(s => <option key={s.id} value={s.id}>{s.namaLengkap}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tim</label><select value={lf.tim} onChange={e => setLf(p => ({ ...p, tim: e.target.value }))} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"><option value="home">Home</option><option value="away">Away</option></select></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Posisi</label><input type="text" value={lf.posisi} onChange={e => setLf(p => ({ ...p, posisi: e.target.value }))} placeholder="GK, DF, MF, FW" className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium" /></div>
            </div>
            <DialogFooter className="pt-4 border-t border-border"><Button type="button" onClick={() => setLineupDialog(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer mr-2">Batal</Button><Button type="submit" disabled={submitting} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer">Simpan</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Event Dialog */}
      <Dialog open={eventDialog} onOpenChange={setEventDialog}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">Tambah Event</DialogTitle></DialogHeader>
          <form onSubmit={handleEvent} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tipe</label><select value={ef.tipe} onChange={e => setEf(p => ({ ...p, tipe: e.target.value }))} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium">{['gol', 'assist', 'kartu_kuning', 'kartu_merah', 'substitusi', 'own_goal'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}</select></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Menit</label><input type="number" min="0" value={ef.menit} onChange={e => setEf(p => ({ ...p, menit: e.target.value }))} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium" /></div>
            </div>
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Pemain</label><select value={ef.siswaId} onChange={e => setEf(p => ({ ...p, siswaId: e.target.value }))} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"><option value="">-- Pilih --</option>{(siswaList || []).map(s => <option key={s.id} value={s.id}>{s.namaLengkap}</option>)}</select></div>
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Keterangan</label><input type="text" value={ef.keterangan} onChange={e => setEf(p => ({ ...p, keterangan: e.target.value }))} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium" /></div>
            <DialogFooter className="pt-4 border-t border-border"><Button type="button" onClick={() => setEventDialog(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer mr-2">Batal</Button><Button type="submit" disabled={submitting} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer">Simpan</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {dialog}
    </div>
  );
}

function KlasemenTab({ turnamenId }: { turnamenId: string }) {
  const { data, loading } = useQuery<{ klasemen: any[] }>(GET_KLASEMEN, { variables: { turnamenId } });
  const cols: ColumnDef<any>[] = [
    { header: '#', cell: (_, i) => (i ?? 0) + 1, className: 'text-xs w-8 text-center font-bold' },
    { header: 'Tim', accessorKey: 'tim', className: 'font-extrabold text-sm' },
    { header: 'M', cell: i => i.main, className: 'text-xs text-center' },
    { header: 'W', cell: i => i.menang, className: 'text-xs text-center' },
    { header: 'D', cell: i => i.seri, className: 'text-xs text-center' },
    { header: 'L', cell: i => i.kalah, className: 'text-xs text-center' },
    { header: 'GF', cell: i => i.golMasuk, className: 'text-xs text-center' },
    { header: 'GA', cell: i => i.golKemasukan, className: 'text-xs text-center' },
    { header: 'GD', cell: i => i.selisihGol, className: 'text-xs text-center font-bold' },
    { header: 'Pts', cell: i => i.poin, className: 'text-sm text-center font-black text-primary' },
  ];
  return (
    <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
      <DataTable data={data?.klasemen || []} columns={cols} loading={loading} searchPlaceholder="" emptyMessage="Belum ada data klasemen." />
    </div>
  );
}
