import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import MobileMenu from './MobileMenu';
import LogoutButton from './LogoutButton';
import { getTranslation, Locale } from '@/lib/translations';
import { getSessionUser } from '@/lib/access-control';

async function logoutAction() {
  'use server';
  const cookieStore = await cookies();
  cookieStore.delete('uid_token');
  cookieStore.delete('user_login');
  redirect('/login');
}

export default async function Navbar({ lang: propLang }: { lang?: Locale }) {
  const user = await getSessionUser();
  const cookieStore = await cookies();
  const lang = propLang || (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
  const t = getTranslation(lang);

  const mainLinks = [
    { href: '/', label: t.nav.home },
    { href: '/catalog/goats', label: t.nav.catalog },
    { href: '/farms', label: t.nav.farms },
    { href: '/catalog/move', label: t.nav.movement },
    // { href: '/goats', label: t.nav.registry },
    { href: 'https://kozovodstvo.center/', label: t.nav.forum }
  ];

  // All links for Mobile Menu (Excluding admin only links handled by icons below)
  const allMobileLinks = [...mainLinks];
  if (user && Number(user.role) >= 1) {
    allMobileLinks.push({ href: '/catalog/goats/add', label: t.nav.addGoat });
    if (Number(user.role) >= 10) {
        allMobileLinks.push({ href: '/users', label: t.nav.users });
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 py-3 px-6 lg:px-12 flex items-center justify-between shadow-sm font-sans min-h-[72px]">
      {/* LEFT: Desktop Public Navigation Links */}
      <div className="hidden lg:flex items-center gap-10">
        <div className="flex items-center gap-8 text-[11px] font-black tracking-[0.15em]">
          {mainLinks.map((link) => {
            if (link.href.startsWith('http')) {
              return (
                <a 
                  key={link.href}
                  href={link.href} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary transition-all uppercase relative group py-2"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </a>
              );
            }
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className="text-gray-500 hover:text-primary transition-all uppercase relative group py-2"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* MOBILE BRAND (Hidden on Desktop) */}
      <div className="lg:hidden flex items-center gap-3">
         <span className="text-[10px] font-black text-primary italic uppercase tracking-tighter opacity-70">ABG</span>
         <div className="w-1 h-1 rounded-full bg-secondary" />
         <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em]">REGISTER</span>
      </div>

      {/* RIGHT: Admin Tools and Auth Controls */}
      <div className="flex items-center gap-5 md:gap-10">
        
        {/* Desktop Admin/Auth Controls */}
        <div className="hidden lg:flex items-center gap-8">
          
          {user && Number(user.role) >= 1 && (
            <div className="flex items-center gap-4 border-r border-gray-100 pr-8 mr-2">
                {/* Admin Quick Icons (As requested by client) */}
                {Number(user.role) >= 10 && (
                  <a href="/users" target="_blank" rel="noopener noreferrer" title={t.nav.users} className="w-10 h-10 bg-[#491907] rounded-xl flex items-center justify-center text-white shadow-lg transform hover:scale-110 active:scale-95 transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </a>
                )}
                
                <a href="/catalog/goats/add" target="_blank" rel="noopener noreferrer" title={t.nav.addGoat} className="w-10 h-10 bg-[#491907] rounded-xl flex items-center justify-center text-white shadow-lg transform hover:scale-110 active:scale-95 transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                </a>

                <a href="/goats" target="_blank" rel="noopener noreferrer" title={t.nav.registry} className="w-10 h-10 bg-[#491907] rounded-xl flex items-center justify-center text-white shadow-xl transform hover:scale-110 active:scale-95 transition-all">
                    <span className="text-xl font-black italic">L</span>
                </a>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-8">
                <div className="flex flex-col items-end">
                    <span className="text-[9px] uppercase text-gray-400 font-bold tracking-widest leading-none mb-1.5">{t.nav.authenticated}</span>
                    <a href="/profile" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group/user cursor-pointer">
                        <span className="text-sm font-black text-gray-900 tracking-tight group-hover/user:text-primary transition-colors uppercase">{user.login}</span>
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.6)] group-hover/user:scale-125 transition-transform" />
                    </a>
                </div>
                <LogoutButton t={t} action={logoutAction} />
            </div>
            ) : (
            <div className="flex items-center gap-4">
                <Link 
                  href="/login" 
                  className="w-10 h-10 border-2 border-gray-100 text-gray-400 hover:text-[#B5E6FF] hover:bg-gray-50 transition-all flex items-center justify-center rounded-xl group"
                  title={t.nav.signIn}
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </Link>
                <a 
                  href="/register" 
                  target="_blank" rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-primary/90 transition-all active:scale-95 text-center"
                >
                {t.nav.join}
                </a>
            </div>
            )}
        </div>

        {/* Mobile Toggle Button */}
        <MobileMenu navLinks={allMobileLinks} user={user} t={t} lang={lang} logoutAction={logoutAction} />
      </div>
    </nav>
  );
}
