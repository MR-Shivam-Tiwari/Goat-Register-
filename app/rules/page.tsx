import Breadcrumbs from '@/components/Breadcrumbs';
import { cookies } from 'next/headers';
import { getTranslation, Locale } from '@/lib/translations';

export default async function RulesPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
  const t = getTranslation(lang);

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-16 px-6 lg:px-24 font-sans tracking-tight">
      <div className="max-w-[1400px] mx-auto space-y-12">
        
        {/* Simplified Breadcrumb Header */}
        <Breadcrumbs items={[{ label: t.nav.rules }]} />

        {/* Association Rules Title Section */}
        <header className="border-b border-primary/10 pb-10">
            <h1 className="text-4xl md:text-6xl font-black text-primary uppercase tracking-tighter italic leading-none">
              {t.rules.title}
            </h1>
            <p className="text-gray-400 text-xs font-black uppercase tracking-[0.4em] mt-4 opacity-40 italic">
              {t.rules.protocolStandards}
            </p>
        </header>

        {/* Main Content Box - Clean & Minimal */}
        <div className="bg-white border rounded-sm shadow-2xl flex overflow-hidden min-h-[300px]">
            <div className="flex-1 p-16 flex flex-col justify-center">
                <h2 className="text-[10px] font-black text-primary/30 uppercase tracking-[0.5em] mb-6 italic opacity-60">{t.rules.associationProtocol}</h2>
                <div className="text-primary text-2xl font-black leading-relaxed max-w-4xl italic uppercase tracking-tighter">
                    {t.rules.desc}
                </div>
            </div>
        </div>

        {/* Simple Footer */}
        <div className="pt-24 pb-12 opacity-30">
            <div className="h-px w-32 bg-primary/20 mb-8"></div>
            <p className="text-[9px] text-primary font-black uppercase tracking-[0.5em] italic">
                {t.home.footerConsent}
            </p>
        </div>

      </div>
    </div>
  );
}
