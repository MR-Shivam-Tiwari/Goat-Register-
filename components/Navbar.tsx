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

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/goats', label: t.nav.registry },
    { href: '/farms', label: t.nav.farms },
    { href: '/catalog/goats', label: t.nav.catalog },
    { href: '/rules', label: t.nav.rules },
    { href: 'https://kozovodstvo.center/', label: t.nav.forum }
  ];

  // Admin and Auth specific links
  if (user) {
    navLinks.splice(3, 0, { href: '/catalog/goats/add', label: t.nav.addGoat });
    if (user.role === 10) {
      navLinks.splice(4, 0, { href: '/users', label: t.nav.users });
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 py-2 px-6 lg:px-12 flex items-center justify-between shadow-sm font-sans min-h-[64px]">
      {/* Desktop Navigation Links */}
      <div className="hidden lg:flex items-center gap-10">
        <div className="flex items-center gap-6 text-[10px] font-bold tracking-wider">
          {navLinks.map((link) => {
            const isExternal = link.href.startsWith('http');
            return (
              <Link 
                key={link.href}
                href={link.href} 
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="text-gray-600 hover:text-[#491907] transition-all uppercase relative group py-2"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#491907] transition-all group-hover:w-full"></span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Brand name for mobile only */}
      <div className="lg:hidden flex items-center gap-3">
         <span className="text-[10px] font-black text-primary italic uppercase tracking-tighter opacity-70">ABG</span>
         <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
         <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em]">{t.nav.breedRegister}</span>
      </div>

      {/* Right Side: Lang/Auth Desktop and Mobile Toggle */}
      <div className="flex items-center gap-8">
        <div className="hidden lg:flex items-center gap-8">
          {user ? (
            <div className="flex items-center gap-8">
                <div className="flex flex-col items-end">
                <span className="text-[9px] uppercase text-gray-400 font-bold tracking-widest leading-none mb-1">{t.nav.authenticated}</span>
                <div className="flex items-center gap-2 group/user cursor-pointer">
                    <Link href="/profile" className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900 tracking-tight group-hover/user:text-[#491907] transition-colors">{user.login}</span>
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] group-hover/user:scale-125 transition-transform" />
                    </Link>
                </div>
                </div>
                <LogoutButton t={t} action={logoutAction} />
            </div>
            ) : (
            <div className="flex items-center gap-4">
                <Link 
                href="/login" 
                className="px-6 py-2 rounded-xl text-gray-700 font-bold text-[10px] uppercase tracking-widest border-2 border-gray-100 hover:bg-gray-50 transition-all"
                >
                {t.nav.signIn}
                </Link>
                <Link 
                href="/register" 
                className="px-6 py-2.5 rounded-xl bg-[#491907] text-white font-bold text-[10px] uppercase tracking-widest shadow-md hover:bg-[#6D260D] transition-all active:scale-95 text-center"
                >
                {t.nav.join}
                </Link>
            </div>
            )}
        </div>

        {/* Mobile Toggle Button */}
        <MobileMenu navLinks={navLinks} user={user} t={t} lang={lang} logoutAction={logoutAction} />
      </div>
    </nav>
  );
}


