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

export default function AuditLogPage() {
  const [entitasFilter, setEntitasFilter] = useState<string>('');
  const [limit, setLimit] = useState(100);

  const { data, loading, error } = useQuery<{ auditLog: AuditLogData[] }>(GET_AUDIT_LOG, {
    variables: { entitas: entitasFilter || undefined, limit },
    fetchPolicy: 'cache-and-network',
  });

  const columns: ColumnDef<AuditLogData>[] = [
    { header: 'User', cell: a => <span className="font-mono text-xs">{a.userId}</span>, className: 'text-xs' },
    { header: 'Aksi', cell: a => (
      <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${a.aksi === 'create' ? 'bg-green-500/10 text-green-600' : a.aksi === 'update' ? 'bg-blue-500/10 text-blue-600' : a.aksi === 'delete' ? 'bg-red-500/10 text-red-600' : 'bg-muted text-muted-foreground'}`}>{a.aksi}</span>
    ), className: 'text-xs' },
    { header: 'Entitas', cell: a => <span className="font-bold text-xs">{a.entitas}</span>, className: 'text-xs' },
    { header: 'Entitas ID', cell: a => <span className="font-mono text-xs">{a.entitasId}</span>, className: 'text-xs' },
    { header: 'Waktu', cell: a => a.createdAt ? new Date(a.createdAt).toLocaleString('id-ID') : '-', className: 'text-xs' },
    { header: 'IP Address', cell: a => <span className="font-mono text-xs">{a.ipAddress || '-'}</span>, className: 'text-xs' },
  ];

  if (error) return <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-xs"><AlertCircle className="w-4 h-4" /><span className="font-bold">{error.message}</span></div>;

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight">Audit Log</h2>
        <p className="text-xs text-muted-foreground font-medium">Log aktivitas seluruh pengguna dalam sistem.</p>
      </div>

      <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="space-y-1">
            <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Entitas</label>
            <select
              value={entitasFilter}
              onChange={e => setEntitasFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
            >
              <option value="">Semua Entitas</option>
              {entitasOptions.filter(Boolean).map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">Limit</label>
            <select
              value={limit}
              onChange={e => setLimit(Number(e.target.value))}
              className="px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:border-primary text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
            </select>
          </div>
        </div>

        <DataTable
          data={data?.auditLog || []}
          columns={columns}
          loading={loading}
          searchPlaceholder="Cari log..."
          searchKeys={['userId', 'aksi', 'entitas', 'ipAddress']}
          emptyMessage="Belum ada log aktivitas."
        />
      </div>
    </div>
  );
}
