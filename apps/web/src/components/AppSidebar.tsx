"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { usePermissions } from "@/features/authentication/hooks/usePermissions";
import { useQuery, gql } from "@apollo/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import * as LucideIcons from "lucide-react";
import { toast } from "sonner";

// GraphQL Query to fetch active menu tree
const GET_ACTIVE_MENU_TREE = gql`
  query GetActiveMenuTree {
    activeMenuTree {
      id
      name
      route
      icon
      parentId
      orderNo
      isActive
      slug
      subMenus {
        id
        name
        route
        icon
        parentId
        orderNo
        isActive
        slug
      }
    }
  }
`;

interface MenuItem {
  id: number;
  name: string;
  route?: string;
  icon?: string;
  parentId?: number;
  orderNo: number;
  isActive: boolean;
  slug: string;
  subMenus?: MenuItem[];
}

// Icon mapper helper
function MenuIcon({ name, className }: { name?: string | null | undefined; className?: string }) {
  if (!name) return <LucideIcons.Menu className={className} />;
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return <LucideIcons.Menu className={className} />;
  return <IconComponent className={className} />;
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();
  const { hasPermission } = usePermissions();

  // Fetch dynamic menu tree from backend
  const { data: menuData, loading: menuLoading } = useQuery<{ activeMenuTree: MenuItem[] }>(
    GET_ACTIVE_MENU_TREE,
    {
      fetchPolicy: "cache-and-network",
      skip: sessionPending || !session,
    }
  );

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Berhasil keluar dari akun.");
      router.push("/auth/login");
    } catch (err) {
      toast.error("Gagal keluar dari sesi.");
    }
  };

  const activeMenus = menuData?.activeMenuTree || [];

  // Filter menu list based on role-permission access control
  const getVisibleMenus = () => {
    return activeMenus.filter((group) => {
      // 1. Standalone root menu (has route, no submenus)
      if (group.route && (!group.subMenus || group.subMenus.length === 0)) {
        return hasPermission(`${group.slug}.index`);
      }

      // 2. Group menu (no route, has submenus)
      if (!group.route && group.subMenus && group.subMenus.length > 0) {
        // Only show group if user has permission to at least one submenu
        const hasVisibleSub = group.subMenus.some((sub) =>
          hasPermission(`${sub.slug}.index`)
        );
        return hasVisibleSub;
      }

      return false;
    });
  };

  const visibleMenus = getVisibleMenus();

  // Default fallback items with Collapsible layout if database menu is empty or loading
  const renderFallbackMenus = () => {
    const showAdminMenu = hasPermission("user.manage") || hasPermission("menu.manage");

    return (
      <>
        {/* Utama (Standalone) */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-5xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"}>
                  <Link
                    href="/"
                    className="flex items-center gap-3 px-2 py-1.5 rounded-lg transition-all"
                  >
                    <LucideIcons.LayoutDashboard className="w-4 h-4" />
                    <span className="text-2xs font-bold">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Administrasi & RBAC (Collapsible Dropdown) */}
        {showAdminMenu && (
          <SidebarGroup className="pt-0">
            <SidebarGroupContent>
              <SidebarMenu>
                <Collapsible
                  defaultOpen={pathname.startsWith("/admin/")}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="w-full flex items-center justify-between transition-all">
                        <div className="flex items-center gap-3">
                          <LucideIcons.Settings className="w-4 h-4 text-primary" />
                          <span className="text-2xs font-bold text-sidebar-foreground">Pengaturan Sistem</span>
                        </div>
                        <LucideIcons.ChevronRight className="ml-auto w-3.5 h-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {hasPermission("user.manage") && (
                          <>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild isActive={pathname === "/admin/users"}>
                                <Link href="/admin/users" className="text-2xs">
                                  Kelola Anggota
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild isActive={pathname === "/admin/grup"}>
                                <Link href="/admin/grup" className="text-2xs">
                                  Grup Pengguna
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild isActive={pathname === "/admin/fitur"}>
                                <Link href="/admin/fitur" className="text-2xs">
                                  Fitur Sistem
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild isActive={pathname === "/admin/roles"}>
                                <Link href="/admin/roles" className="text-2xs">
                                  Matriks Hak Akses
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          </>
                        )}
                        {hasPermission("menu.manage") && (
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild isActive={pathname === "/admin/menu"}>
                              <Link href="/admin/menu" className="text-2xs text-indigo-600 font-bold">
                                Kelola Menu
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </>
    );
  };

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Header Logo */}
      <SidebarHeader className="p-4 border-b border-sidebar-border bg-sidebar flex flex-row items-center gap-3">
        <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-xl">
          <LucideIcons.Trophy className="w-4 h-4 text-primary" />
        </div>
        <div className="flex flex-col text-left">
          <span className="font-extrabold text-xs tracking-tight text-sidebar-foreground uppercase">
            SSB Garuda
          </span>
          <span className="text-5xs text-muted-foreground font-bold uppercase tracking-wider">
            Management Platform
          </span>
        </div>
      </SidebarHeader>

      {/* Content Menus */}
      <SidebarContent className="p-3 space-y-3 bg-sidebar">
        {menuLoading ? (
          <div className="flex flex-col gap-4 p-4">
            <div className="h-4 bg-muted/40 animate-pulse rounded-md w-2/3" />
            <div className="h-8 bg-muted/30 animate-pulse rounded-md" />
            <div className="h-8 bg-muted/30 animate-pulse rounded-md" />
          </div>
        ) : visibleMenus.length > 0 ? (
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 text-5xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
              Platform
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {visibleMenus.map((group) => {
                  // If it's a category/group menu (no route, has submenus)
                  if (!group.route && group.subMenus && group.subMenus.length > 0) {
                    const visibleSubMenus = group.subMenus.filter((sub) =>
                      hasPermission(`${sub.slug}.index`)
                    );
                    const isAnySubActive = visibleSubMenus.some((sub) => pathname === sub.route);

                    return (
                      <Collapsible
                        key={group.id}
                        defaultOpen={isAnySubActive}
                        className="group/collapsible"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton className="w-full flex items-center justify-between transition-all">
                              <div className="flex items-center gap-3">
                                <MenuIcon name={group.icon || undefined} className="w-4 h-4 text-primary" />
                                <span className="text-2xs font-bold text-sidebar-foreground">{group.name}</span>
                              </div>
                              <LucideIcons.ChevronRight className="ml-auto w-3.5 h-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {visibleSubMenus.map((sub) => (
                                <SidebarMenuSubItem key={sub.id}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={pathname === sub.route}
                                  >
                                    <Link href={sub.route || "#"} className="text-2xs">
                                      {sub.name}
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  }

                  // Render Standalone Root Link
                  return (
                    <SidebarMenuItem key={group.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === group.route}
                      >
                        <Link
                          href={group.route || "#"}
                          className="flex items-center gap-3 px-2 py-1.5 rounded-lg transition-all"
                        >
                          <MenuIcon name={group.icon || undefined} className="w-4 h-4" />
                          <span className="text-2xs font-bold">{group.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          renderFallbackMenus()
        )}
      </SidebarContent>

      {/* Footer Profil User */}
      <SidebarFooter className="p-4 border-t border-sidebar-border bg-sidebar mt-auto">
        {sessionPending ? (
          <div className="flex items-center justify-center py-2">
            <LucideIcons.Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                {session?.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-black text-primary uppercase">
                    {session?.user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-2xs font-bold text-sidebar-foreground truncate max-w-[125px]">
                  {session?.user.name}
                </span>
                <span className="text-5xs text-muted-foreground truncate max-w-[125px] font-medium">
                  {session?.user.email}
                </span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive/20 hover:border-destructive/40 text-destructive text-2xs font-extrabold rounded-lg transition-all cursor-pointer"
            >
              <LucideIcons.LogOut className="w-3.5 h-3.5" />
              <span>Keluar Akun</span>
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
