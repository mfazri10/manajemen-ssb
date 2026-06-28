'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/ui/table/data-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import * as LucideIcons from 'lucide-react';
import { toast } from 'sonner';

const GET_MENUS = gql`
  query GetMenus {
    menus {
      id
      name
      route
      icon
      parentId
      orderNo
      isActive
      slug
      subMenus {
        id
        name
        route
        icon
        parentId
        orderNo
        isActive
        slug
      }
    }
  }
`;

const CREATE_MENU = gql`
  mutation CreateMenu(
    $name: String!
    $slug: String!
    $route: String
    $icon: String
    $parentId: Int
    $orderNo: Int!
    $isActive: Boolean!
  ) {
    createMenu(
      name: $name
      slug: $slug
      route: $route
      icon: $icon
      parentId: $parentId
      orderNo: $orderNo
      isActive: $isActive
    ) {
      id
    }
  }
`;

const UPDATE_MENU = gql`
  mutation UpdateMenu(
    $id: Int!
    $name: String
    $slug: String
    $route: String
    $icon: String
    $parentId: Int
    $orderNo: Int
    $isActive: Boolean
  ) {
    updateMenu(
      id: $id
      name: $name
      slug: $slug
      route: $route
      icon: $icon
      parentId: $parentId
      orderNo: $orderNo
      isActive: $isActive
    ) {
      id
    }
  }
`;

const DELETE_MENU = gql`
  mutation DeleteMenu($id: Int!) {
    deleteMenu(id: $id) {
      id
    }
  }
`;

interface GQLMenu {
  id: number;
  name: string;
  route?: string | null;
  icon?: string | null;
  parentId?: number | null;
  orderNo: number;
  isActive: boolean;
  slug: string;
  subMenus?: GQLMenu[] | null;
}

const COMMON_ICONS = [
  { value: 'LayoutDashboard', label: 'Dashboard' },
  { value: 'Users', label: 'Pengguna / Anggota' },
  { value: 'Calendar', label: 'Kalender / Jadwal' },
  { value: 'ClipboardList', label: 'Papan Tulis / Absensi' },
  { value: 'Wallet', label: 'Dompet / Kas' },
  { value: 'Key', label: 'Kunci / Akses' },
  { value: 'Trophy', label: 'Trofi / Prestasi' },
  { value: 'Settings', label: 'Pengaturan' },
  { value: 'BookOpen', label: 'Buku / Kurikulum' },
  { value: 'Shield', label: 'Perisai / Keamanan' },
  { value: 'Award', label: 'Medali / Penghargaan' },
  { value: 'FileText', label: 'Dokumen / Laporan' },
  { value: 'Activity', label: 'Aktivitas / Tes Fisik' },
];

function DynamicMenuIcon({ name, className }: { name?: string | null | undefined; className?: string }) {
  if (!name) return <LucideIcons.Menu className={className} />;
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return <LucideIcons.Menu className={className} />;
  return <IconComponent className={className} />;
}

