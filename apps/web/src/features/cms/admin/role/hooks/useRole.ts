'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { Role, Permission } from '../types';

export const GET_ROLES = gql`
  query GetRoles {
    roles {
      id
      name
      label
      permissionRoles {
        id
        permissionId
        permission {
          id
          name
          label
        }
      }
    }
  }
`;

export const GET_PERMISSIONS = gql`
  query GetPermissions {
    permissions {
      id
      name
      label
    }
  }
`;

const UPDATE_ROLE_PERMISSIONS = gql`
  mutation UpdateRolePermissions($input: UpdateRolePermissionsInput!) {
    updateRolePermissions(input: $input) {
      id
      permissionRoles {
        id
        permissionId
      }
    }
  }
`;

export function useRole() {
  const { data: rolesData, loading: loadingRoles, error: errorRoles, refetch: refetchRoles } = useQuery<{ roles: Role[] }>(GET_ROLES);
  const { data: permsData, loading: loadingPerms, error: errorPerms } = useQuery<{ permissions: Permission[] }>(GET_PERMISSIONS);

  const [updateRolePermissionsMutation, { loading: updating }] = useMutation(UPDATE_ROLE_PERMISSIONS, {
    onCompleted: () => refetchRoles(),
  });

  const updateRolePermissions = async (roleId: number, permissionIds: number[]) => {
    return updateRolePermissionsMutation({
      variables: {
        input: { roleId, permissionIds },
      },
    });
  };

  return {
    roles: rolesData?.roles || [],
    permissions: permsData?.permissions || [],
    loading: loadingRoles || loadingPerms,
    error: errorRoles || errorPerms,
    updating,
    updateRolePermissions,
    refetchRoles,
  };
}
