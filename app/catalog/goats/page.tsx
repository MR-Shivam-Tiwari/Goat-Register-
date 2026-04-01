import { query } from '@/lib/db';
import Breadcrumbs from '@/components/Breadcrumbs';
import { cookies } from 'next/headers';
import { getTranslation, Locale } from '@/lib/translations';
import BreedCatalogDisplay from '@/components/BreedCatalogDisplay';

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
    <div className="min-h-screen bg-[#FDFDFD] py-8 px-6 md:px-12 lg:px-20 font-sans text-gray-800 tracking-tight">
      <div className="max-w-[1700px] mx-auto space-y-12">
        <Breadcrumbs items={[{ label: t.catalog.breadcrumbs }]} />

        <header className="border-b-2 border-gray-100 pb-8">
            <h1 className="text-4xl font-black text-primary uppercase tracking-tighter italic leading-none">
               {t.catalog.breedCatalog}
            </h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.4em] mt-3 opacity-60">
               {t.catalog.registryDb} • {breeds.length} {t.catalog.officialBreedsSuffix}
            </p>
        </header>

        {/* Client Component Grid for interactivity */}
        <BreedCatalogDisplay breeds={breeds} t={t} />

        {/* BOTTOM STATS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 px-8 border-2 border-gray-100 mt-20 bg-[#FDFDFD] rounded-[40px] shadow-sm">
             {[
               { val: breeds.length, label: t.catalog.totalBreeds },
               { val: breeds.reduce((acc, b) => acc + parseInt(b.total_animals), 0), label: t.catalog.totalRecords },
               { val: t.catalog.verified, label: t.catalog.accuracy },
               { val: t.catalog.active, label: t.catalog.status }
             ].map((s, i) => (
                <div key={i} className="text-center group cursor-default">
                    <span className="block text-3xl font-black text-primary mb-1 uppercase tracking-tighter italic group-hover:scale-110 transition-transform">{s.val}</span>
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] font-mono italic leading-none">{s.label}</span>
                </div>
             ))}
        </section>
      </div>
    </div>
  );
}
