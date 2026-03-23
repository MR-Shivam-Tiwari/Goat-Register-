import { query } from '@/lib/db';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { cookies } from 'next/headers';
import { getTranslation, Locale } from '@/lib/translations';

export const dynamic = 'force-dynamic';

async function getBreedsWithStats() {
  const result = await query(`
    SELECT 
      B.id, B.name, B.alias,
      (SELECT count(*) FROM goats_data WHERE id_breed = B.id) as total_animals,
      (SELECT count(*) FROM goats_data Di JOIN animals A ON Di.id_goat = A.id WHERE Di.id_breed = B.id AND A.status = 1) as living_animals
    FROM breeds B
    ORDER BY B.name ASC
  `);
  return result.rows;
}

export default async function CatalogPage() {
  const breeds = await getBreedsWithStats();
  const cookieStore = await cookies();
  const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
  const t = getTranslation(lang);

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-8 px-4 md:px-12 font-sans text-gray-800 tracking-tight">
      <div className="max-w-[1700px] mx-auto space-y-8">
        <Breadcrumbs items={[{ label: t.catalog.breadcrumbs }]} />

        <header className="border-b border-gray-100 pb-4">
            <h1 className="text-2xl font-black text-primary uppercase tracking-tighter italic">
               Breed Catalog
            </h1>
            <p className="text-gray-400 text-[8px] font-bold uppercase tracking-[0.3em] mt-0.5">
               Registry Database • {breeds.length} Official Breeds
            </p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
          {breeds.map((breed) => (
            <Link 
              key={breed.id} 
              href={`/catalog/goats/${breed.alias.trim()}`}
              className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-black hover:shadow-2xl transition-all flex flex-col items-center p-4 text-center"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-full overflow-hidden mb-3 border border-gray-100 p-2 flex items-center justify-center group-hover:bg-[#E2F0D9] transition-colors">
                 <img 
                    src={`/img/${breed.alias.trim() === 'AN' ? 'nub-kozli.jpg' : 'kozi1.jpg'}`} 
                    alt={breed.name} 
                    className="w-full h-full object-contain opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform"
                />
              </div>

              <div className="space-y-1">
                <h3 className="text-[11px] font-black text-primary uppercase tracking-tighter leading-none group-hover:text-blue-800 transition-colors">
                    {breed.name}
                </h3>
                <span className="text-[8px] font-mono text-gray-300 font-bold uppercase tracking-widest">{breed.alias}</span>
              </div>

              <div className="mt-4 flex gap-4 text-[9px] font-black uppercase text-gray-400 border-t border-gray-100 pt-3 w-full justify-center">
                <div className="leading-none">
                    <span className="block text-primary">{breed.total_animals}</span>
                    <span className="text-[7px] opacity-50">Total</span>
                </div>
                <div className="leading-none border-l border-gray-100 pl-4">
                    <span className="block text-green-600">{breed.living_animals}</span>
                    <span className="text-[7px] opacity-50">Live</span>
                </div>
              </div>

              <div className="mt-4 w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-0 group-hover:w-full transition-all duration-500"></div>
              </div>
            </Link>
          ))}
        </div>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8 border-t border-gray-100 mt-12 bg-gray-50/50 p-4 rounded-xl">
             {[
               { val: breeds.length, label: 'TOTAL BREEDS' },
               { val: breeds.reduce((acc, b) => acc + parseInt(b.total_animals), 0), label: 'TOTAL RECORDS' },
               { val: 'VERIFIED', label: 'ACCURACY' },
               { val: 'ACTIVE', label: 'STATUS' }
             ].map((s, i) => (
                <div key={i} className="text-center">
                    <span className="block text-xl font-black text-primary mb-0.5 uppercase tracking-tighter italic">{s.val}</span>
                    <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest font-mono italic">{s.label}</span>
                </div>
             ))}
        </section>
      </div>
    </div>
  );
}
