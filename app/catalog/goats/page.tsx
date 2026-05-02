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
  try {
    const breeds = await getBreedsWithStats();
    const cookieStore = await cookies();
    const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
    const t = getTranslation(lang);

    return (
      <div className="min-h-screen py-8 px-6 md:px-12 lg:px-20 font-sans text-gray-800 tracking-tight">
        <div className="max-w-[1700px] mx-auto space-y-12">
          <Breadcrumbs items={[{ label: t.catalog.breadcrumbs }]} t={t} locale={lang} />

          {/* Client Component Grid for interactivity */}
          <BreedCatalogDisplay breeds={breeds} t={t} />

        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading CatalogPage:", error);
    return (
      <div className="min-h-screen bg-[#FFFFF0] flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-xl border border-red-100 text-center">
          <h2 className="text-2xl font-black text-red-600 uppercase mb-4">Database Error</h2>
          <p className="text-gray-500 font-medium">Failed to load breed catalog. Please check your connection.</p>
          <p className="mt-4 text-xs text-gray-300 font-mono">{(error as Error).message}</p>
        </div>
      </div>
    );
  }
}
