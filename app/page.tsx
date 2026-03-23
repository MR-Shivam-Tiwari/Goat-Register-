import { cookies } from 'next/headers';
import Image from 'next/image';
import { getTranslation, Locale } from '@/lib/translations';

export const dynamic = 'force-dynamic';


export default async function Home() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
  const t = getTranslation(lang);

  return (
    <main className="bg-gray-50 min-h-screen py-10 px-4 md:px-12 lg:px-24 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column - Images */}
          <div className="hidden lg:flex lg:col-span-2 flex-col gap-6">
            <div className="aspect-[4/3] relative rounded-xl overflow-hidden shadow-md border border-gray-100">
              <Image src="/img/home_milk_nature.png" alt="Milk in Nature" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
            </div>
            <div className="aspect-[4/3] relative rounded-xl overflow-hidden shadow-md border border-gray-100">
              <Image src="/img/home_motherhood_pure.png" alt="Motherhood and Health" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
            </div>
            <div className="aspect-[4/3] relative rounded-xl overflow-hidden shadow-md border border-gray-100">
              <Image src="/img/home_nursing_artistic.png" alt="Pure Life" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
            </div>
          </div>

          {/* Center Column - Text Content */}
          <div className="lg:col-span-8 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#491907] opacity-80"></div>
            
            <header className="mb-10 text-center">
              <h1 className="text-xl md:text-2xl font-bold text-red-600 uppercase leading-snug tracking-tight">
                {t.home.heroHeader}
              </h1>
            </header>

            <div className="space-y-6 text-gray-700 font-medium text-sm md:text-base leading-relaxed text-justify">
              <p>{t.home.p1}</p>
              <p>{t.home.p2}</p>
              <p>{t.home.p3}</p>
              <p>{t.home.p4}</p>
              <p>{t.home.p5}</p>
              <p>{t.home.p6}</p>
              
              <div className="my-8 font-bold border-l-4 border-[#491907] pl-6 italic bg-amber-50/50 py-6 text-gray-900 rounded-r-lg">
                {t.home.quoteHighlight}
              </div>
              
              <p>{t.home.p7}</p>
              
              <p className="font-bold text-gray-900 uppercase tracking-wide border-t border-gray-100 pt-6">
                {t.home.teamHeader}
              </p>
              
              <div className="mt-12 pt-8 border-t border-gray-100 italic text-gray-500">
                <p className="mb-6 font-semibold text-gray-700">{t.home.onceBreederSaid}</p>
                <div className="bg-gray-50 p-8 rounded-2xl space-y-4 border border-gray-100 shadow-inner">
                  <p>{t.home.q1}</p>
                  <p>{t.home.q2}</p>
                  <p>{t.home.q3}</p>
                  <p>{t.home.q4}</p>
                  <p>{t.home.q5}</p>
                  <p>{t.home.q6}</p>
                </div>
              </div>
            </div>

            {/* Mobile Footer Images */}
            <div className="mt-8 text-center lg:hidden flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="aspect-square relative rounded-lg overflow-hidden shadow-sm"><Image src="/img/home_child_lavender.png" alt="m1" fill sizes="33vw" className="object-cover"/></div>
                <div className="aspect-square relative rounded-lg overflow-hidden shadow-sm"><Image src="/img/home_child_goat_meadow.png" alt="m2" fill sizes="33vw" className="object-cover"/></div>
                <div className="aspect-square relative rounded-lg overflow-hidden shadow-sm"><Image src="/img/home_child_feeding_goat.png" alt="m3" fill sizes="33vw" className="object-cover"/></div>
              </div>
            </div>
          </div>

          {/* Right Column - Images */}
          <div className="hidden lg:flex lg:col-span-2 flex-col gap-6">
            <div className="aspect-[4/3] relative rounded-xl overflow-hidden shadow-md border border-gray-100">
              <Image src="/img/home_child_lavender.png" alt="Lavender Field" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
            </div>
            <div className="aspect-[4/3] relative rounded-xl overflow-hidden shadow-md border border-gray-100">
              <Image src="/img/home_child_goat_meadow.png" alt="Goat Meadow" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
            </div>
            <div className="aspect-[4/3] relative rounded-xl overflow-hidden shadow-md border border-gray-100">
              <Image src="/img/home_child_feeding_goat.png" alt="Feeding Goat" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
            </div>
          </div>

        </div>
      </div>

      <footer className="mt-16 text-center border-t border-gray-200 pt-10 pb-16 bg-white/50">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3">
            {t.home.footerConsent}
          </p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">
            {t.home.footerCopyright}
          </p>
      </footer>
    </main>
  );
}
