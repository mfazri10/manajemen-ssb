'use client';
import React from 'react';
import Link from 'next/link';
import { useQuery, gql } from '@apollo/client';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import { CreditCard, AlertCircle, Download, ArrowRight, CalendarClock } from 'lucide-react';
import { exportToCsv } from '@/lib/export-csv';

const MY_SUBSCRIPTION = gql`
  query BillingMySubscription {
    mySubscription {
      id
      plan
      status
      daysRemaining
      isTrial
      startedAt
      expiresAt
    }
  }
`;
const GET_PAYMENTS = gql`
  query BillingPayments {
    payments { id amount method status paidAt createdAt }
  }
`;

interface SubscriptionData {
  id: string;
  plan: string;
  status: string;
  daysRemaining: number;
  isTrial: boolean;
  startedAt?: string;
  expiresAt?: string;
}
interface PaymentData {
  id: string;
  amount: string;
  method: string;
  status: string;
  paidAt?: string;
  createdAt?: string;
}

const rupiah = (n: string | number) => `Rp ${Number(n).toLocaleString('id')}`;
const fmtDate = (d?: string) => {
  if (!d) return '-';
  try {
    return format(new Date(d), 'dd MMM yyyy', { locale: localeID });
  } catch {
    return d;
  }
};

const statusBadge = (status: string) => {
  const style =
    status === 'success' || status === 'aktif'
      ? 'bg-green-500/10 text-green-600 border-green-500/20'
      : status === 'pending'
        ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
        : 'bg-destructive/10 text-destructive border-destructive/20';
  return <span className={`text-2xs font-bold px-2 py-0.5 rounded-full border ${style}`}>{status}</span>;
};

export default function AdminBillingPage() {
  const { data: subData, loading: subLoading, error: subError } = useQuery<{ mySubscription: SubscriptionData | null }>(MY_SUBSCRIPTION, { fetchPolicy: 'cache-and-network' });
  const { data: payData, loading: payLoading } = useQuery<{ payments: PaymentData[] }>(GET_PAYMENTS, { fetchPolicy: 'cache-and-network' });

  const sub = subData?.mySubscription;
  const payments = payData?.payments || [];
  const paymentsExport = payments.map(p => ({
    tanggal: p.paidAt || p.createdAt || '',
    metode: p.method,
    jumlah: p.amount,
    status: p.status,
  }));

  const kolom: ColumnDef<PaymentData>[] = [
    { header: 'Tanggal', cell: i => fmtDate(i.paidAt || i.createdAt), className: 'text-xs' },
    { header: 'Metode', accessorKey: 'method', className: 'text-xs font-bold uppercase' },
    { header: 'Jumlah', cell: i => rupiah(i.amount), className: 'text-xs font-bold' },
    { header: 'Status', cell: i => statusBadge(i.status) },
  ];

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          Billing <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">Langganan</span>
        </h2>
        <p className="text-xs text-muted-foreground font-medium">Status langganan akademi dan riwayat pembayaran.</p>
      </div>

      {/* Kartu status langganan */}
      {subError ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs">
          <AlertCircle className="w-4 h-4" /><span className="font-bold">{subError.message}</span>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          {subLoading ? (
            <div className="h-16 w-full bg-muted/30 animate-pulse rounded-xl" />
          ) : sub ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-primary/10 text-primary rounded-lg"><CreditCard className="w-4 h-4" /></span>
                  <div>
                    <p className="font-black text-lg text-foreground uppercase tracking-tight">Paket {sub.plan}</p>
                    <p className="text-3xs text-muted-foreground font-bold flex items-center gap-1">
                      {sub.isTrial && <span className="px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 rounded-full uppercase">Free Trial</span>}
                      {statusBadge(sub.status)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-2xs text-muted-foreground font-semibold">
                  <span className="flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5 text-primary" /> Mulai: {fmtDate(sub.startedAt)}</span>
                  <span className="flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5 text-primary" /> Berakhir: {fmtDate(sub.expiresAt)}</span>
                  <span className={`px-2 py-0.5 rounded-full font-black ${sub.daysRemaining <= 7 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                    {sub.daysRemaining} hari tersisa
                  </span>
                </div>
              </div>
              <Link href="/admin/langganan">
                <Button className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl gap-1.5 h-10 px-4 text-xs cursor-pointer">
                  Kelola Paket <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <p className="text-xs text-muted-foreground font-semibold">Belum ada langganan aktif. Pilih paket untuk memulai.</p>
              <Link href="/admin/langganan">
                <Button className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl gap-1.5 h-10 px-4 text-xs cursor-pointer">
                  Pilih Paket <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Riwayat pembayaran */}
      <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
        <DataTable
          data={payments}
          columns={kolom}
          loading={payLoading}
          searchPlaceholder="Cari pembayaran..."
          searchKeys={['method', 'status']}
          emptyMessage="Belum ada riwayat pembayaran."
          actions={
            <Button onClick={() => exportToCsv('riwayat-pembayaran', paymentsExport)} variant="ghost" className="border border-border bg-background hover:bg-muted text-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer">
              <Download className="w-3.5 h-3.5" /><span>Export CSV</span>
            </Button>
          }
        />
      </div>
    </div>
  );
}
