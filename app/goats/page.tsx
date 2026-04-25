import { query } from "@/lib/db";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { cookies } from "next/headers";
import { getTranslation, Locale } from "@/lib/translations";
import GoatFilters from "@/components/GoatFilters";
import { getSessionUser } from "@/lib/access-control";

export const dynamic = "force-dynamic";

async function getBreeds() {
  const res = await query("SELECT id, name FROM breeds ORDER BY name ASC");
  return res.rows;
}

async function getAllGoats(filters: {
  q?: string;
  breed?: string;
  sex?: string;
  view?: string;
  reg?: string;
}) {
  let whereClause = "WHERE 1=1";
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
    if (filters.view === "living") {
      whereClause += ` AND A.status = '1'`;
    } else if (filters.view === "dead") {
      whereClause += ` AND A.status = '0'`;
    } else if (filters.view === "nostatus") {
      whereClause += ` AND A.status IS NULL`;
    } else if (filters.view === "duplicates") {
      whereClause += ` AND Di.code_ua IN (SELECT code_ua FROM goats_data WHERE code_ua IS NOT NULL AND code_ua != '' GROUP BY code_ua HAVING count(*) > 1)`;
    }
  }

  if (filters.reg) {
    if (filters.reg === "r") {
      whereClause += ` AND A.is_reg = '1'`;
    } else if (filters.reg === "x") {
      whereClause += ` AND A.is_reg = '0'`;
    }
  }

  const result = await query(
    `
    SELECT 
      A.id, 
      A.name, 
      A.sex, 
      A.status, 
      A.is_reg,
      A.id_farm, 
      A.id_user, 
      A.time_added,
      Di.blood_percent,
      Di.id_stoodbook,
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
  `,
    params,
  );
  return result.rows;
}

