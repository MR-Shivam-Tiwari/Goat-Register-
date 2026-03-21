import Breadcrumbs from '@/components/Breadcrumbs';
import { cookies } from 'next/headers';
import { getTranslation, Locale } from '@/lib/translations';
import Link from 'next/link';

export default async function RulesPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
  const t = getTranslation(lang);

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-12 px-6 lg:px-24 font-sans">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Simple Breadcrumb Header */}
        <div className="bg-[#EFE5D5] p-3 rounded-lg flex items-center justify-between border border-[#D2B48C]/40">
          <div className="text-[13px] font-bold text-[#491907]/80 flex items-center gap-2 px-2">
            <span className="text-[#491907]/50 font-medium">You are here:</span>
            <Link href="/" className="hover:underline cursor-pointer">Home</Link>
            <span className="text-[#491907]/30">•</span>
            <span className="text-[#491907]">Rules</span>
          </div>
          <div className="flex gap-1.5 px-2">
            <div className="w-9 h-9 bg-[#491907] rounded-lg flex items-center justify-center text-[10px] text-white font-bold shadow-sm">👤</div>
            <div className="w-9 h-9 bg-[#491907] rounded-lg flex items-center justify-center text-[10px] text-white font-bold shadow-sm">F</div>
            <div className="w-9 h-9 bg-[#491907] rounded-lg flex items-center justify-center text-[10px] text-white font-bold shadow-sm">+</div>
            <div className="w-9 h-9 bg-[#491907] rounded-lg flex items-center justify-center text-[10px] text-white font-bold shadow-sm">L</div>
          </div>
        </div>

        {/* Main Content Box - Clean & Minimal */}
        <div className="bg-white border-2 border-[#491907]/20 rounded-xl min-h-[180px] shadow-sm flex overflow-hidden">
            {/* Left Decor Placeholder */}
            <div className="w-20 bg-[#F9F6F1] border-r border-[#491907]/5 hidden md:block"></div>
            
            {/* Real Text Content */}
            <div className="flex-1 p-12 flex flex-col justify-center">
                <h2 className="text-sm font-black text-[#491907]/30 uppercase tracking-[0.3em] mb-4 italic">Association Protocol</h2>
                <p className="text-[#491907] text-xl font-medium leading-relaxed max-w-2xl italic">
                    {t.rules.desc}
                </p>
            </div>
        </div>

        {/* Simple Footer */}
        <div className="text-center pt-24 pb-12">
            <div className="h-px w-24 bg-[#491907]/10 mx-auto mb-8"></div>
            <p className="text-[10px] text-[#491907]/40 font-black uppercase tracking-[0.5em] italic">
                {t.home.footerConsent}
            </p>
        </div>

      </div>
    </div>
  );
}
