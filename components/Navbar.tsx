import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import { getTranslation, Locale } from '@/lib/translations';
import { getSessionUser } from '@/lib/access-control';

async function logoutAction() {
  'use server';
  const cookieStore = await cookies();
  cookieStore.delete('uid_token');
  cookieStore.delete('user_login');
  redirect('/login');
}

export default async function Navbar() {
  const user = await getSessionUser();
  const cookieStore = await cookies();
  const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
  const t = getTranslation(lang);

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/farms', label: t.nav.farms },
    { href: '/catalog/goats', label: t.nav.catalog },
    { href: '/rules', label: t.nav.rules }
  ];

  // Admin and Auth specific links
  if (user) {
    navLinks.splice(3, 0, { href: '/catalog/goats/add', label: t.nav.addGoat });
    if (user.role === 'admin') {
      navLinks.splice(4, 0, { href: '/users', label: t.nav.users });
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 py-4 px-6 lg:px-12 flex items-center justify-between shadow-sm font-sans">
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-8 text-[11px] font-bold tracking-wider">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className="text-gray-600 hover:text-blue-600 transition-all uppercase relative group py-2"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-8">
        <LanguageSwitcher currentLang={lang} />
        <div className="h-4 w-px bg-gray-200"></div>

        {user ? (
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
              <span className="text-[9px] uppercase text-gray-400 font-bold tracking-widest leading-none mb-1">{t.nav.authenticated}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 tracking-tight">{user.login}</span>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              </div>
            </div>
            <form action={logoutAction}>
              <button 
                type="submit" 
                className="bg-gray-50 text-gray-700 px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-95"
              >
                {t.nav.logout}
              </button>
            </form>
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
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-[10px] uppercase tracking-widest shadow-md hover:bg-blue-700 transition-all active:scale-95 text-center"
            >
              {t.nav.join}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
