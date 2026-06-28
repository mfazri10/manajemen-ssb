// ── Auth Types ─────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type RoleName = 'superadmin' | 'admin' | 'pelatih' | 'orang_tua';

export interface Role {
  id: number;
  name: RoleName;
  label?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: number;
  name: string;
  label?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoleUser {
  id: number;
  userId: string;
  roleId: number;
  akademiId: string;
}

// ── Auth Context ───────────────────────────────────────────────────────────────
export interface AuthSession {
  user: User;
  session: Session;
  roles: RoleName[];
  permissions: string[];
  akademiId: string | null;
}
