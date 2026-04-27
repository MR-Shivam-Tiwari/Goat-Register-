import { query } from '@/lib/db';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { cookies } from 'next/headers';
import { getTranslation, Locale } from '@/lib/translations';
import { getSessionUser } from '@/lib/access-control';

export const dynamic = 'force-dynamic';

async function getBreedData(alias: string) {
  const result = await query('SELECT id, name, alias FROM breeds WHERE TRIM(alias) ILIKE TRIM($1)', [alias]);
  return result.rows[0];
}

async function getTransferredGoats(breed_id?: number) {
  let whereClause = "";
  const params: any[] = [];
  
  if (breed_id && breed_id !== 0) {
    whereClause = "WHERE Di.id_breed = $1";
    params.push(breed_id);
  }

  const sql = `
    SELECT 
      M.id AS move_id,
      A.name AS goat_name,
      A.sex AS goat_sex,
      A.id,
      Di.date_born,
      B.name AS breed_name,
      Fs.name AS seller_name,
      Fb.name AS buyer_name,
      M.time_added AS sale_date
    FROM goats_move M
    JOIN animals A ON M.id_goat = A.id
    LEFT JOIN goats_data Di ON A.id = Di.id_goat
    LEFT JOIN breeds B ON Di.id_breed = B.id
    LEFT JOIN farms Fs ON M.id_farm_of = Fs.id
    LEFT JOIN farms Fb ON M.id_farm_on = Fb.id
    ${whereClause}
    ORDER BY M.time_added DESC
  `;
  const result = await query(sql, params);
  return result.rows;
}

function formatDate(dateStr: any) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString("ru-RU");
}

export default async function TransferredGoatsPage({
  params: paramsPromise,
}: {
  params: Promise<{ alias?: string }>;
}) {
  const params = await paramsPromise;
  const alias = params.alias;

  const cookieStore = await cookies();
  const lang = (cookieStore.get("nxt-lang")?.value as Locale) || "ru";
  const t = getTranslation(lang);
  
  // SECURE ACCESS: Bypassed for testing as per user request
  /*
  const user = await getSessionUser();
  if (!user || Number(user.role) < 10) { ... }
  */

  let breed = null;
  if (alias && alias !== 'all') {
    breed = await getBreedData(alias);
  }

  const goats = await getTransferredGoats(breed?.id);

  const breadcrumbItems = [
    { label: t.catalog.breadcrumbs, href: "/catalog/goats" },
  ];
  if (breed) {
    breadcrumbItems.push({ label: breed.name, href: `/catalog/goats/${alias}` });
    breadcrumbItems.push({ label: t.catalog.transferredAnimalsList, href: `/catalog/goats/${alias}/move` });
  } else {
    breadcrumbItems.push({ label: t.catalog.transferredAnimalsList, href: "/catalog/move" });
  }

  return (
    <div className="min-h-screen bg-[#FEFBF5] py-6 px-4 md:px-12 lg:px-24 tracking-tight">
      <div className="max-w-[1500px] mx-auto flex flex-col h-[calc(100vh-100px)] space-y-4">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="flex items-center justify-between py-2 border-b border-[#491907]/10">
            <h2 className="text-[22px] font-light text-[#491907] uppercase tracking-tight leading-none">
              <span className="opacity-40">{breed ? `${breed.name} / ` : ""}</span>
              {t.catalog.transferredAnimalsList}
            </h2>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                {goats.length} RECORDS FOUND
            </div>
        </header>

        <div className="flex-1 min-h-0 overflow-auto bg-white border border-black relative">
            <table className="w-full text-left border-collapse table-auto min-w-[1400px] text-[10.5px] font-normal leading-none">
              <thead className="sticky top-0 z-30 shadow-sm">
                <tr className="text-[9px] font-bold uppercase tracking-tight text-black bg-[#23DC69] border-b border-black">
                  <th colSpan={8} className="p-1.5 text-center border-r border-black uppercase tracking-widest">
                    {t.catalog.transferredAnimalsList}
                  </th>
                </tr>
                <tr className="text-[9px] font-bold uppercase tracking-tight text-gray-900 border-b border-black bg-[#B5F4BB]">
                  <th className="p-1 px-4 border-r border-black sticky left-0 bg-[#B5F4BB] z-40 w-64">1. Кличка</th>
                  <th className="p-1 px-4 border-r border-black text-center">2. порода</th>
                  <th className="p-1 px-4 border-r border-black text-center">3. Дата рождения</th>
                  <th className="p-1 px-4 border-r border-black text-center">4. Дата продажи</th>
                  <th className="p-1 px-4 border-r border-black text-center">5. Пол</th>
                  <th className="p-1 px-4 border-r border-black text-center">6. Член ABG</th>
                  <th className="p-1 px-4 border-r border-black text-center">7. Заводчик</th>
                  <th className="p-1 px-4 border-black text-center">8. Владелец</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black bg-white">
                {goats.map((g, idx) => {
                  const rowKey = g.move_id || `move-${idx}`;
                  const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#B5F4BB';
                  
                  return (
                    <tr 
                      key={rowKey} 
                      style={{ backgroundColor: rowBg }}
                      className="divide-x divide-black h-8 hover:opacity-90 transition-opacity"
                    >
                        <td 
                          style={{ backgroundColor: rowBg }}
                          className="p-1 px-4 sticky left-0 z-20 border-r border-black font-bold whitespace-nowrap"
                        >
                            <Link href={`/goats/${g.id}`} target="_blank" className="hover:underline flex items-center gap-2">
                                <span className="opacity-30">➔</span>
                                {g.goat_name || "UNKNOWN"}
                            </Link>
                        </td>
                        <td className="p-1 px-4 text-center uppercase opacity-80">
                            {g.breed_name || "-"}
                        </td>
                        <td className="p-1 px-4 text-center font-mono tabular-nums">
                            {formatDate(g.date_born)}
                        </td>
                        <td className="p-1 px-4 text-center font-mono tabular-nums bg-yellow-50/10">
                            {formatDate(g.sale_date)}
                        </td>
                        <td className="p-1 px-4 text-center uppercase font-bold">
                            {g.goat_sex === 1 ? t.goats.male : g.goat_sex === 0 ? t.goats.female : "Kids"}
                        </td>
                        <td className="p-1 px-4 text-center font-bold">
                            {g.is_abg ? "YES" : "NO"}
                        </td>
                        <td className="p-1 px-4 uppercase truncate max-w-[250px]">
                            {g.seller_name || "-"}
                        </td>
                        <td className="p-1 px-4 uppercase truncate max-w-[250px]">
                            {g.buyer_name || "-"}
                        </td>
                    </tr>
                  );
                })}
                {goats.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                       NO MOVEMENT RECORDS FOUND
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
