"use client";

import React, { useState } from "react";
import { Role, Permission } from "../types";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table/table";
import { toast } from "sonner";

interface PermissionMatrixProps {
  roles: Role[];
  permissions: Permission[];
  onToggle: (roleId: number, permissionIds: number[]) => Promise<void>;
  updating: boolean;
}

export default function PermissionMatrix({
  roles,
  permissions,
  onToggle,
  updating,
}: PermissionMatrixProps) {
  const [activeRoleId, setActiveRoleId] = useState<number | null>(null);

  const groupedPermissions: { [key: string]: Permission[] } = {};
  permissions.forEach((perm) => {
    const prefix = perm.name.split(".")[0] || "lainnya";
    if (!groupedPermissions[prefix]) {
      groupedPermissions[prefix] = [];
    }
    groupedPermissions[prefix]!.push(perm);
  });

  const getRolePermissionIds = (role: Role): number[] => {
    return role.permissionRoles.map((pr) => pr.permissionId);
  };

  const handleCheckboxChange = async (
    role: Role,
    permissionId: number,
    isChecked: boolean,
  ) => {
    setActiveRoleId(role.id);
    const currentPermIds = getRolePermissionIds(role);
    let newPermIds: number[];

    if (isChecked) {
      newPermIds = [...currentPermIds, permissionId];
    } else {
      newPermIds = currentPermIds.filter((id) => id !== permissionId);
    }

    try {
      await onToggle(role.id, newPermIds);
      toast.success(
        `Hak akses untuk role "${role.label || role.name}" berhasil diperbarui.`,
      );
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengubah hak akses.");
    } finally {
      setActiveRoleId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden relative shadow-2xs">
      {updating && (
        <div className="absolute inset-0 bg-background/40 backdrop-blur-3xs flex items-center justify-center z-50">
          <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl shadow-lg text-xs font-bold text-foreground">
            <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Menyinkronkan database...</span>
          </div>
        </div>
      )}

      <Table>
        <TableHeader className="bg-muted/40 border-b border-border">
          <TableRow className="border-b border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground font-bold text-xs py-4">
              Modul & Permission
            </TableHead>
            {roles.map((role) => (
              <TableHead
                key={role.id}
                className="text-muted-foreground font-bold text-xs py-4 text-center"
              >
                <div className="flex flex-col items-center">
                  <span className="text-foreground text-xs font-black">
                    {role.label || role.name}
                  </span>
                  <span className="text-5xs text-muted-foreground/80 font-bold font-mono uppercase mt-0.5">
                    {role.name}
                  </span>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
            <React.Fragment key={moduleName}>
              {/* Module Header Row */}
              <TableRow className="border-b border-border/80 bg-muted/20 hover:bg-muted/20">
                <TableCell
                  colSpan={roles.length + 1}
                  className="py-2.5 px-4 text-4xs font-black text-primary uppercase tracking-widest"
                >
                  📁 Modul {moduleName}
                </TableCell>
              </TableRow>

              {/* Permission Item Rows */}
              {perms.map((perm) => (
                <TableRow
                  key={perm.id}
                  className="border-b border-border/60 hover:bg-muted/10 transition-colors"
                >
                  <TableCell className="py-3 px-6">
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-bold text-foreground">
                        {perm.label || perm.name}
                      </span>
                      <span className="text-5xs font-mono text-muted-foreground mt-0.5">
                        {perm.name}
                      </span>
                    </div>
                  </TableCell>
                  {roles.map((role) => {
                    const isChecked = getRolePermissionIds(role).includes(
                      perm.id,
                    );
                    const isSuperadmin = role.name === "superadmin";

                    return (
                      <TableCell key={role.id} className="py-3 text-center">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={isChecked || isSuperadmin}
                            disabled={
                              isSuperadmin ||
                              (updating && activeRoleId === role.id)
                            }
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(role, perm.id, !!checked)
                            }
                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary disabled:opacity-50"
                          />
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
