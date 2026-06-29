'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const GET_PAYMENTS = gql`query Payments { payments { id amount method status paidAt langgananId } }`;
const CREATE_PAYMENT = gql`mutation CreatePayment($langgananId: ID!, $method: String!) { createPayment(langgananId: $langgananId, method: $method) { id externalId } }`;
const CHECK_PAYMENT_STATUS = gql`mutation CheckPaymentStatus($id: ID!) { checkPaymentStatus(id: $id) { id status } }`;

interface PaymentData {
  id: string;
  amount: number;
  method: string;
  status: string;
  paidAt?: string;
  langgananId: string;
}

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const statusBadge: Record<string, { bg: string; text: string }> = {
  paid: { bg: 'bg-green-500/10', text: 'text-green-600' },
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-600' },
  failed: { bg: 'bg-red-500/10', text: 'text-red-600' },
  expired: { bg: 'bg-gray-500/10', text: 'text-gray-600' },
};

export default function PaymentPage() {
  const { data, loading, error, refetch } = useQuery<{ payments: PaymentData[] }>(GET_PAYMENTS, { fetchPolicy: 'cache-and-network' });
  const [createPayment] = useMutation(CREATE_PAYMENT);
  const [checkPaymentStatus] = useMutation(CHECK_PAYMENT_STATUS);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [form, setForm] = useState({ langgananId: '', method: 'bank_transfer' });

  const allData = data?.payments || [];
  const filteredData = statusFilter === 'all' ? allData : allData.filter(p => p.status === statusFilter);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await createPayment({ variables: { langgananId: form.langgananId, method: form.method } });
      toast.success('Pembayaran dibuat.');
      setDialogOpen(false); refetch();
    } catch (err: any) { toast.error(err?.message || 'Gagal membuat pembayaran.'); }
    finally { setSubmitting(false); }
  };

  const handleCheckStatus = async (id: string) => {
    try {
      await checkPaymentStatus({ variables: { id } });
      toast.success('Status pembayaran diperbarui.');
      refetch();
    } catch (err: any) { toast.error(err?.message || 'Gagal cek status.'); }
  };

  const statusTabs = [
    { key: 'all', label: 'Semua' },
    { key: 'paid', label: 'Paid' },
    { key: 'pending', label: 'Pending' },
    { key: 'failed', label: 'Failed' },
  ];

  const columns: ColumnDef<PaymentData>[] = [
    { header: 'Amount', cell: p => <span className="font-bold">{fmt(p.amount)}</span>, className: 'text-xs' },
    { header: 'Method', cell: p => <span className="capitalize">{p.method}</span>, className: 'text-xs' },
    { header: 'Status', cell: p => {
      const badge = statusBadge[p.status] || statusBadge.pending;
      return <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>{p.status}</span>;
    }, className: 'text-xs' },
    { header: 'Paid At', cell: p => p.paidAt ? new Date(p.paidAt).toLocaleString('id-ID') : '-', className: 'text-xs' },
    { header: 'Langganan ID', cell: p => <span className="font-mono text-xs">{p.langgananId}</span>, className: 'text-xs' },
    { header: 'Aksi', className: 'text-right w-24', cell: p => (
      <Button onClick={() => handleCheckStatus(p.id)} variant="ghost" size="sm" className="h-8 px-2 bg-background border border-border hover:bg-muted rounded-lg cursor-pointer" title="Refresh Status">
        <RefreshCw className="w-3.5 h-3.5 text-primary" />
      </Button>
    ) },
  ];

  if (error) return <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs"><AlertCircle className="w-4 h-4" /><span className="font-bold">{error.message}</span></div>;

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight">Payment</h2>
        <p className="text-xs text-muted-foreground font-medium">Riwayat pembayaran langganan akademi.</p>
      </div>

      <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
        {/* Status filter tabs */}
        <div className="flex items-center gap-1 mb-4">
          {statusTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 text-2xs font-bold rounded-lg transition-all cursor-pointer ${statusFilter === tab.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <DataTable
          data={filteredData}
          columns={columns}
          loading={loading}
          searchPlaceholder="Cari pembayaran..."
          searchKeys={['method', 'status', 'langgananId']}
          emptyMessage="Belum ada pembayaran."
          actions={
            <Button onClick={() => { setForm({ langgananId: '', method: 'bank_transfer' }); setDialogOpen(true); }} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer">
              <Plus className="w-3.5 h-3.5" /><span>Buat Pembayaran</span>
            </Button>
          }
        />
      </div>

      {/* Create Payment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-2xl p-6 shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-xl">Buat Pembayaran</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Langganan ID</label>
              <input type="text" value={form.langgananId} onChange={e => setForm(p => ({ ...p, langgananId: e.target.value }))} required className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" placeholder="Masukkan ID langganan" />
            </div>
            <div className="space-y-1">
              <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Metode Pembayaran</label>
              <select value={form.method} onChange={e => setForm(p => ({ ...p, method: e.target.value }))} className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium">
                <option value="bank_transfer">Bank Transfer</option>
                <option value="ewallet">E-Wallet</option>
                <option value="credit_card">Credit Card</option>
                <option value="qris">QRIS</option>
              </select>
            </div>
            <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <Button type="button" onClick={() => setDialogOpen(false)} className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer">Batal</Button>
              <Button type="submit" disabled={submitting} className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2">
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}<span>Buat</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
