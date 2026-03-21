import { query } from '@/lib/db';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { cookies } from 'next/headers';
import { getTranslation, Locale } from '@/lib/translations';

async function getBreeds() {
  const result = await query('SELECT * FROM breeds ORDER BY name ASC');
  return result.rows;
}

export default async function CatalogPage() {
  const breeds = await getBreeds();
  const cookieStore = await cookies();
  const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
  const t = getTranslation(lang);

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-20 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto space-y-16">
        <Breadcrumbs items={[{ label: t.catalog.breadcrumbs }]} />

        <header className="border-b border-primary/10 pb-12">
            <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tighter uppercase mb-4 leading-tight italic">
              {t.catalog.title}
            </h1>
            <p className="text-primary/40 text-sm font-bold uppercase tracking-[0.3em] max-w-2xl leading-relaxed italic">
              {t.catalog.desc}
            </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {breeds.map((breed) => (
            <Link 
              key={breed.id} 
              href={`/catalog/goats/${breed.alias.trim()}`}
              className="group flex flex-col bg-white border border-primary/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all duration-300"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-primary/5">
                <img 
                    src={`/img/${breed.alias.trim() === 'AN' ? 'nub-kozli.jpg' : 'kozi1.jpg'}`} 
                    alt={breed.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 bg-primary text-secondary px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest">
                   {breed.alias.trim()}
                </div>
              </div>
              
              <div className="p-8 flex flex-col flex-1">
                <h3 className="text-xl font-black text-primary uppercase tracking-tight mb-2 group-hover:text-secondary transition-colors">
                  {breed.name}
                </h3>
                <p className="text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em] mb-8">
                  {t.catalog.specification}
                </p>
                
                <div className="mt-auto pt-6 border-t border-primary/5 flex items-center justify-between">
                   <span className="text-[9px] font-black text-primary hover:text-black transition-colors uppercase tracking-[0.4em] italic">
                      {t.catalog.launch} ➔
                   </span>
                   <div className="h-1 w-8 bg-secondary rounded-full"></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
