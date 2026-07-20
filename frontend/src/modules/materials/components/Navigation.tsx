"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useBranding } from '@/modules/branding/hooks/useBranding';
import { getBrandingIcon } from '@/modules/branding/components/SettingsForm';
import {
  LayoutDashboard,
  Package,
  Building2,
  Users,
  History,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Shield
} from 'lucide-react';

interface NavigationProps {
  children: React.ReactNode;
}

export default function Navigation({ children }: NavigationProps) {
  const { user, logout } = useAuth();
  const { branding } = useBranding();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Sync sidebar collapse state on mount
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    const nextVal = !isCollapsed;
    setIsCollapsed(nextVal);
    localStorage.setItem('sidebar-collapsed', String(nextVal));
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5 shrink-0" />,
      requiredPermission: 'READ_DASHBOARD',
    },
    {
      name: 'Materiales',
      href: '/materials',
      icon: <Package className="h-5 w-5 shrink-0" />,
    },
    {
      name: 'Oficinas',
      href: '/offices',
      icon: <Building2 className="h-5 w-5 shrink-0" />,
    },
    {
      name: 'Usuarios',
      href: '/users',
      icon: <Users className="h-5 w-5 shrink-0" />,
      requiredPermission: 'READ_USER',
    },
    {
      name: 'Roles y Permisos',
      href: '/settings',
      icon: <Shield className="h-5 w-5 shrink-0" />,
      requiredPermission: 'MANAGE_ROLES',
    },
    {
      name: 'Auditoría',
      href: '/audit',
      icon: <History className="h-5 w-5 shrink-0" />,
      requiredPermission: 'READ_AUDIT_LOG',
    },
  ];

  const filteredItems = navItems.filter(
    (item) => !item.requiredPermission || (user && user.permissions && user.permissions.includes(item.requiredPermission))
  );

  const getColorClass = () => {
    return 'text-zinc-500 dark:text-zinc-400';
  };

  const brandLogoUrl = branding.logoPngUrl || branding.logoUrl;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground font-sans">
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          {brandLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brandLogoUrl} alt="Logo" className="h-6 w-6 object-contain rounded" />
          ) : (
            getBrandingIcon(branding.themeSettings?.icon || 'shield', `h-6 w-6 ${getColorClass()}`)
          )}
          <span className="font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight text-sm font-display">
            {branding.appName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-100 transition-colors p-1 rounded-lg hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-zinc-900/30 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile overlay */}
      <aside
        className={`${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } md:translate-x-0 fixed inset-y-0 left-0 w-72 max-w-[85vw] ${
          isCollapsed ? 'md:w-24' : 'md:w-72'
        } bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-r border-zinc-200/80 dark:border-zinc-800/80 p-4 flex flex-col transition-[width,transform,box-shadow] duration-300 ease-in-out z-40 md:sticky md:h-screen`}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          {/* Desktop Header */}
          <div className="hidden md:grid h-12 grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-2 overflow-hidden">
            <button
              onClick={toggleSidebar}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200/80 bg-zinc-50 text-zinc-500 shadow-sm transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
              aria-expanded={!isCollapsed}
              title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className={`flex min-w-0 items-center gap-2 transition-all duration-300 ease-in-out ${
              isCollapsed ? 'opacity-0 max-w-0 pointer-events-none' : 'opacity-100 max-w-[190px]'
            }`}>
              {brandLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={brandLogoUrl} alt="Logo" className="h-7 w-7 object-contain rounded shrink-0" />
              ) : (
                getBrandingIcon(branding.themeSettings?.icon || 'shield', `h-7 w-7 shrink-0 ${getColorClass()}`)
              )}
              <span className="truncate font-extrabold text-lg tracking-tight text-zinc-900 dark:text-zinc-50 font-display">
                {branding.appName}
              </span>
            </div>
          </div>

          {/* Mobile Logo */}
          <div className="flex md:hidden items-center gap-2 px-1 h-8 overflow-hidden">
            {brandLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brandLogoUrl} alt="Logo" className="h-6 w-6 object-contain rounded shrink-0" />
            ) : (
              getBrandingIcon(branding.themeSettings?.icon || 'shield', `h-6 w-6 shrink-0 ${getColorClass()}`)
            )}
            <span className="font-extrabold text-sm tracking-tight text-zinc-900 dark:text-zinc-50 whitespace-nowrap overflow-hidden font-display">
              {branding.appName}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="min-h-0 flex-1 space-y-1 rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-2 shadow-sm dark:border-zinc-800/70 dark:bg-zinc-800/35">
            {filteredItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`grid h-12 grid-cols-[2.5rem_minmax(0,1fr)] items-center overflow-hidden rounded-xl border-l-4 pr-2 text-sm font-semibold tracking-wide transition-colors duration-200 ${
                    isActive
                      ? 'border-zinc-500 bg-white text-zinc-900 shadow-sm dark:border-zinc-400 dark:bg-zinc-800/80 dark:text-zinc-100'
                      : 'border-transparent text-zinc-600 hover:bg-white/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <span className="flex h-10 w-10 items-center justify-center">
                    {item.icon}
                  </span>
                  <span className={`transition-all duration-300 ease-in-out ${
                    isCollapsed ? 'md:opacity-0 md:max-w-0 md:pointer-events-none opacity-100 max-w-xs' : 'opacity-100 max-w-xs'
                  } overflow-hidden whitespace-nowrap leading-none`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & Logout */}
        <div className="mt-4 space-y-2 rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-2 shadow-sm transition-all duration-300 dark:border-zinc-800/70 dark:bg-zinc-800/35">
          <div className="grid h-12 grid-cols-[2.5rem_minmax(0,1fr)] items-center overflow-hidden rounded-xl pr-2">
            <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-650 dark:text-zinc-350 shadow-sm shrink-0" title={user?.email}>
              <UserIcon className="h-5 w-5" />
            </div>
            <div className={`transition-all duration-300 ease-in-out ${
              isCollapsed ? 'md:opacity-0 md:max-w-0 md:pointer-events-none opacity-100 max-w-xs' : 'opacity-100 max-w-xs'
            } overflow-hidden whitespace-nowrap`}>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate">{user?.email}</p>
              <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {user?.role === 'ADMIN' ? 'Administrador' : 'Técnico'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="grid h-11 w-full grid-cols-[2.5rem_minmax(0,1fr)] items-center overflow-hidden rounded-xl border border-slate-200 bg-white pr-2 text-left text-xs font-bold text-slate-700 transition duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-rose-950/50 dark:hover:bg-rose-950/20"
            title="Cerrar Sesión"
          >
            <span className="flex h-10 w-10 items-center justify-center">
              <LogOut className="h-4 w-4 shrink-0" />
            </span>
            <span className={`transition-all duration-300 ease-in-out ${
              isCollapsed ? 'md:opacity-0 md:max-w-0 md:pointer-events-none opacity-100 max-w-xs' : 'opacity-100 max-w-xs'
            } overflow-hidden whitespace-nowrap`}>
              Cerrar Sesión
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden bg-background text-foreground">
        {children}
      </main>
    </div>
  );
}
