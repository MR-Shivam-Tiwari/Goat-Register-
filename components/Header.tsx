import Link from 'next/link';
import { cookies } from 'next/headers';
import { getTranslation, Locale } from '@/lib/translations';
import LanguageSwitcher from './LanguageSwitcher';

export default async function Header({ lang: propLang }: { lang?: Locale }) {
  const cookieStore = await cookies();
  const lang = propLang || (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
  const t = getTranslation(lang);

  return (
    <header className="bg-primary/95 backdrop-blur-md py-3 md:py-4 px-4 lg:px-12 text-white border-b border-white/5 min-h-[80px] md:min-h-[110px] relative z-[60] w-full">
      <div className="flex items-center justify-between gap-2 md:gap-4 h-full w-full">
        {/* Left side Logo */}
        <div className="flex-none w-1/4 sm:w-auto flex items-center">
            <div className="transition-transform hover:scale-105 duration-300">
            <img 
                src="/img/forum_kozovodstvo.jpg" 
                alt="Association Logo" 
                className="h-[45px] sm:h-[80px] md:h-[130px] w-auto object-contain brightness-110 drop-shadow-xl rounded-sm"
            />
            </div>
        </div>

        {/* Center Brand Title */}
        <div className="flex-1 flex flex-col items-center justify-center text-center min-w-0 px-1">
            <h1 className="text-[10px] xs:text-xs sm:text-xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none drop-shadow-2xl truncate w-full">
                {t.nav.brandTitle.split(' / ')[0]}
            </h1>
            <div className="w-8 xs:w-12 sm:w-[120px] md:w-[200px] h-[1px] md:h-[2px] bg-secondary mx-auto my-1.5 md:my-4 shadow-sm" />
            <h2 className="hidden sm:block text-[9px] md:text-[13px] font-black text-secondary uppercase tracking-[0.35em] drop-shadow-lg whitespace-nowrap">
                {t.nav.brandTitle.split(' / ')[1]}
            </h2>
        </div>

        {/* Right side Actions */}
        <div className="flex-none w-1/4 sm:w-auto flex items-center justify-end gap-2 md:gap-6">
            <a 
                href="/farms" 
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 bg-white/5 hover:bg-white/10 hover:border-secondary/30 border border-white/10 px-5 py-2.5 rounded shadow-sm transition-all group overflow-hidden relative"
            >
                <div className="absolute inset-0 bg-secondary/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                <div className="relative flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#FDFDFD]">{t.nav.farms}</span>
                    <svg className="w-3 h-3 text-secondary transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </div>
            </a>

            <div className="flex-shrink-0 scale-[0.65] xs:scale-[0.8] sm:scale-100 origin-right">
                <LanguageSwitcher currentLang={lang} />
            </div>
        </div>
      </div>
    </header>
  );
}
