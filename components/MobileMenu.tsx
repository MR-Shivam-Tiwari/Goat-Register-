'use client';

import { useState } from 'react';
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
        className="p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
        aria-label="Open Menu"
      >
        <Menu size={28} strokeWidth={2.5} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-white z-[101] shadow-2xl transform transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-end p-5">
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-400 hover:text-primary transition-colors"
            >
              <X size={28} strokeWidth={1.5} />
            </button>
          </div>

          {/* Links */}
          <div className="flex-1 overflow-y-auto px-6">
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <a 
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between py-4 border-b border-gray-50 group"
                >
                  <span className="text-base font-black text-[#491907] group-hover:text-primary uppercase tracking-wide transition-colors">
                    {link.label}
                  </span>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-all" />
                </a>
              ))}
            </nav>
          </div>

          {/* Footer / Auth */}
          <div className="p-6 space-y-6 bg-gray-50/30">
            {user ? (
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#491907] text-white flex items-center justify-center font-black text-2xl shadow-xl relative">
                    {user.login[0].toUpperCase()}
                    <div className="absolute bottom-0.5 right-0.5 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-0.5">LOGGED IN AS</span>
                    <span className="font-black text-[#491907] tracking-tight text-xl uppercase leading-none">{user.login}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                    <a 
                    href="/profile"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center bg-white text-[#491907] border border-gray-200 px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm active:scale-95 transition-all"
                    >
                    {t.nav.memberPortal}
                    </a>

                    <form action={logoutAction}>
                    <button 
                        type="submit"
                        className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-600 px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                    >
                        <LogOut size={14} strokeWidth={2.5} />
                        {t.nav.logout}
                    </button>
                    </form>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                <a 
                  href="/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl text-[#491907] font-black text-[10px] uppercase tracking-widest border-2 border-gray-100 hover:bg-white transition-all shadow-sm"
                >
                  <LogIn size={14} strokeWidth={2.5} />
                  {t.nav.signIn}
                </a>
                <a 
                  href="/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-[#491907] text-white font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                >
                  <UserPlus size={14} strokeWidth={2.5} />
                  {t.nav.join}
                </a>
              </div>
            )}
            
            <div className="pt-2 flex justify-center">
                <LanguageSwitcher currentLang={lang as any} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