export default function AdminMenuPage() {
  const { data, loading, refetch } = useQuery<{ menus: GQLMenu[] }>(GET_MENUS, {
    fetchPolicy: 'cache-and-network',
  });

  const [createMenu] = useMutation(CREATE_MENU);
  const [updateMenu] = useMutation(UPDATE_MENU);
  const [deleteMenu] = useMutation(DELETE_MENU);

  // UI States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedMenu, setSelectedMenu] = useState<GQLMenu | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [route, setRoute] = useState('');
  const [icon, setIcon] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [orderNo, setOrderNo] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Get only root menus (that can act as parents)
  const rootMenus = data?.menus.filter((m) => !m.parentId) || [];

  const handleOpenCreate = () => {
    setFormMode('create');
    setSelectedMenu(null);
    setName('');
    setSlug('');
    setRoute('');
    setIcon('');
    setParentId(null);
    setOrderNo(0);
    setIsActive(true);
    setDialogOpen(true);
  };

  const handleOpenEdit = (menu: GQLMenu) => {
    setFormMode('edit');
    setSelectedMenu(menu);
    setName(menu.name);
    setSlug(menu.slug);
    setRoute(menu.route || '');
    setIcon(menu.icon || '');
    setParentId(menu.parentId || null);
    setOrderNo(menu.orderNo);
    setIsActive(menu.isActive);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      toast.error('Nama menu dan slug wajib diisi!');
      return;
    }

    setSubmitting(true);
    try {
      if (formMode === 'create') {
        await createMenu({
          variables: {
            name,
            slug,
            route: route.trim() || null,
            icon: icon || null,
            parentId: parentId ? Number(parentId) : null,
            orderNo: Number(orderNo),
            isActive,
          },
        });
        toast.success('Menu navigasi berhasil dibuat!');
      } else {
        await updateMenu({
          variables: {
            id: selectedMenu?.id,
            name,
            slug,
            route: route.trim() || null,
            icon: icon || null,
            parentId: parentId ? Number(parentId) : null,
            orderNo: Number(orderNo),
            isActive,
          },
        });
        toast.success('Menu navigasi berhasil diperbarui!');
      }
      setDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan menu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus menu ini beserta izin terkait?')) return;
    try {
      await deleteMenu({ variables: { id } });
      toast.success('Menu berhasil dihapus!');
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus menu');
    }
  };

  // Reusable Column definitions for DataTable
  const columns: ColumnDef<GQLMenu>[] = [
    {
      header: 'Menu / Submenu',
      cell: (menu) => {
        const parentName = menu.parentId
          ? data?.menus.find((m) => m.id === menu.parentId)?.name
          : null;
        return (
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
              <DynamicMenuIcon name={menu.icon} className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-2xs text-foreground">{menu.name}</span>
              {parentName && (
                <span className="text-5xs text-indigo-600 font-bold uppercase tracking-wider mt-0.5">
                  Sub-menu dari: {parentName}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Slug',
      accessorKey: 'slug',
      className: 'font-mono text-3xs',
    },
    {
      header: 'Rute Halaman',
      cell: (menu) => menu.route || <span className="italic opacity-60">- None (Header Group) -</span>,
      className: 'font-medium text-3xs text-muted-foreground',
    },
    {
      header: 'Order',
      accessorKey: 'orderNo',
      className: 'font-bold text-3xs',
    },
    {
      header: 'Status',
      cell: (menu) => (
        <span className={`px-2 py-0.5 text-5xs font-extrabold uppercase rounded-full tracking-wider ${
          menu.isActive
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/35 dark:text-emerald-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/35 dark:text-red-400'
        }`}>
          {menu.isActive ? 'Aktif' : 'Non-Aktif'}
        </span>
      ),
    },
    {
      header: 'Aksi',
      className: 'text-right w-[120px]',
      cell: (menu) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            onClick={() => handleOpenEdit(menu)}
            className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground cursor-pointer transition-all border-none bg-transparent"
          >
            <LucideIcons.Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            onClick={() => handleDelete(menu.id)}
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-500 hover:text-red-600 cursor-pointer transition-all border-none bg-transparent"
          >
            <LucideIcons.Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 w-full max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">Manajemen Menu Navigasi</h1>
        <p className="text-xs text-muted-foreground font-medium mt-1">
          Kelola menu dashboard utama dan submenu dinamis berdasarkan role-permission.
        </p>
      </div>

      {/* Data Table */}
      <div className="bg-card border border-border rounded-md p-5 shadow-2xs">
        <DataTable
          data={data?.menus || []}
          columns={columns}
          loading={loading}
          searchPlaceholder="Cari nama menu atau slug..."
          searchKeys={["name", "slug", "route"]}
          emptyMessage="Belum ada menu navigasi terdaftar."
          actions={
            <Button
              onClick={handleOpenCreate}
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-md gap-1.5 h-9 px-3 text-xs cursor-pointer flex items-center"
            >
              <LucideIcons.Plus className="w-3.5 h-3.5" />
              Tambah Menu
            </Button>
          }
        />
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border border-border text-foreground rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-black tracking-tight">
              {formMode === 'create' ? 'Tambah Menu Navigasi Baru' : 'Ubah Menu Navigasi'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama */}
            <div className="space-y-1">
              <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">
                Nama Menu
              </label>
              <input
                type="text"
                placeholder="Contoh: Jadwal Latihan"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formMode === 'create') {
                    // Auto-slugify
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                  }
                }}
                className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:border-primary/50 text-foreground"
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-1">
              <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">
                Slug (Izin Akses: slug.index)
              </label>
              <input
                type="text"
                placeholder="Contoh: jadwal-latihan"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono bg-background border border-border rounded-xl focus:outline-hidden focus:border-primary/50 text-foreground"
                required
              />
            </div>

            {/* Route */}
            <div className="space-y-1">
              <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">
                Rute URL (Kosongkan jika Header Group)
              </label>
              <input
                type="text"
                placeholder="Contoh: /admin/jadwal"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono bg-background border border-border rounded-xl focus:outline-hidden focus:border-primary/50 text-foreground"
              />
            </div>

            {/* Grid Icon & Parent */}
            <div className="grid grid-cols-2 gap-3">
              {/* Icon */}
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">
                  Icon Menu
                </label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:border-primary/50 text-foreground"
                >
                  <option value="">- Pilih Icon -</option>
                  {COMMON_ICONS.map((ico) => (
                    <option key={ico.value} value={ico.value}>
                      {ico.label} ({ico.value})
                    </option>
                  ))}
                </select>
              </div>

              {/* Parent */}
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">
                  Parent Menu (Sub-menu)
                </label>
                <select
                  value={parentId || ''}
                  onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:border-primary/50 text-foreground"
                >
                  <option value="">- Tanpa Parent (Root) -</option>
                  {rootMenus
                    .filter((m) => m.id !== selectedMenu?.id)
                    .map((rm) => (
                      <option key={rm.id} value={rm.id}>
                        {rm.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Grid Order & Active */}
            <div className="grid grid-cols-2 gap-3">
              {/* Order */}
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">
                  No. Urut (Order)
                </label>
                <input
                  type="number"
                  value={orderNo}
                  onChange={(e) => setOrderNo(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:border-primary/50 text-foreground"
                  min="0"
                />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-5xs font-bold text-muted-foreground uppercase tracking-widest">
                  Status Aktif
                </label>
                <div className="flex items-center gap-2 h-[38px]">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 border border-border rounded-md text-primary focus:ring-primary focus:ring-opacity-25"
                  />
                  <label htmlFor="isActive" className="text-xs text-muted-foreground font-medium cursor-pointer">
                    Aktif
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <Button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer flex items-center gap-2"
              >
                {submitting && <LucideIcons.Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {formMode === 'create' ? 'Simpan Menu' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