export default async function AllGoatsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const searchParams = await searchParamsPromise;
  const filters = {
    q: searchParams.q,
    breed: searchParams.breed,
    sex: searchParams.sex,
    view: searchParams.view,
    reg: searchParams.reg,
  };

  const [goats, breeds] = await Promise.all([
    getAllGoats(filters),
    getBreeds(),
  ]);

  const user = await getSessionUser();

  const cookieStore = await cookies();
  const lang = (cookieStore.get("nxt-lang")?.value as Locale) || "ru";
  const t = getTranslation(lang);

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-8 px-2 md:px-6 lg:px-8 font-sans leading-tight text-gray-800">
      <div className="max-w-[1700px] mx-auto space-y-6">
        <Breadcrumbs
          items={[{ label: t.nav.home, href: "/" }, { label: t.nav.registry }]}
        />
        <GoatFilters breeds={breeds} lang={lang} t={t} />

        {/* <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b-2 border-primary/5">
          <div>
            <h1 className="text-2xl font-black text-primary uppercase tracking-tighter leading-none">
              {t.nav.registry}
            </h1>
            <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mt-1 font-mono">
              {t.goats.globalDatabase} • {goats.length} {t.goats.records}
            </p>
          </div>
        </div> */}

        

        <div className="overflow-hidden border border-gray-300 shadow-sm transition-all duration-300">
          <div className="overflow-x-auto overflow-y-auto max-h-[70vh] custom-scrollbar">
            <table className="w-full text-left border-collapse table-auto min-w-[1200px]">
              <thead className="sticky top-0 z-30 shadow-sm transition-all duration-300">
                <tr className="text-[10px] font-black uppercase tracking-tight text-white bg-[#4D2C1A] text-center h-10 border-b border-gray-400">
                  <th className="p-2 border-r border-white/10 w-64 sticky left-0 z-40 bg-[#491907]">
                    {t.goats.nickname}
                  </th>
                  <th className="p-2 border-r border-white/10 w-24 text-[#B5E6FF]">
                    Σ %
                  </th>
                  <th className="p-2 border-r border-white/10 w-40">
                    {t.goats.uniqueCode}
                  </th>
                  <th className="p-2 border-r border-white/10 w-32">
                    {t.goats.sex}
                  </th>
                  <th className="p-2 border-r border-white/10 w-48">
                    {t.goats.breed}
                  </th>
                  <th className="p-2 border-r border-white/10 w-56 text-[#E2F0D9]">
                    {t.goats.offspringPlus}
                  </th>
                  <th className="p-2 border-r border-white/10 w-40">
                    {t.goats.added}
                  </th>
                  <th className="p-2 border-r border-white/10 w-40">
                    {t.goats.operator}
                  </th>
                  <th className="p-2 w-20">{t.goats.managementShort}</th>
                </tr>
              </thead>
              <tbody className="text-[10px] uppercase font-bold text-gray-700 bg-white">
                {goats.map((goat: any, idx: number) => {
                  const uniqueCode =
                    (goat.is_reg ? "R" : "X") + (10000 + Number(goat.id));
                  let rowBg = "bg-white";
                  if (goat.status === 0) rowBg = "bg-[#EF9A9A]/60";
                  else if (goat.is_reg) rowBg = "bg-[#D7FDB5]/60";
                  else rowBg = "bg-[#E3F2FD]/60"; // Light Blue for X rows
                  return (
                    <tr
                      key={goat.id}
                      className={`h-11 border-b border-gray-200 hover:bg-blue-100 transition-all ${rowBg}`}
                    >
                      <td className="p-1 border-r border-gray-100 flex items-center gap-3 sticky left-0 z-10 bg-inherit shadow-[1px_0_0_0_rgba(0,0,0,0.05)] h-full">
                        <div className="w-9 h-9 border border-gray-300 rounded overflow-hidden flex-shrink-0 bg-white shadow-sm ml-1">
                          {goat.main_photo ? (
                            <img
                              src={`/uploads/${goat.main_photo}`}
                              alt=""
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-[8px]">
                              NO IMG
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const canAccess = user && (user.role >= 10 || user.id === goat.id_user);
                            if (!canAccess) {
                              return (
                                <span className="text-[#491907] text-lg font-bold">
                                  {goat.name}
                                </span>
                              );
                            }
                            return (
                              <a
                                href={`/goats/${goat.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-amber-900 text-lg underline underline-offset-2 overflow-hidden text-ellipsis whitespace-nowrap font-bold"
                              >
                                {goat.name}
                              </a>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="p-2 border-r text-md border-gray-100 text-center font-black text-blue-700 bg-blue-50/20">
                        {goat.blood_percent ? `${goat.blood_percent}%` : "-"}
                      </td>

                      <td className="p-2 border-r text-lg border-gray-100 text-center font-mono text-gray-800 font-bold">
                        {uniqueCode}
                      </td>
                      <td className="p-2 border-r text-md border-gray-100 text-center font-black">
                        {goat.sex === 1
                          ? t.goats.maleShort
                          : t.goats.femaleShort}
                      </td>
                      <td className="p-2 border-r text-md border-gray-100 text-center font-black opacity-80">
                        {goat.breed_alias || goat.breed_name}
                      </td>
                      <td className="p-2 border-r text-md border-gray-100 text-center flex items-center justify-center gap-4 h-full">
                        <a
                          href={`/goats/${goat.id}/offspring?sex=male`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {t.goats.sonPlus}
                        </a>
                        <a
                          href={`/goats/${goat.id}/offspring?sex=female`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {t.goats.daughterPlus}
                        </a>
                      </td>
                      <td className="p-2 border-r text-md border-gray-100 text-center opacity-60 font-mono">
                        {goat.time_added
                          ? new Date(goat.time_added).toLocaleDateString(
                              lang === "ru" ? "ru-RU" : "en-US",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "-"}
                      </td>
                      <td className="p-2 border-r text-md border-gray-100 text-center text-gray-400 font-black">
                        {goat.operator || "SYSTEM"}
                      </td>
                      <td className="p-2 text-center">
                        <a
                          href={`/catalog/goats/fix/${goat.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 bg-white border border-gray-300 rounded-sm hover:border-amber-900 hover:text-amber-900 transition-colors shadow-sm font-black text-xs text-blue-600"
                          title="Management / Edit"
                        >
                          P
                        </a>
                      </td>
                    </tr>
                  );
                })}
                {goats.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-32 text-center text-gray-200 font-black uppercase tracking-[1em] text-2xl"
                    >
                      {t.goats.emptyRegistry}
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
