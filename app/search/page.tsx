import { query } from '@/lib/db';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { cookies } from 'next/headers';
import { getTranslation, Locale } from '@/lib/translations';

async function searchData(q: string) {
  const goatsRes = await query(
    'SELECT A.id, A.name, Di.id_breed FROM animals A JOIN goats_data Di ON A.id = Di.id_goat WHERE A.name ILIKE $1 LIMIT 10',
    [`%${q}%`]
  );
  
  // Adjusted for correct farms columns: id, name
  const farmsRes = await query(
    'SELECT id, name FROM farms WHERE name ILIKE $1 LIMIT 10',
    [`%${q}%`]
  );
  
  return {
    goats: goatsRes.rows,
    farms: farmsRes.rows
  };
}

export default async function SearchPage({ searchParams: searchParamsPromise }: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await searchParamsPromise;
  const q = searchParams.q || '';
  const results = q ? await searchData(q) : { goats: [], farms: [] };

  const cookieStore = await cookies();
  const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
  const t = getTranslation(lang);

  return (
    <div className="min-h-screen bg-bg-site py-24 px-10 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs items={[{ label: t.search.title }]} />

        <header className="mb-24 text-left group">
            <h2 className="text-7xl font-black text-primary tracking-tighter uppercase mb-6 leading-none">{t.search.results.split(' ')[0]} <br/> {t.search.results.split(' ')[1]}.</h2>
            <div className="h-2 w-32 bg-secondary rounded-full mb-8 group-hover:w-64 transition-all duration-1000 shadow-xl"></div>
            <p className="text-gray-400 font-bold text-3xl italic tracking-tighter">{t.search.querying} "{q}" {t.search.inDatabases}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 mt-20">
            <section className="space-y-12">
                <header className="flex items-center justify-between border-b-4 border-primary/5 pb-8 group cursor-pointer hover:border-secondary transition-all">
                    <h3 className="text-5xl font-black text-primary uppercase tracking-tighter">{t.search.registeredGoats}</h3>
                    <span className="text-4xl font-black text-secondary group-hover:scale-110 transition-transform">{results.goats.length}</span>
                </header>
                {results.goats.length === 0 ? (
                    <div className="p-20 bg-primary/5 rounded-[4rem] border-2 border-dashed border-primary/10 flex flex-col items-center opacity-30 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.415-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <p className="font-black uppercase tracking-[0.5em] text-xs">{t.search.noMatches}</p>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {results.goats.map((goat: any) => (
                            <div key={goat.id} className="bg-white/95 backdrop-blur-3xl p-10 lg:p-12 rounded-[3.5rem] flex items-center justify-between group cursor-pointer lg:hover:-translate-y-4 hover:shadow-4xl transition-all duration-500 border border-primary/5 hover:border-secondary">
                                <div className="space-y-2">
                                    <h4 className="text-3xl font-black text-primary group-hover:text-secondary transition-colors uppercase tracking-tighter">{goat.name}</h4>
                                    <div className="flex items-center gap-4">
                                      <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.5em]">{t.search.identityProfile}</span>
                                      <span className="bg-primary/5 text-primary px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/10">#{goat.id}</span>
                                    </div>
                                </div>
                                <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:rotate-[360deg] transition-all duration-1000 shadow-xl group-hover:shadow-primary/30 scale-125">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="space-y-12">
                 <header className="flex items-center justify-between border-b-4 border-primary/5 pb-8 group cursor-pointer hover:border-secondary transition-all">
                    <h3 className="text-5xl font-black text-primary uppercase tracking-tighter">{t.search.associationFarms}</h3>
                    <span className="text-4xl font-black text-secondary group-hover:scale-110 transition-transform">{results.farms.length}</span>
                </header>
                {results.farms.length === 0 ? (
                    <div className="p-20 bg-primary/5 rounded-[4rem] border-2 border-dashed border-primary/10 flex flex-col items-center opacity-30 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p className="font-black uppercase tracking-[0.5em] text-xs">{t.search.noInstitutional}</p>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        {results.farms.map((farm: any) => (
                            <Link key={farm.id} href={`/farms/${farm.id}`} className="bg-white/95 backdrop-blur-3xl p-10 lg:p-12 rounded-[3.5rem] flex items-center justify-between group lg:hover:-translate-y-4 hover:shadow-4xl transition-all duration-500 border border-primary/5 hover:border-secondary flex items-center justify-between animate-in slide-in-from-right-8 duration-700">
                                <div className="space-y-2">
                                    <h4 className="text-3xl font-black text-primary group-hover:text-secondary transition-colors uppercase tracking-tighter leading-none">{farm.name}</h4>
                                    <div className="flex items-center gap-4">
                                      <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.5em]">{t.search.farmEntry}</span>
                                      <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-secondary/20">{t.search.memberId}{farm.id}</span>
                                    </div>
                                </div>
                                <div className="w-16 h-16 border-4 border-primary/5 rounded-[2rem] flex items-center justify-center text-primary group-hover:bg-secondary group-hover:border-secondary group-hover:text-primary group-hover:-rotate-12 transition-all duration-700 shadow-2xl group-hover:shadow-secondary/30 scale-125">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
      </div>
    </div>
  );
}
