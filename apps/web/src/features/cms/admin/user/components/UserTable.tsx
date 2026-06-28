"use client";

import React from "react";
import { User } from "../types";
import { DataTable, ColumnDef } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, CheckCircle2, XCircle } from "lucide-react";

interface UserTableProps {
  users: User[];
  loading: boolean;
  onEditRoles: (user: User) => void;
  onDelete: (user: User) => void;
  actions?: React.ReactNode;
}

export default function UserTable({
  users,
  loading,
  onEditRoles,
  onDelete,
  actions,
}: UserTableProps) {
  const columns: ColumnDef<User>[] = [
    {
      header: "Nama",
      cell: (user) => (
        <div className="font-extrabold text-sm text-foreground">{user.name}</div>
      ),
    },
    {
      header: "Email",
      cell: (user) => (
        <span className="text-muted-foreground text-sm font-medium">{user.email}</span>
      ),
    },
    {
      header: "Status",
      className: "text-center",
      cell: (user) => (
        <div className="flex justify-center">
          {user.emailVerified ? (
            <span title="Terverifikasi">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </span>
          ) : (
            <span title="Belum Terverifikasi">
              <XCircle className="w-5 h-5 text-amber-500" />
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Roles",
      cell: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.roleUsers && user.roleUsers.length > 0 ? (
            user.roleUsers.map((ru) => (
              <span
                key={ru.id}
                className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-3xs font-extrabold rounded-md uppercase tracking-wide"
              >
                {ru.role.label || ru.role.name}
              </span>
            ))
          ) : (
            <span className="text-3xs text-muted-foreground/60 font-bold uppercase italic">
              Tanpa Role
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Aksi",
      className: "text-right w-32",
      cell: (user) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            onClick={() => onEditRoles(user)}
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 bg-background border border-border hover:bg-muted text-foreground rounded-lg gap-1.5 transition-all text-2xs font-extrabold cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Role</span>
          </Button>
          <Button
            onClick={() => onDelete(user)}
            variant="ghost"
            size="sm"
            className="h-8 px-2 bg-destructive/10 border border-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg gap-1.5 transition-all text-xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      loading={loading}
      searchPlaceholder="Cari nama atau email user..."
      searchKeys={["name", "email"]}
      emptyMessage="Belum ada user terdaftar."
      actions={actions}
    />
  );
}
