"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import {
  LayoutDashboard,
  Package,
  Building2,
  Users,
  History,
  LogOut,
  Menu,
  X,
  Shield,
  User as UserIcon,
  Sun,
  Moon
} from 'lucide-react';

interface NavigationProps {
  children: React.ReactNode;
}

export default function Navigation({ children }: NavigationProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Sync theme on mount
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    setTheme(nextTheme);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      allowedRoles: ['ADMIN'],
    },
    {
      name: 'Materiales',
      href: '/materials',
      icon: <Package className="h-5 w-5" />,
      allowedRoles: ['ADMIN', 'TECNICO'],
    },
    {
      name: 'Oficinas',
      href: '/offices',
      icon: <Building2 className="h-5 w-5" />,
      allowedRoles: ['ADMIN', 'TECNICO'],
    },
    {
      name: 'Usuarios',
      href: '/users',
      icon: <Users className="h-5 w-5" />,
      allowedRoles: ['ADMIN'],
    },
    {
      name: 'Auditoría',
      href: '/audit',
      icon: <History className="h-5 w-5" />,
      allowedRoles: ['ADMIN'],
    },
  ];

  const filteredItems = navItems.filter(
    (item) => !item.allowedRoles || (user && item.allowedRoles.includes(user.role))
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground font-sans">
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <span className="font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight text-sm">Gestión De Inventario</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-700/50 transition-colors"
            title="Cambiar tema"
          >
            {theme === 'light' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-blue-400" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:text-zinc-100 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-700/50"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile overlay */}
      <aside
        className={`${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } md:translate-x-0 fixed inset-y-0 left-0 w-64 bg-white dark:bg-zinc-800 border-r border-slate-200 dark:border-zinc-700/80 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out z-40 md:sticky md:h-screen`}
      >
        <div className="space-y-6">
          {/* Logo */}
          <div className="hidden md:flex items-center gap-2 px-1">
            <Shield className="h-6 w-6 text-blue-600 shrink-0" />
            <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-zinc-50">
              Gestión De Inventario
            </h1>
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
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-l-4 border-blue-600 shadow-sm'
                      : 'text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:text-zinc-50 hover:bg-slate-50 dark:hover:bg-zinc-700/40'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Theme Switcher Button */}
          <div className="px-2 pt-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900/60 text-slate-700 dark:text-zinc-300 text-xs font-bold transition hover:bg-slate-100 dark:hover:bg-zinc-700/40"
            >
              <span className="flex items-center gap-2">
                {theme === 'light' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-blue-400" />}
                Tema: {theme === 'light' ? 'Claro' : 'Oscuro'}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">Cambiar</span>
            </button>
          </div>
        </div>

        {/* User profile & Logout */}
        <div className="border-t border-slate-100 dark:border-zinc-700 pt-6 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
              <UserIcon className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 dark:text-zinc-100 truncate">{user?.email}</p>
              <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                {user?.role === 'ADMIN' ? 'Administrador' : 'Técnico'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:border-rose-200 dark:hover:border-rose-950/50 hover:text-rose-600 text-slate-700 dark:text-zinc-300 text-xs font-bold transition duration-200"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
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
