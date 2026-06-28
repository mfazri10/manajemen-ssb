"use client";

import React from "react";
import { useRole } from "@/features/cms/admin/role/hooks/useRole";
import PermissionMatrix from "@/features/cms/admin/role/components/PermissionMatrix";
import { ShieldAlert } from "lucide-react";

export default function AdminRolesPage() {
  const { roles, permissions, loading, updating, updateRolePermissions } =
    useRole();

  const handleTogglePermission = async (
    roleId: number,
    permissionIds: number[],
  ) => {
    await updateRolePermissions(roleId, permissionIds);
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      
      {/* Header Info */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          Matriks Hak Akses (RBAC)
          <span className="text-3xs px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full font-black uppercase">
            Roles & Perms
          </span>
        </h2>
        <p className="text-xs text-muted-foreground font-medium">
          Peta matriks otorisasi sistem. Anda dapat memberikan atau mencabut
          hak akses secara real-time untuk setiap kategori peran.
        </p>
      </div>

      {/* Warning Alert Box */}
      <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-3 text-amber-900 dark:text-amber-200/90 text-xs max-w-3xl">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-extrabold block text-amber-700 dark:text-amber-400">
            Peringatan Keamanan
          </span>
          <span className="font-medium">
            Perubahan matriks hak akses ini berdampak langsung kepada seluruh
            user dengan role tersebut secara instan. Role{" "}
            <strong>superadmin</strong> secara permanen memiliki seluruh hak
            akses sistem secara *bypass*.
          </span>
        </div>
      </div>

      {/* Permission Matrix component */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-400">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Memuat skema otorisasi...</span>
        </div>
      ) : (
        <PermissionMatrix
          roles={roles}
          permissions={permissions}
          onToggle={handleTogglePermission}
          updating={updating}
        />
      )}

    </div>
  );
}
