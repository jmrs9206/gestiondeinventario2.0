"use client";

import React, { useState } from 'react';
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
  User as UserIcon
} from 'lucide-react';

interface NavigationProps {
  children: React.ReactNode;
}

export default function Navigation({ children }: NavigationProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

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
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100 font-sans">
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-slate-900/60 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-500" />
          <span className="font-extrabold text-white tracking-tight">VDEnergy</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Sidebar - Desktop & Mobile overlay */}
      <aside
        className={`${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed inset-y-0 left-0 w-64 bg-slate-900/40 backdrop-blur-xl border-r border-slate-800/80 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out z-40 md:sticky md:h-screen`}
      >
        <div className="space-y-8">
          {/* Logo */}
          <div className="hidden md:flex items-center gap-3 px-2">
            <Shield className="h-7 w-7 text-blue-500" />
            <h1 className="text-xl font-black tracking-wider text-white">
              VDEnergy
              <span className="text-slate-500 font-light ml-1 text-sm">INV</span>
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
                      ? 'bg-blue-600/15 text-blue-400 border-l-4 border-blue-500 shadow-lg shadow-blue-500/5'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-850/60'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & Logout */}
        <div className="border-t border-slate-850/80 pt-6 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 shadow-md">
              <UserIcon className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user?.email}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {user?.role === 'ADMIN' ? 'Administrador' : 'Técnico'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-rose-950/20 hover:border-rose-900/50 hover:text-rose-400 text-slate-300 text-xs font-bold transition duration-200"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
