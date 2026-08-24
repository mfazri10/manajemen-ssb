'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Loader2, AlertCircle, Bell, Check, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

const GET = gql`query GetNotifikasi { notifikasi { id judul isi tipe target isRead sentVia createdAt } }`;
const CREATE = gql`mutation CreateNotif($judul:String!,$isi:String!,$tipe:String,$target:String,$sentVia:String) { createNotifikasi(judul:$judul,isi:$isi,tipe:$tipe,target:$target,sentVia:$sentVia) { id } }`;
const MARK_READ = gql`mutation MarkRead($id:ID!) { markNotifikasiRead(id:$id) { id } }`;
const DELETE = gql`mutation DelNotif($id:ID!) { deleteNotifikasi(id:$id) }`;
const SEND_WA = gql`mutation SendWA($phone:String!,$message:String!) { sendWhatsApp(phone:$phone,message:$message) }`;
const SEND_EMAIL = gql`mutation SendEmail($to:String!,$subject:String!,$message:String!) { sendEmail(to:$to,subject:$subject,message:$message) }`;

interface Data { id: string; judul: string; isi: string; tipe: string; target: string; isRead: boolean; sentVia: string; createdAt?: string; }

export default function AdminNotifikasiPage() {
  const { data, loading, error, refetch } = useQuery<{ notifikasi: Data[] }>(GET, { fetchPolicy: 'cache-and-network' });
  const [create] = useMutation(CREATE);
  const [markRead] = useMutation(MARK_READ);
  const [del] = useMutation(DELETE);
  const [sendWa] = useMutation(SEND_WA);
  const [sendEmail] = useMutation(SEND_EMAIL);
  const { ask, dialog } = useConfirmDialog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const empty = { judul: '', isi: '', tipe: 'info', target: 'semua', sentVia: 'in_app' };
  const [f, setF] = useState(empty);
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  // === Kirim langsung via WhatsApp / Email ===
  const [directOpen, setDirectOpen] = useState(false);
  const [directBusy, setDirectBusy] = useState(false);
  const emptyDirect = { kanal: 'wa', penerima: '', subjek: '', pesan: '' };
  const [d, setD] = useState(emptyDirect);
  const setDirect = (k: string, v: string) => setD(p => ({ ...p, [k]: v }));

  const handleDirectSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setDirectBusy(true);
    try {
      if (d.kanal === 'wa') {
        await sendWa({ variables: { phone: d.penerima, message: d.pesan } });
        toast.success('Pesan WhatsApp dikirim.');
      } else {
        await sendEmail({ variables: { to: d.penerima, subject: d.subjek, message: d.pesan } });
        toast.success('Email dikirim.');
      }
      setDirectOpen(false);
      setD(emptyDirect);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Gagal mengirim pesan.');
    } finally {
      setDirectBusy(false);
    }
  };

  const handleDelete = (i: Data) => ask({
    title: 'Hapus notifikasi?',
    description: `Notifikasi "${i.judul}" akan dihapus permanen.`,
    onConfirm: async () => { try { await del({ variables: { id: i.id } }); toast.success('Dihapus.'); refetch(); } catch (e: any) { toast.error(e?.message); } },
  });
  const handleMarkRead = async (i: Data) => { try { await markRead({ variables: { id: i.id } }); refetch(); } catch (e: any) { toast.error(e?.message); } };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const vars: Record<string, unknown> = { judul: f.judul, isi: f.isi };
      if (f.tipe) vars.tipe = f.tipe;
      if (f.target) vars.target = f.target;
      if (f.sentVia) vars.sentVia = f.sentVia;
      await create({ variables: vars }); toast.success('Dikirim.'); setDialogOpen(false); refetch();
    } catch (e: any) { toast.error(e?.message); } finally { setSubmitting(false); }
  };

  const tipeColor: Record<string, string> = { info: 'bg-blue-500/10 text-blue-600', pengumuman: 'bg-purple-500/10 text-purple-600', spp: 'bg-amber-500/10 text-amber-600', jadwal: 'bg-green-500/10 text-green-600', absensi: 'bg-red-500/10 text-red-600', turnamen: 'bg-indigo-500/10 text-indigo-600' };

  const columns: ColumnDef<Data>[] = [
    { header: '', className: 'w-8', cell: i => !i.isRead ? <div className="w-2 h-2 bg-primary rounded-full" /> : <div className="w-2" /> },
    { header: 'Judul', accessorKey: 'judul', className: 'font-extrabold text-sm' },
    { header: 'Tipe', cell: i => <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${tipeColor[i.tipe] || ''}`}>{i.tipe}</span> },
    { header: 'Target', accessorKey: 'target', className: 'text-xs' },
    { header: 'Via', accessorKey: 'sentVia', className: 'text-xs' },
    { header: 'Isi', cell: i => i.isi.length > 40 ? i.isi.slice(0, 40) + '...' : i.isi, className: 'text-xs' },
    { header: 'Aksi', className: 'text-right w-28', cell: i => (
      <div className="flex items-center justify-end gap-1">
        {!i.isRead && <Button onClick={() => handleMarkRead(i)} variant="ghost" size="sm" className="h-7 px-2 bg-primary/10 border border-primary/20 text-primary rounded-lg cursor-pointer"><Check className="w-3 h-3" /></Button>}
        <Button onClick={() => handleDelete(i)} variant="ghost" size="sm" className="h-7 px-2 bg-destructive/10 border border-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg cursor-pointer"><Trash2 className="w-3 h-3" /></Button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2"><Bell className="w-6 h-6 text-primary" /> Notifikasi</h2>
        <p className="text-xs text-muted-foreground font-medium">Kelola notifikasi dan pemberitahuan.</p>
      </div>
      {error ? <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs"><AlertCircle className="w-4 h-4" /><span className="font-bold">{error.message}</span></div> : (
        <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
          <DataTable data={data?.notifikasi || []} columns={columns} loading={loading} searchPlaceholder="Cari..." searchKeys={['judul']} emptyMessage="Belum ada notifikasi." actions={
            <div className="flex items-center gap-2">
              <Button onClick={() => { setD(emptyDirect); setDirectOpen(true); }} variant="outline" className="border-border hover:bg-muted font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"><Send className="w-3.5 h-3.5" /><span>Kirim WA/Email</span></Button>
              <Button onClick={() => { setF(empty); setDialogOpen(true); }} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer"><Plus className="w-3.5 h-3.5" /><span>Kirim Notifikasi</span></Button>
            </div>
          } />
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">Kirim Notifikasi</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Judul</label><input type="text" value={f.judul} onChange={e => set('judul', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required /></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Tipe</label><select value={f.tipe} onChange={e => set('tipe', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium">{['info', 'pengumuman', 'spp', 'jadwal', 'absensi', 'turnamen'].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Target</label><select value={f.target} onChange={e => set('target', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium">{['semua', 'siswa', 'orang_tua', 'pelatih'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}</select></div>
              <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Via</label><select value={f.sentVia} onChange={e => set('sentVia', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium">{['in_app', 'push', 'wa', 'email'].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            </div>
            <div className="space-y-1"><label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Isi</label><textarea value={f.isi} onChange={e => set('isi', e.target.value)} rows={4} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required /></div>
            <DialogFooter className="pt-4 border-t border-border"><Button type="button" onClick={() => setDialogOpen(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer mr-2">Batal</Button><Button type="submit" disabled={submitting} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2">{submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}<span>Kirim</span></Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog kirim langsung via WhatsApp / Email */}
      <Dialog open={directOpen} onOpenChange={setDirectOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">Kirim Pesan Langsung</DialogTitle></DialogHeader>
          <form onSubmit={handleDirectSend} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Kanal</label>
                <select value={d.kanal} onChange={e => setDirect('kanal', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium">
                  <option value="wa">WhatsApp</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">{d.kanal === 'wa' ? 'No. WhatsApp' : 'Email Tujuan'}</label>
                <input type="text" value={d.penerima} onChange={e => setDirect('penerima', e.target.value)} placeholder={d.kanal === 'wa' ? '08xxxxxxxxxx' : 'nama@email.com'} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required />
              </div>
            </div>
            {d.kanal === 'email' && (
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Subjek</label>
                <input type="text" value={d.subjek} onChange={e => setDirect('subjek', e.target.value)} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Pesan</label>
              <textarea value={d.pesan} onChange={e => setDirect('pesan', e.target.value)} rows={4} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" required />
            </div>
            <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <Button type="button" onClick={() => setDirectOpen(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer">Batal</Button>
              <Button type="submit" disabled={directBusy} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2">{directBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}<span>Kirim</span></Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {dialog}
    </div>
  );
}
