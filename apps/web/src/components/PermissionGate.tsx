'use client';

import React from 'react';
import { usePermissions } from '@/features/authentication/hooks/usePermissions';

interface PermissionGateProps {
  /**
   * List permission yang wajib dimiliki user (misal: "siswa.create")
   */
  permission?: string;
  /**
   * Alternatif: user bisa memiliki salah satu dari list permission ini
   */
  anyPermission?: string[];
  /**
   * Cek berdasarkan role
   */
  role?: string;
  /**
   * Konten yang di-render jika memiliki izin
   */
  children: React.ReactNode;
  /**
   * Fallback UI jika user tidak memiliki izin (default: null/kosong)
   */
  fallback?: React.ReactNode;
}

export function PermissionGate({
  permission,
  anyPermission,
  role,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasRole } = usePermissions();

  let hasAccess = true;

  if (permission) {
    hasAccess = hasAccess && hasPermission(permission);
  }

  if (anyPermission) {
    hasAccess = hasAccess && hasAnyPermission(anyPermission);
  }

  if (role) {
    hasAccess = hasAccess && hasRole(role);
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
export default PermissionGate;
