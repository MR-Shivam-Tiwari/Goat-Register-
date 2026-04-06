import Link from 'next/link';
import { cookies } from 'next/headers';
import { getTranslation, Locale } from '@/lib/translations';
import LanguageSwitcher from './LanguageSwitcher';

export default async function Header({ lang: propLang }: { lang?: Locale }) {
  const cookieStore = await cookies();
  const lang = propLang || (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
  const t = getTranslation(lang);

  return (
    <header className="bg-primary/95 backdrop-blur-md py-4 px-6 lg:px-12 text-white flex items-center justify-between relative z-[60] border-b border-white/5 min-h-[110px]">
      {/* Left side Logo */}
      <div className="flex-1 flex items-center">
        <Link href="/" className="transition-transform hover:scale-105 duration-300 block">
          <img 
            src="/img/forum_kozovodstvo.jpg" 
            alt="Association Logo" 
            className="h-[80px] md:h-[110px] w-auto object-contain brightness-110 drop-shadow-2xl rounded-lg"
          />
        </Link>
      </div>

      {/* Center Brand Title */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full pointer-events-none md:pointer-events-auto max-w-[600px] z-10 pt-2">
            <h1 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none drop-shadow-2xl">
                {t.nav.brandTitle.split(' / ')[0]}
            </h1>
            <div className="w-[120px] md:w-[200px] h-[2px] bg-secondary mx-auto my-3 md:my-4 shadow-sm" />
            <h2 className="text-[9px] md:text-[13px] font-black text-secondary uppercase tracking-[0.35em] drop-shadow-lg whitespace-nowrap">
                {t.nav.brandTitle.split(' / ')[1]}
            </h2>
      </div>

      {/* Right side Actions */}
      <div className="flex-1 flex items-center justify-end gap-3 md:gap-6">
          <Link 
            href="/farms" 
            className="hidden sm:flex items-center gap-2 bg-white/5 hover:bg-white/10 hover:border-secondary/30 border border-white/10 px-5 py-2.5 rounded shadow-sm transition-all group overflow-hidden relative"
          >
             <div className="absolute inset-0 bg-secondary/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
             <div className="relative flex items-center gap-2">
                 <span className="text-[9px] font-black uppercase tracking-widest text-[#FDFDFD]">{t.nav.farms}</span>
                 <svg className="w-3 h-3 text-secondary transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
             </div>
          </Link>

          <div className="flex-shrink-0 scale-90 sm:scale-100 origin-right ml-2">
              <LanguageSwitcher currentLang={lang} />
          </div>
      </div>
    </header>
  );
}

