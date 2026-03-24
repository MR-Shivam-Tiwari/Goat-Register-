import { query } from '@/lib/db';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { cookies } from 'next/headers';
import { getTranslation, Locale } from '@/lib/translations';
import { LayoutGrid, ArrowRight, Skull, History, LogOut, TrendingUp, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getBreedData(alias: string) {
  const result = await query('SELECT id, name, alias FROM breeds WHERE TRIM(alias) ILIKE TRIM($1)', [alias]);
  return result.rows[0];
}

async function getBreedPictures(alias: string) {
    const result = await query('SELECT sex, file FROM pictures WHERE TRIM(alias) ILIKE TRIM($1)', [alias]);
    const pics: Record<number, string> = {};
    result.rows.forEach(p => pics[p.sex] = p.file);
    return pics;
}

export default async function BreedPage({ params: paramsPromise }: { params: Promise<{ alias: string }> }) {
  const params = await paramsPromise;
  const breed = await getBreedData(params.alias);
  
  if (!breed) return <div className="p-40 text-center text-4xl font-black text-primary uppercase tracking-[1em]">Breed not found</div>;

  const pics = await getBreedPictures(params.alias);

  const cookieStore = await cookies();
  const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
  const t = getTranslation(lang);

  const categories = [
    { id: 'female', name: t.goats.female, sex: 0, desc: 'STOCK RECORDS', img: pics[0] || 'noimage.gif', color: 'bg-[#E2F0D9]/20' },
    { id: 'male',   name: t.goats.male,   sex: 1, desc: 'BREEDING SIRES', img: pics[1] || 'noimage.gif', color: 'bg-[#C5E0B4]/20' },
    { id: 'child',  name: lang === 'ru' ? 'Молодняк' : 'Kids (Young)', sex: 2, desc: 'OFFSPRING', img: pics[2] || 'noimage.gif', color: 'bg-[#F8CBAD]/20' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-6 px-4 md:px-12 lg:px-24 tracking-tight">
      <div className="max-w-[1200px] mx-auto space-y-8">
        <Breadcrumbs items={[{ label: t.catalog.breadcrumbs, href: '/catalog/goats' }, { label: breed.name }]} />

        <header className="border-b border-gray-100 pb-4 flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h1 className="text-3xl font-black text-primary tracking-tighter uppercase italic leading-none">
                  {breed.name} STOCK
                </h1>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-2 opacity-80 flex items-center gap-2">
                  <LayoutGrid size={10} className="text-secondary" />
                  Official Genetic Database
                </p>
            </div>
            <div className="hidden md:flex gap-6 items-center">
                <div className="flex items-center gap-2 border-r pr-4 border-gray-100">
                    <TrendingUp size={16} className="text-primary/20" />
                    <div className="text-right">
                        <span className="block text-xl font-black text-primary leading-none tracking-tighter italic">12K+</span>
                        <span className="text-[7px] font-black text-gray-300 uppercase tracking-widest leading-none mt-1 block">RECS</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-secondary/30" />
                    <div className="text-right">
                        <span className="block text-xl font-black text-secondary leading-none tracking-tighter italic">100%</span>
                        <span className="text-[7px] font-black text-gray-300 uppercase tracking-widest leading-none mt-1 block">CERT</span>
                    </div>
                </div>
            </div>
        </header>

        {/* COMPACT STOCK CATEGORIES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <Link 
              key={cat.id}
              href={`/catalog/goats/${breed.alias.trim()}/${cat.id}`}
              className="group flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-black transition-all duration-300 hover:shadow-lg"
            >
              <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center p-4 border-b border-gray-50 relative">
                 <img 
                    src={cat.img.startsWith('/') ? cat.img : `/img/${cat.img}`} 
                    alt={cat.name} 
                    className="h-[180px] w-auto object-contain opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
              </div>
              <div className={`p-4 flex flex-col flex-1 bg-white group-hover:${cat.color} transition-colors duration-300`}>
                <h3 className="text-lg font-black text-primary uppercase tracking-tighter italic leading-none">{cat.name}</h3>
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-300 mt-2 mb-4 italic leading-none">{cat.desc}</p>
                <div className="mt-auto">
                   <div className="flex items-center justify-between px-4 py-2 bg-[#491907] text-secondary font-black text-[9px] uppercase tracking-widest rounded-lg w-full transition-all italic">
                     {t.catalog.launch} 
                     <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* COMPACT ANIMAL MOVEMENT */}
        <section className="pt-6 pb-12 space-y-6">
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 italic whitespace-nowrap">
                   {t.goats.animalMovement}
                </span>
                <div className="flex-1 h-px bg-gray-100" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MovementLink 
                    href={`/catalog/goats/${breed.alias.trim()}/female/dead`}
                    label={t.goats.eliminatedGoats}
                    sub={lang === 'ru' ? 'ВЫБРАКОВАННЫЕ' : 'CULLED'}
                    icon={<Skull size={18} />}
                    theme="bg-[#491907]"
                    textColor="text-white"
                />
                <MovementLink 
                    href={`/catalog/goats/${breed.alias.trim()}/male/dead`}
                    label={t.goats.retiredGoats}
                    sub={lang === 'ru' ? 'ВЫВЕДЕННЫЕ' : 'RETIRED'}
                    icon={<History size={18} />}
                    theme="bg-white border-primary/5 hover:border-primary/20"
                    textColor="text-primary"
                />
                <MovementLink 
                    href={`/catalog/goats/${breed.alias.trim()}/child/dead`}
                    label={t.goats.departedYoung}
                    sub={lang === 'ru' ? 'ВЫБЫВШИЕ' : 'DEPARTED'}
                    icon={<LogOut size={18} />}
                    theme="bg-amber-50/10 border-amber-100/50 hover:border-amber-300"
                    textColor="text-amber-900"
                />
            </div>
        </section>

        <footer className="border-t border-gray-100 pt-8 pb-10 text-center opacity-30">
            <span className="text-[10px] font-black text-primary italic uppercase tracking-tighter">© {new Date().getFullYear()} ASSOCIATION OF BREEDING GOATS</span>
        </footer>
      </div>
    </div>
  );
}

function MovementLink({ href, label, sub, icon, theme, textColor }: any) {
    return (
        <Link href={href} className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${theme}`}>
            <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-black/5 border border-black/5 ${textColor}`}>
                {icon}
            </div>
            <div>
                <p className={`text-[12px] font-black uppercase tracking-tight ${textColor}`}>{label}</p>
                <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mt-0.5">{sub}</p>
            </div>
            <ArrowRight size={14} className={`ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all ${textColor}`} />
        </Link>
    );
}
