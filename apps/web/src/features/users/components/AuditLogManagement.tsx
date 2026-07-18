'use client';

import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import { AlertCircle } from 'lucide-react';

const GET_AUDIT_LOG = gql`query AuditLog($entitas: String, $limit: Int) { auditLog(entitas: $entitas, limit: $limit) { id userId aksi entitas entitasId ipAddress createdAt } }`;

interface AuditLogData {
  id: string;
  userId: string;
  aksi: string;
  entitas: string;
  entitasId: string;
  ipAddress: string;
  createdAt: string;
}

const entitasOptions = ['', 'siswa', 'pelatih', 'jadwal', 'absensi', 'pembayaran', 'pengumuman', 'user', 'pendaftaran', 'langganan'];

export default function AuditLogManagement() {
  const [entitasFilter, setEntitasFilter] = useState<string>('');
  const [limit, setLimit] = useState(100);

  const { data, loading, error } = useQuery<{ auditLog: AuditLogData[] }>(GET_AUDIT_LOG, {
    variables: { entitas: entitasFilter || undefined, limit },
    fetchPolicy: 'cache-and-network',
  });

  const columns: ColumnDef<AuditLogData>[] = [
    { header: 'User ID', cell: a => <span className="font-mono text-xs text-foreground/80">{a.userId}</span>, className: 'text-xs' },
    { header: 'Aksi / Mutasi', cell: a => (
      <span className={`text-2xs font-extrabold px-2 py-0.5 rounded-full ${
        a.aksi.toLowerCase().includes('create') 
          ? 'bg-green-500/10 text-green-600' 
          : a.aksi.toLowerCase().includes('update') 
            ? 'bg-blue-500/10 text-blue-600' 
            : a.aksi.toLowerCase().includes('delete') 
              ? 'bg-destructive/10 text-destructive' 
              : 'bg-muted text-muted-foreground'
      }`}>{a.aksi}</span>
    ), className: 'text-xs' },
    { header: 'Entitas', cell: a => <span className="font-bold text-xs uppercase text-primary/80">{a.entitas}</span>, className: 'text-xs' },
    { header: 'ID Entitas Terkait', cell: a => <span className="font-mono text-xs">{a.entitasId || '-'}</span>, className: 'text-xs' },
    { header: 'Waktu Aktivitas', cell: a => a.createdAt ? new Date(a.createdAt).toLocaleString('id-ID') : '-', className: 'text-xs font-semibold' },
    { header: 'IP Address', cell: a => <span className="font-mono text-xs">{a.ipAddress || '-'}</span>, className: 'text-xs' },
  ];

  if (error) return <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs"><AlertCircle className="w-4 h-4" /><span className="font-bold">{error.message}</span></div>;

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          Audit Trail <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">Keamanan</span>
        </h2>
        <p className="text-xs text-muted-foreground font-medium">Log riwayat aktifitas mutasi data dan aksi oleh admin/staf dalam sistem.</p>
      </div>

      <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-5 border-b border-border pb-4">
          <div className="space-y-1">
            <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Filter Kategori</label>
            <select
              value={entitasFilter}
              onChange={e => setEntitasFilter(e.target.value)}
              className="w-40 px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium cursor-pointer"
            >
              <option value="">Semua Entitas</option>
              {entitasOptions.filter(Boolean).map(e => (
                <option key={e} value={e}>{e.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Limit Tampilan</label>
            <select
              value={limit}
              onChange={e => setLimit(Number(e.target.value))}
              className="w-24 px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium cursor-pointer"
            >
              <option value={50}>50 Baris</option>
              <option value={100}>100 Baris</option>
              <option value={200}>200 Baris</option>
              <option value={500}>500 Baris</option>
            </select>
          </div>
        </div>

        <DataTable
          data={data?.auditLog || []}
          columns={columns}
          loading={loading}
          searchPlaceholder="Cari log aktivitas..."
          searchKeys={['userId', 'aksi', 'entitas', 'ipAddress']}
          emptyMessage="Belum ada log aktivitas yang tercatat."
        />
      </div>
    </div>
  );
}
