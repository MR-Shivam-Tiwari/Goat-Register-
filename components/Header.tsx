import Link from 'next/link';
import { cookies } from 'next/headers';
import { getTranslation, Locale } from '@/lib/translations';
import LanguageSwitcher from './LanguageSwitcher';

export default async function Header({ lang: propLang }: { lang?: Locale }) {
  const cookieStore = await cookies();
  const lang = propLang || (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
  const t = getTranslation(lang);

  return (
    <header className="bg-primary py-3 px-6 lg:px-12 text-white flex items-center justify-between relative z-[60]">
      <div className="flex items-center gap-6 md:gap-10 group">
        <Link href="/" className="transition-all hover:scale-105 duration-500 relative bg-white rounded-xl p-1 shadow-2xl shrink-0">
          <img 
            src="/img/forum_kozovodstvo.jpg" 
            alt="Logo" 
            className="w-[60px] md:w-[90px] h-auto object-contain rounded-lg"
          />
        </Link>
        <div className="hidden sm:block">
          <h2 className="text-sm md:text-md font-black text-secondary uppercase tracking-[0.1em] leading-tight">
            {t.home.subtitle}
          </h2>
          <h1 className="text-[10px] md:text-[12px] font-black text-white/40 tracking-widest uppercase m-0 mt-1 italic">{t.nav.breedRegister}</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-10">
          <div className="hidden lg:flex flex-col border-r border-white/10 pr-8 text-right shrink-0">
              <span className="text-[9px] opacity-40 uppercase tracking-[0.4em] font-black mb-1 leading-none italic">{t.nav.contact}</span>
              <span className="text-sm md:text-sm font-black text-secondary tracking-tighter uppercase whitespace-nowrap">{t.common.phoneNumber}</span>
          </div>

          <div className="flex-shrink-0 scale-90 origin-right">
              <LanguageSwitcher currentLang={lang} />
          </div>
      </div>
    </header>
  );
}

