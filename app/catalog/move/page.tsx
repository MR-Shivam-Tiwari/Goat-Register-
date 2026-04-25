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
    <div className="min-h-screen bg-[#FFFFF0] py-6 px-4 md:px-12 lg:px-24 tracking-tight">
      <div className="max-w-[1400px] mx-auto min-h-screen flex flex-col space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-primary/5 pb-6 gap-6">
          <div>
            <h2 className="text-3xl font-black text-primary uppercase leading-tight tracking-tighter mb-2">
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
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden flex-1 overflow-x-auto relative">
            <table className="w-full text-left border-separate border-spacing-0 min-w-[1100px]">
              <thead className="bg-[#441a0e] text-amber-50">
                <tr className="text-[11px] font-black uppercase tracking-widest">
                  <th className="p-4 border-b border-white/10 sticky left-0 z-20 bg-[#441a0e]">Кличка</th>
                  <th className="p-4 border-b border-white/10">Порода</th>
                  <th className="p-4 border-b border-white/10">Дата рождения</th>
                  <th className="p-4 border-b border-white/10">Пол</th>
                  <th className="p-4 border-b border-white/10">Ферма продавец</th>
                  <th className="p-4 border-b border-white/10">Ферма покупатель</th>
                  <th className="p-4 border-b border-white/10 text-right">Дата продажи</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {goats.map((g, idx) => {
                  // Unique key fix: using move_id OR index if missing
                  const rowKey = g.move_id || `move-${idx}`;
                  return (
                    <tr key={rowKey} className="hover:bg-primary/5 transition-colors group">
                        <td className="p-4 align-top sticky left-0 z-10 bg-white group-hover:bg-[#FDF6F0] border-r border-gray-100">
                        <Link href={`/goats/${g.id}`} className="inline-block relative">
                            <span className="text-sm font-black text-primary leading-tight hover:text-secondary hover:underline underline-offset-4 decoration-2 overflow-hidden text-ellipsis line-clamp-2 uppercase">
                            ➔ {g.goat_name || "UNKNOWN"}
                            </span>
                        </Link>
                        </td>
                        <td className="p-4 align-top">
                        <span className="text-[10px] font-black uppercase text-gray-400">
                            {g.breed_name || "-"}
                        </span>
                        </td>
                        <td className="p-4 align-top">
                        <span className="text-xs font-bold text-gray-900 border border-black/5 bg-black/5 px-2 py-0.5 rounded-sm tabular-nums whitespace-nowrap">
                            {formatDate(g.date_born)}
                        </span>
                        </td>
                        <td className="p-4 align-top">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60 bg-gray-50 px-2 py-1 rounded">
                            {g.goat_sex === 1 ? t.goats.male : g.goat_sex === 0 ? t.goats.female : "Kids"}
                        </span>
                        </td>
                        <td className="p-4 align-top">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-700 leading-tight uppercase">
                            {g.seller_name || "-"}
                            </span>
                            <span className="text-[8px] font-black text-gray-300 uppercase">BREEDER</span>
                        </div>
                        </td>
                        <td className="p-4 align-top">
                        <div className="flex flex-col text-green-700 uppercase">
                            <span className="text-xs font-bold leading-tight">
                            {g.buyer_name || "-"}
                            </span>
                            <span className="text-[8px] font-black opacity-50">OWNER</span>
                        </div>
                        </td>
                        <td className="p-4 align-top text-right">
                        <span className="text-[11px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 inline-block border border-primary/10 rounded tabular-nums">
                            {formatDate(g.sale_date)}
                        </span>
                        </td>
                    </tr>
                );
                })}
                {goats.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-20 text-center">
                      <div className="inline-block bg-gray-50 text-gray-400 font-bold px-8 py-4 uppercase text-xs tracking-widest rounded-3xl border border-gray-100">
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
