import { query } from '@/lib/db';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { cookies } from 'next/headers';
import { getTranslation, Locale } from '@/lib/translations';
import GoatFilters from '@/components/GoatFilters';

export const dynamic = 'force-dynamic';

async function getBreeds() {
  const res = await query('SELECT id, name FROM breeds ORDER BY name ASC');
  return res.rows;
}

async function getAllGoats(filters: { q?: string, breed?: string, sex?: string, view?: string }) {
  let whereClause = 'WHERE 1=1';
  const params: any[] = [];
  
  if (filters.q) {
    params.push(`%${filters.q}%`);
    whereClause += ` AND (A.name ILIKE $${params.length} OR Di.code_ua ILIKE $${params.length} OR B.name ILIKE $${params.length})`;
  }
  
  if (filters.breed) {
    params.push(filters.breed);
    whereClause += ` AND Di.id_breed = $${params.length}`;
  }
  
  if (filters.sex) {
    params.push(filters.sex);
    whereClause += ` AND A.sex = $${params.length}`;
  }

  if (filters.view) {
      if (filters.view === 'r') {
          whereClause += ` AND Di.id_stoodbook = 1`;
      } else if (filters.view === 'x') {
          whereClause += ` AND Di.id_stoodbook IN (10, 11, 12)`;
      } else if (filters.view === 'living') {
          whereClause += ` AND A.status = 1`;
      } else if (filters.view === 'dead') {
          whereClause += ` AND A.status = 0`;
      } else if (filters.view === 'nostatus') {
          whereClause += ` AND A.status IS NULL`;
      } else if (filters.view === 'duplicates') {
          whereClause += ` AND Di.code_ua IN (SELECT code_ua FROM goats_data WHERE code_ua IS NOT NULL AND code_ua != '' GROUP BY code_ua HAVING count(*) > 1)`;
      }
  }

  const result = await query(`
    SELECT 
      A.id, 
      A.name, 
      Di.code_ua as unique_code, 
      A.sex, 
      B.name as breed_name, 
      A.time_added, 
      U.login as operator,
      (SELECT count(*) FROM animals WHERE id_mother = A.id) as daughters_count,
      (SELECT count(*) FROM animals WHERE id_father = A.id) as sons_count
    FROM animals A
    JOIN goats_data Di ON A.id = Di.id_goat
    JOIN breeds B ON Di.id_breed = B.id
    LEFT JOIN users U ON A.id_user = U.id
    ${whereClause}
    ORDER BY A.time_added DESC
    LIMIT 1000
  `, params);
  return result.rows;
}

export default async function AllGoatsPage({ searchParams: searchParamsPromise }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await searchParamsPromise;
  const filters = {
    q: searchParams.q,
    breed: searchParams.breed,
    sex: searchParams.sex,
    view: searchParams.view
  };

  const [goats, breeds] = await Promise.all([
    getAllGoats(filters),
    getBreeds()
  ]);

  const cookieStore = await cookies();
  const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
  const t = getTranslation(lang);

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-12 px-2 md:px-6 lg:px-12 font-sans tracking-tight">
      <div className="max-w-[1700px] mx-auto space-y-6">
        <Breadcrumbs items={[{ label: t.nav.home, href: '/' }, { label: t.nav.registry }]} />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b-2 border-primary/5">
            <div>
                <h1 className="text-3xl font-black text-primary uppercase tracking-tighter italic leading-none">
                    {t.nav.registry}
                </h1>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2 font-mono">
                    Global Stock Database • {goats.length} Records
                </p>
            </div>
        </div>

        <GoatFilters breeds={breeds} lang={lang} t={t} />

        <div className="bg-white shadow-2xl rounded-sm border border-gray-300 relative overflow-hidden">
          <div className="overflow-x-auto max-h-[75vh] overflow-y-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[1300px]">
              <thead className="sticky top-0 z-20 bg-[#E2F0D9] text-gray-700 shadow-sm border-b border-gray-400">
                <tr className="text-[12px] uppercase font-black tracking-widest leading-none">
                  <th className="p-4 border-r border-gray-400 w-56 sticky left-0 bg-[#E2F0D9] z-30">Nickname / Кличка</th>
                  <th className="p-4 border-r border-gray-400 w-40 text-center">Unique code</th>
                  <th className="p-4 border-r border-gray-400 w-32 text-center">Sex / Пол</th>
                  <th className="p-4 border-r border-gray-400 w-48 text-center">Breed / Порода</th>
                  <th className="p-4 border-r border-gray-400 w-56 text-center">+Offspring</th>
                  <th className="p-4 border-r border-gray-400 w-40 text-center">Added / Дата</th>
                  <th className="p-4 border-r border-gray-400 w-36 text-center">Operator</th>
                  <th className="p-4 text-center w-24">Ex.</th>
                </tr>
              </thead>
              <tbody className="text-[11px] text-gray-800 font-bold uppercase tracking-tight divide-y divide-gray-200 bg-white">
                {goats.map((goat: any) => (
                  <tr key={goat.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="p-3 border-r border-gray-100 font-black whitespace-nowrap sticky left-0 z-10 bg-inherit shadow-[1px_0_0_0_rgba(0,0,0,0.1)]">
                      <Link href={`/goats/${goat.id}`} className="text-blue-900 hover:text-red-700 hover:underline">
                         ➔ {goat.name}
                      </Link>
                    </td>
                    <td className="p-3 border-r border-gray-100 text-center font-mono opacity-60 truncate">{goat.unique_code || '-'}</td>
                    <td className="p-3 border-r border-gray-100 text-center uppercase tracking-tighter">
                      {goat.sex === 1 ? 'MALE / САМЕЦ' : 'FEMALE / САМКА'}
                    </td>
                    <td className="p-3 border-r border-gray-100 text-center font-black truncate text-primary/80">{goat.breed_name}</td>
                    <td className="p-3 border-r border-gray-100 text-center font-black text-[#491907]">
                       <span className="opacity-30 text-[9px]">S:</span>{goat.sons_count} <span className="opacity-30 text-[9px] ml-2">D:</span>{goat.daughters_count}
                    </td>
                    <td className="p-3 border-r border-gray-100 text-center whitespace-nowrap opacity-50 font-mono">
                      {goat.time_added ? new Date(goat.time_added).toLocaleDateString('ru-RU') : '-'}
                    </td>
                    <td className="p-3 border-r border-gray-100 text-center font-black uppercase text-gray-400 text-[10px]">{goat.operator || 'SYSTEM'}</td>
                    <td className="p-3 text-center">
                      <Link href={`/goats/${goat.id}`} className="inline-block px-4 py-1.5 bg-primary text-secondary rounded-sm hover:bg-black transition-colors font-black text-[10px] tracking-widest shadow-sm">VIEW</Link>
                    </td>
                  </tr>
                ))}
                {goats.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-40 text-center text-gray-200 font-black uppercase tracking-[1em] text-2xl bg-white">
                      EMPTY REGISTRY
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
