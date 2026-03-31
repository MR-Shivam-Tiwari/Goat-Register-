'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, LogIn, UserPlus, LogOut, ChevronRight } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export default function MobileMenu({ 
  navLinks, 
  user, 
  t, 
  lang,
  logoutAction
}: { 
  navLinks: any[], 
  user: any, 
  t: any, 
  lang: string,
  logoutAction: any
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2.5 text-gray-700 hover:bg-gray-50 rounded-xl transition-all border border-gray-100"
        aria-label="Open Menu"
      >
        <Menu size={24} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-[300px] bg-white z-[101] shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/30">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] leading-none mb-1">Navigation</span>
               <span className="font-outfit font-black text-primary tracking-tighter text-xl italic uppercase">Menu</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-400 hover:text-primary transition-colors rounded-xl border border-gray-100 bg-white shadow-sm"
            >
              <X size={20} />
            </button>
          </div>

          {/* Links */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-4 space-y-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between group px-4 py-4 rounded-xl hover:bg-primary/5 transition-all"
                >
                  <span className="text-sm font-bold text-gray-700 group-hover:text-primary uppercase tracking-wide">
                    {link.label}
                  </span>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-primary translate-x-[-4px] group-hover:translate-x-0 transition-all" />
                </Link>
              ))}
            </nav>

            <div className="mt-8 px-8 flex flex-col gap-4">
               <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Language</span>
               <LanguageSwitcher currentLang={lang as any} />
            </div>
          </div>

          {/* Footer / Auth */}
          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            {user ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 px-2">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-secondary flex items-center justify-center font-black text-lg shadow-lg relative">
                    {user.login[0].toUpperCase()}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-0.5 whitespace-nowrap">{t.nav.authenticated}</span>
                    <span className="font-black text-gray-900 tracking-tight truncate text-base">{user.login}</span>
                  </div>
                </div>
                
                <Link 
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="mt-2 w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                >
                  {t.nav.memberPortal}
                </Link>

                <form action={logoutAction}>
                  <button 
                    type="submit"
                    className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-600 border border-red-100 px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95 shadow-sm"
                  >
                    <LogOut size={14} />
                    {t.nav.logout}
                  </button>
                </form>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                <Link 
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-gray-700 font-black text-[10px] uppercase tracking-widest border-2 border-gray-100 hover:bg-white transition-all shadow-sm"
                >
                  <LogIn size={14} />
                  {t.nav.signIn}
                </Link>
                <Link 
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-primary text-secondary font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-primary-light transition-all active:scale-95"
                >
                  <UserPlus size={14} />
                  {t.nav.join}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
