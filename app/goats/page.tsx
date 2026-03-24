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
      A.sex, 
      A.status, 
      A.is_reg,
      A.id_farm, 
      A.id_user, 
      A.time_added,
      B.name as breed_name, 
      B.alias as breed_alias,
      U.login as operator,
      (SELECT file FROM goats_pic WHERE id_goat = A.id ORDER BY time_added DESC LIMIT 1) as main_photo
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
    <div className="min-h-screen bg-[#FDFDFD] py-8 px-2 md:px-6 lg:px-8 font-sans leading-tight text-gray-800">
      <div className="max-w-[1700px] mx-auto space-y-6">
        <Breadcrumbs items={[{ label: t.nav.home, href: '/' }, { label: t.nav.registry }]} />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b-2 border-primary/5">
            <div>
                <h1 className="text-2xl font-black text-primary uppercase tracking-tighter italic leading-none">
                    {t.nav.registry}
                </h1>
                <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mt-1 font-mono">
                    Global Database • {goats.length} Records
                </p>
            </div>
        </div>

        <GoatFilters breeds={breeds} lang={lang} t={t} />

        <div className="overflow-hidden border border-gray-300 shadow-sm transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-auto min-w-[1200px]">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-tight text-white bg-[#4D2C1A] text-center h-10 border-b border-gray-400">
                  <th className="p-2 border-r border-white/10 w-64 sticky left-0 z-20 bg-[#491907]">Кличка</th>
                  <th className="p-2 border-r border-white/10 w-40">Уникальный код</th>
                  <th className="p-2 border-r border-white/10 w-32">Пол</th>
                  <th className="p-2 border-r border-white/10 w-48">Порода</th>
                  <th className="p-2 border-r border-white/10 w-56 text-[#E2F0D9]">+Потомство</th>
                  <th className="p-2 border-r border-white/10 w-40">Добавлен</th>
                  <th className="p-2 border-r border-white/10 w-40">Оператор</th>
                  <th className="p-2 w-20">Упр</th>
                </tr>
              </thead>
              <tbody className="text-[10px] uppercase font-bold text-gray-700 bg-white">
                {goats.map((goat: any, idx: number) => {
                  const uniqueCode = (goat.is_reg ? 'R' : 'X') + (10000 + Number(goat.id));
                  let rowBg = 'bg-white';
                  if (goat.status === 0) rowBg = 'bg-[#EF9A9A]/60';
                  else if (goat.is_reg) rowBg = 'bg-[#D7FDB5]/60';
                  else rowBg = 'bg-[#F3F1F1]/70';

                  return (
                    <tr key={goat.id} className={`h-11 border-b border-gray-200 hover:bg-blue-100 transition-all ${rowBg}`}>
                      <td className={`p-1 border-r border-gray-100 flex items-center gap-3 sticky left-0 z-10 bg-inherit shadow-[1px_0_0_0_rgba(0,0,0,0.05)] h-full`}>
                          <div className="w-9 h-9 border border-gray-300 rounded overflow-hidden flex-shrink-0 bg-white shadow-sm ml-1">
                              {goat.main_photo ? (
                                  <img src={`/storage/gallery/${goat.main_photo}`} alt="" className="w-full h-full object-cover" />
                              ) : (
                                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-[8px]">NO IMG</div>
                              )}
                          </div>
                          <Link href={`/goats/${goat.id}`} className="hover:text-amber-900 underline underline-offset-2 overflow-hidden text-ellipsis whitespace-nowrap">
                              {goat.name}
                          </Link>
                      </td>
                      <td className="p-2 border-r border-gray-100 text-center font-mono text-gray-800 font-bold">{uniqueCode}</td>
                      <td className="p-2 border-r border-gray-100 text-center font-black">
                          {goat.sex === 1 ? 'Муж' : 'Жен'}
                      </td>
                      <td className="p-2 border-r border-gray-100 text-center font-black opacity-80">{goat.breed_alias || goat.breed_name}</td>
                      <td className="p-2 border-r border-gray-100 text-center flex items-center justify-center gap-4 h-full">
                          <Link href={`/goats/${goat.id}/offspring?sex=male`} className="text-blue-500 hover:underline">+Сын</Link>
                          <Link href={`/goats/${goat.id}/offspring?sex=female`} className="text-blue-500 hover:underline">+Дочь</Link>
                      </td>
                      <td className="p-2 border-r border-gray-100 text-center opacity-60 font-mono">
                        {goat.time_added ? new Date(goat.time_added).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="p-2 border-r border-gray-100 text-center text-gray-400 font-black">{goat.operator || 'SYSTEM'}</td>
                      <td className="p-2 text-center">
                        <Link 
                          href={`/catalog/goats/fix/${goat.id}`} 
                          className="inline-flex items-center justify-center w-8 h-8 bg-white border border-gray-300 rounded-sm hover:border-amber-900 hover:text-amber-900 transition-colors shadow-sm font-black text-xs text-blue-600"
                          title="Management / Edit"
                        >
                          P
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {goats.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-32 text-center text-gray-200 font-black uppercase tracking-[1em] text-2xl">
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
