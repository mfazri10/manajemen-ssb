'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { User } from '../types';

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      emailVerified
      createdAt
      roleUsers {
        id
        roleId
        role {
          id
          name
          label
        }
      }
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
    }
  }
`;

const UPDATE_USER_ROLES = gql`
  mutation UpdateUserRoles($input: UpdateUserRolesInput!) {
    updateUserRoles(input: $input) {
      id
      roleUsers {
        id
        roleId
        role {
          id
          name
          label
        }
      }
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: String!) {
    deleteUser(id: $id)
  }
`;

export function useUser() {
  const { data, loading, error, refetch } = useQuery<{ users: User[] }>(GET_USERS);

  const [createUserMutation, { loading: creating }] = useMutation(CREATE_USER, {
    onCompleted: () => refetch(),
  });

  const [updateUserRolesMutation, { loading: updatingRoles }] = useMutation(UPDATE_USER_ROLES, {
    onCompleted: () => refetch(),
  });

  const [deleteUserMutation, { loading: deleting }] = useMutation(DELETE_USER, {
    onCompleted: () => refetch(),
  });

  const createUser = async (name: string, email: string, password?: string, roleIds?: number[]) => {
    return createUserMutation({
      variables: {
        input: { name, email, password, roleIds },
      },
    });
  };

  const updateUserRoles = async (userId: string, roleIds: number[]) => {
    return updateUserRolesMutation({
      variables: {
        input: { userId, roleIds },
      },
    });
  };

  const deleteUser = async (id: string) => {
    return deleteUserMutation({
      variables: { id },
    });
  };

  return {
    users: data?.users || [],
    loading,
    error,
    creating,
    updatingRoles,
    deleting,
    createUser,
    updateUserRoles,
    deleteUser,
    refetch,
  };
}
