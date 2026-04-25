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
    <div className="min-h-screen bg-[#FDFDFD] py-6 px-4 md:px-12 lg:px-24 tracking-tight">
      <div className="max-w-[1400px] mx-auto min-h-screen flex flex-col space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-primary/5 pb-6 gap-6">
          <div>
            <h2 className="text-3xl font-medium text-primary uppercase leading-tight tracking-tighter mb-2">
              {breed ? `${breed.name} / ` : ""}{t.catalog.transferredAnimalsList}
            </h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#CFA97A]">
                {breed ? "BREED REGISTRY VIEW" : "GLOBAL MOVEMENT LOG"}
            </p>
          </div>
          <div className="bg-primary/5 px-4 py-2 rounded-lg border border-primary/10 self-start md:self-end">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">
              TOTAL RECORDS: <span className="text-primary">{goats.length}</span>
            </p>
          </div>
        </header>

        <section className="h-full flex flex-col space-y-4 flex-1">
          <div className="bg-white border-2 border-black overflow-hidden flex-1 overflow-x-auto relative">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead className="bg-[#23DC69] text-black">
                <tr className="text-[11px] font-bold uppercase divide-x divide-black border-b border-black">
                  <th className="p-2 px-4 sticky left-0 z-20 bg-[#23DC69] border-r border-black">Кличка</th>
                  <th className="p-2 px-4 border-r border-black">Порода</th>
                  <th className="p-2 px-4 border-r border-black">Дата рождения</th>
                  <th className="p-2 px-4 border-r border-black">Пол</th>
                  <th className="p-2 px-4 border-r border-black">Член ABG</th>
                  <th className="p-2 px-4 border-r border-black">Заводчик</th>
                  <th className="p-2 px-4">Владелец</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black bg-white">
                {goats.map((g, idx) => {
                  const rowKey = g.move_id || `move-${idx}`;
                  const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#B5F4BB';
                  
                  return (
                    <tr key={rowKey} style={{ backgroundColor: rowBg }} className="divide-x divide-black transition-all border-b border-black h-8">
                        <td className="p-2 px-4 sticky left-0 z-10 whitespace-nowrap border-r border-black" style={{ backgroundColor: rowBg }}>
                          <Link href={`/goats/${g.id}`} className="text-[13px] font-bold text-black hover:underline uppercase">
                            {g.goat_name || "UNKNOWN"}
                          </Link>
                        </td>
                        <td className="p-2 px-4 whitespace-nowrap">
                          <span className="text-[11px] font-normal uppercase text-black">
                              {g.breed_name || "-"}
                          </span>
                        </td>
                        <td className="p-2 px-4 whitespace-nowrap">
                          <span className="text-[11px] font-normal text-black tabular-nums">
                              {formatDate(g.date_born)}
                          </span>
                        </td>
                        <td className="p-2 px-4 whitespace-nowrap">
                          <span className="text-[11px] font-normal uppercase text-black">
                              {g.goat_sex === 1 ? t.goats.male : g.goat_sex === 0 ? t.goats.female : "Kids"}
                          </span>
                        </td>
                        <td className="p-2 px-4 whitespace-nowrap text-center">
                          <span className="text-[11px] font-bold text-black uppercase">
                            {g.buyer_name ? "Да" : "Нет"}
                          </span>
                        </td>
                        <td className="p-2 px-4 whitespace-nowrap">
                          <span className="text-[11px] font-normal text-black uppercase">
                            {g.seller_name || "-"}
                          </span>
                        </td>
                        <td className="p-2 px-4 whitespace-nowrap">
                          <span className="text-[11px] font-normal text-black uppercase">
                            {g.buyer_name || "-"}
                          </span>
                        </td>
                    </tr>
                  );
                })}
                {goats.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-20 text-center bg-white">
                      <div className="inline-block text-gray-400 font-bold px-8 py-4 uppercase text-xs tracking-widest border-2 border-black">
                         NO MOVEMENT RECORDS FOUND
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
