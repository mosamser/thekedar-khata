'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HardHat, Building2, Users, PlusCircle, LayoutDashboard, Plus, FileSpreadsheet } from 'lucide-react';

interface NavbarProps {
  onOpenNewSite?: () => void;
}

export function Navbar({ onOpenNewSite }: NavbarProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'डैशबोर्ड', icon: LayoutDashboard },
    { href: '/sites', label: 'साइट्स', icon: Building2 },
    { href: '/workers', label: 'मजदूर', icon: Users },
    { href: '/hisab', label: 'कुल हिसाब', icon: FileSpreadsheet },
  ];

  return (
    <>
      {/* 1. TOP HEADER (CLEAN, FROSTED WHITE & MODERN) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group active:scale-95 transition-transform">
              <div className="bg-amber-500 text-slate-950 p-1.5 sm:p-2 rounded-xl font-bold shadow-2xs">
                <HardHat className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-1">
                  ठेकेदार <span className="text-amber-600">डायरी</span>
                </span>
                <span className="block text-[9px] sm:text-[10px] text-slate-400 font-bold -mt-1 tracking-wider uppercase">
                  Thekedar Khata
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-amber-50 text-amber-950 border border-amber-300 shadow-2xs font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Top Right Action Button */}
            {onOpenNewSite && (
              <button
                onClick={onOpenNewSite}
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-black px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">+ नई साइट जोड़ें</span>
                <span className="sm:hidden">+ नई साइट</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. NATIVE APP BOTTOM DOCK (5 MENUS WITH PURE WHITE FROSTED BACKGROUND & CENTER ELEVATED '+' BUTTON) */}
      <nav
        aria-label="Mobile Navigation"
        className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-slate-200/90 text-slate-600 h-[64px] pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
      >
        <div className="grid grid-cols-5 h-full items-center px-1">
          {/* 1. Home / Dashboard */}
          <Link
            href="/"
            className="relative flex flex-col items-center justify-center py-1 group active:scale-90 transition-transform"
          >
            {pathname === '/' && (
              <span className="absolute -top-1 w-6 h-0.75 bg-amber-500 rounded-b-full shadow-[0_1px_6px_rgba(245,158,11,0.6)]" />
            )}
            <div
              className={`flex items-center justify-center w-11 h-7 rounded-full transition-all duration-150 ${
                pathname === '/'
                  ? 'bg-amber-100 text-amber-900 shadow-2xs'
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}
            >
              <LayoutDashboard className={`w-5 h-5 ${pathname === '/' ? 'stroke-[2.5] text-amber-800' : 'stroke-[1.8]'}`} />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight transition-colors ${
                pathname === '/' ? 'font-black text-amber-950' : 'font-semibold text-slate-500 group-hover:text-slate-700'
              }`}
            >
              होम
            </span>
          </Link>

          {/* 2. Sites */}
          <Link
            href="/sites"
            className="relative flex flex-col items-center justify-center py-1 group active:scale-90 transition-transform"
          >
            {pathname.startsWith('/sites') && (
              <span className="absolute -top-1 w-6 h-0.75 bg-amber-500 rounded-b-full shadow-[0_1px_6px_rgba(245,158,11,0.6)]" />
            )}
            <div
              className={`flex items-center justify-center w-11 h-7 rounded-full transition-all duration-150 ${
                pathname.startsWith('/sites')
                  ? 'bg-amber-100 text-amber-900 shadow-2xs'
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}
            >
              <Building2 className={`w-5 h-5 ${pathname.startsWith('/sites') ? 'stroke-[2.5] text-amber-800' : 'stroke-[1.8]'}`} />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight transition-colors ${
                pathname.startsWith('/sites') ? 'font-black text-amber-950' : 'font-semibold text-slate-500 group-hover:text-slate-700'
              }`}
            >
              साइट्स
            </span>
          </Link>

          {/* 3. CENTER ELEVATED '+' BUTTON (ADD SITE) */}
          <div className="relative flex flex-col items-center justify-center -translate-y-3.5">
            <span className="absolute w-12 h-12 rounded-full bg-amber-500/20 blur-md -top-0.5 pointer-events-none" />
            <button
              onClick={onOpenNewSite}
              className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 text-slate-950 font-black flex items-center justify-center shadow-[0_6px_18px_rgba(245,158,11,0.45)] ring-[3.5px] ring-white active:scale-90 hover:scale-105 transition-all duration-150"
              aria-label="नई साइट जोड़ें"
            >
              <Plus className="w-6 h-6 stroke-[3.5] text-slate-950" />
            </button>
            <span className="text-[9.5px] font-black text-amber-950 tracking-tight mt-1">
              नई साइट
            </span>
          </div>

          {/* 4. Workers */}
          <Link
            href="/workers"
            className="relative flex flex-col items-center justify-center py-1 group active:scale-90 transition-transform"
          >
            {pathname.startsWith('/workers') && (
              <span className="absolute -top-1 w-6 h-0.75 bg-amber-500 rounded-b-full shadow-[0_1px_6px_rgba(245,158,11,0.6)]" />
            )}
            <div
              className={`flex items-center justify-center w-11 h-7 rounded-full transition-all duration-150 ${
                pathname.startsWith('/workers')
                  ? 'bg-amber-100 text-amber-900 shadow-2xs'
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}
            >
              <Users className={`w-5 h-5 ${pathname.startsWith('/workers') ? 'stroke-[2.5] text-amber-800' : 'stroke-[1.8]'}`} />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight transition-colors ${
                pathname.startsWith('/workers') ? 'font-black text-amber-950' : 'font-semibold text-slate-500 group-hover:text-slate-700'
              }`}
            >
              मजदूर
            </span>
          </Link>

          {/* 5. Master Hisab */}
          <Link
            href="/hisab"
            className="relative flex flex-col items-center justify-center py-1 group active:scale-90 transition-transform"
          >
            {pathname.startsWith('/hisab') && (
              <span className="absolute -top-1 w-6 h-0.75 bg-amber-500 rounded-b-full shadow-[0_1px_6px_rgba(245,158,11,0.6)]" />
            )}
            <div
              className={`flex items-center justify-center w-11 h-7 rounded-full transition-all duration-150 ${
                pathname.startsWith('/hisab')
                  ? 'bg-amber-100 text-amber-900 shadow-2xs'
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}
            >
              <FileSpreadsheet className={`w-5 h-5 ${pathname.startsWith('/hisab') ? 'stroke-[2.5] text-amber-800' : 'stroke-[1.8]'}`} />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight transition-colors ${
                pathname.startsWith('/hisab') ? 'font-black text-amber-950' : 'font-semibold text-slate-500 group-hover:text-slate-700'
              }`}
            >
              हिसाब
            </span>
          </Link>
        </div>
      </nav>
    </>
  );
}
