'use client';

import { useAuthStore } from '@/store/auth-store';

export function usePermissions() {
  const { roles, permissions, activeAkademiId, setActiveAkademiId } = useAuthStore();

  /**
   * Cek apakah user memiliki permission tertentu
   */
  const hasPermission = (permission: string): boolean => {
    // Superadmin otomatis memiliki semua akses
    if (roles.includes('superadmin')) return true;
    return permissions.includes(permission);
  };

  /**
   * Cek apakah user memiliki minimal salah satu dari beberapa permissions
   */
  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    if (roles.includes('superadmin')) return true;
    return requiredPermissions.some((p) => permissions.includes(p));
  };

  /**
   * Cek apakah user memiliki role tertentu
   */
  const hasRole = (role: string): boolean => {
    return roles.includes(role);
  };

  return {
    roles,
    permissions,
    activeAkademiId,
    setActiveAkademiId,
    hasPermission,
    hasAnyPermission,
    hasRole,
  };
}
