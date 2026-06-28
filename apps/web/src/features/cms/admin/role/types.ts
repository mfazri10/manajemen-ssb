export interface Permission {
  id: number;
  name: string;
  label?: string;
}

export interface PermissionRole {
  id: number;
  permissionId: number;
  roleId: number;
  permission: Permission;
}

export interface Role {
  id: number;
  name: string;
  label?: string;
  permissionRoles: PermissionRole[];
}
