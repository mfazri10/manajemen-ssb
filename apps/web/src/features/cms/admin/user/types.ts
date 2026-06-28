export interface UserRole {
  id: number;
  name: string;
  label?: string;
}

export interface UserRoleUser {
  id: number;
  userId: string;
  roleId: number;
  role: UserRole;
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  roleUsers: UserRoleUser[];
  createdAt: string;
  updatedAt: string;
}
