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
  ChevronLeft,
  ChevronRight,
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
        } md:translate-x-0 fixed inset-y-0 left-0 ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-r border-zinc-200/80 dark:border-zinc-800/80 ${
          isCollapsed ? 'p-4 px-3' : 'p-6'
        } flex flex-col justify-between transition-all duration-300 ease-in-out z-40 md:sticky md:h-screen`}
      >
        {/* Floating absolute toggle button on the right border */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex absolute top-5 -right-3 h-6 w-6 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 hover:scale-105 transition-all duration-200 z-50 cursor-pointer"
          title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>

        <div className="space-y-6">
          {/* Logo */}
          <div className={`hidden md:flex items-center ${isCollapsed ? 'justify-center' : 'justify-start gap-2'} px-1 h-8`}>
            {brandLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brandLogoUrl} alt="Logo" className="h-6 w-6 object-contain rounded shrink-0" />
            ) : (
              getBrandingIcon(branding.themeSettings?.icon || 'shield', `h-6 w-6 shrink-0 ${getColorClass()}`)
            )}
            <span className={`transition-all duration-300 ease-in-out ${
              isCollapsed ? 'opacity-0 max-w-0 pointer-events-none' : 'opacity-100 max-w-[150px]'
            } font-extrabold text-sm tracking-tight text-zinc-900 dark:text-zinc-50 whitespace-nowrap overflow-hidden font-display`}>
              {branding.appName}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {filteredItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 ${
                    isCollapsed ? 'md:justify-center md:px-2 md:gap-0 px-4 py-3' : 'gap-3.5 px-4 py-3'
                  } ${
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 border-l-4 border-zinc-500 dark:border-zinc-400 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  {item.icon}
                  <span className={`transition-all duration-300 ease-in-out ${
                    isCollapsed ? 'md:opacity-0 md:max-w-0 md:pointer-events-none opacity-100 max-w-xs' : 'opacity-100 max-w-xs'
                  } overflow-hidden whitespace-nowrap`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

        </div>

        {/* User profile & Logout */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 space-y-4 transition-all duration-300">
          <div className={`flex items-center ${isCollapsed ? 'md:justify-center md:gap-0 px-0' : 'gap-3 px-2'}`}>
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
            className={`w-full flex items-center justify-center rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:border-rose-200 dark:hover:border-rose-950/50 hover:text-rose-600 text-slate-700 dark:text-zinc-300 text-xs font-bold transition duration-200 ${
              isCollapsed ? 'md:p-2.5 md:gap-0 p-3' : 'gap-2 py-3'
            }`}
            title="Cerrar Sesión"
          >
            <LogOut className="h-4 w-4 shrink-0" />
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
