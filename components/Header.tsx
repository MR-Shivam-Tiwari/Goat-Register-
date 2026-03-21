import Link from 'next/link';
import { cookies } from 'next/headers';
import { getTranslation, Locale } from '@/lib/translations';

export default async function Header() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
  const t = getTranslation(lang);

  return (
    <header className="bg-primary pt-3 pb-2 px-6 lg:px-12 text-white flex items-center justify-between relative z-[60]">
      <div className="flex items-center gap-10 group">
        <Link href="/" className="transition-all hover:scale-105 duration-500 relative bg-white rounded-xl p-1 shadow-2xl shrink-0">
          <img 
            src="/img/forum_kozovodstvo.jpg" 
            alt="Logo" 
            className="w-[90px] h-auto object-contain rounded-lg"
          />
        </Link>
        <div className="hidden sm:block">
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none m-0 uppercase italic opacity-40">Breed Register</h1>
          <h2 className="text-md md:text-lg font-black text-secondary uppercase tracking-[0.02em] mt-2 leading-tight drop-shadow-lg">
            {t.home.subtitle}
          </h2>
        </div>
      </div>
      
      <div className="flex items-center gap-8 text-right">
          <div className="hidden lg:flex flex-col border-l border-white/10 pl-8">
              <span className="text-[9px] opacity-40 uppercase tracking-[0.4em] font-black mb-1 leading-none italic uppercase">CONTACT</span>
              <span className="text-lg font-black text-secondary tracking-tighter uppercase whitespace-nowrap">+7 (000) 000-00-00</span>
          </div>
      </div>
    </header>
  );
}
