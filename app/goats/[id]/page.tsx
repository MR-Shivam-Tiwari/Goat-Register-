import { query } from "@/lib/db";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { cookies } from "next/headers";
import { getTranslation, Locale } from "@/lib/translations";
import GoatTable from "@/components/GoatTable";

export const dynamic = "force-dynamic";

async function getGoatData(id: string) {
  const result = await query(
    `
      SELECT 
        A.name, A.sex, A.id AS id, A.status, A.time_added, A.id_farm, A.id_mother, A.id_father,
        Di.is_abg, Di.manuf, Di.owner, Di.date_born, Di.born_weight, Di.born_qty,
        Di.horns_type, Di.have_gen, Di.gen_mat, Di.id_stoodbook,
        Di.code_ua, Di.code_abg, Di.code_farm, Di.code_chip, Di.code_int, Di.code_brand,
        Di.source, Di.special, Di.cert_serial, Di.cert_no,

        M.name  AS m_name,  M.id AS m_id,
        Dm.code_ua AS m_code_ua, Dm.code_abg AS m_code_abg,
        Dm.code_farm AS m_code_farm, Dm.code_chip AS m_code_chip,
        Dm.code_int AS m_code_int, Dm.code_brand AS m_code_brand,

        F.name  AS f_name,  F.id AS f_id,
        Df.code_ua AS f_code_ua, Df.code_abg AS f_code_abg,
        Df.code_farm AS f_code_farm, Df.code_chip AS f_code_chip,
        Df.code_int AS f_code_int, Df.code_brand AS f_code_brand,

        T.test_type, T.score_total, T.par_1, T.par_2, T.par_3, T.par_4,
        T.class AS cert_class, T.category,

        L.viewer, L.lact_no, L.lact_days, L.milk, L.fat, L.protein, L.milk_day, L.have_graph,

        Frm.name AS farm_name,
        B.name as breed_name, B.alias as breed_alias,
        S.name as studbook_name
      FROM animals A
      LEFT JOIN goats_data Di    ON A.id = Di.id_goat
      LEFT JOIN breeds B         ON Di.id_breed = B.id
      LEFT JOIN animals M        ON A.id_mother = M.id
      LEFT JOIN goats_data Dm    ON M.id = Dm.id_goat
      LEFT JOIN animals F        ON A.id_father = F.id
      LEFT JOIN goats_data Df    ON F.id = Df.id_goat
      LEFT JOIN goats_test T     ON A.id = T.id_goat
      LEFT JOIN goats_lact L     ON L.id = Di.id_lact_show
      LEFT JOIN farms Frm        ON A.id_farm = Frm.id
      LEFT JOIN stoodbook S      ON Di.id_stoodbook = S.id
      WHERE A.id = $1
  `,
    [id],
  );
  return result.rows[0];
}

async function getOffspringDetailed(id: string) {
  const result = await query(
    `
      SELECT 
        A.name, A.sex, A.id AS id, A.status, A.time_added, A.id_farm,
        Di.is_abg, Di.manuf, Di.owner, Di.date_born, Di.born_weight, Di.born_qty,
        Di.horns_type, Di.have_gen, Di.gen_mat, Di.id_stoodbook,
        Di.code_ua, Di.code_abg, Di.code_farm, Di.code_chip, Di.code_int, Di.code_brand,
        Di.source, Di.special, Di.cert_serial, Di.cert_no,

        M.name  AS m_name,  M.id AS m_id,
        Dm.code_ua AS m_code_ua, Dm.code_abg AS m_code_abg,

        F.name  AS f_name,  F.id AS f_id,
        Df.code_ua AS f_code_ua, Df.code_abg AS f_code_abg,

        T.test_type, T.score_total, T.par_1, T.par_2, T.par_3, T.par_4,
        T.class AS cert_class, T.category,

        L.viewer, L.lact_no, L.lact_days, L.milk, L.fat, L.protein, L.milk_day, L.have_graph,

        Frm.name AS farm_name,
        B.name as breed_name
      FROM animals A
      LEFT JOIN goats_data Di    ON A.id = Di.id_goat
      LEFT JOIN breeds B         ON Di.id_breed = B.id
      LEFT JOIN animals M        ON A.id_mother = M.id
      LEFT JOIN goats_data Dm    ON M.id = Dm.id_goat
      LEFT JOIN animals F        ON A.id_father = F.id
      LEFT JOIN goats_data Df    ON F.id = Df.id_goat
      LEFT JOIN goats_test T     ON A.id = T.id_goat
      LEFT JOIN goats_lact L     ON L.id = Di.id_lact_show
      LEFT JOIN farms Frm        ON A.id_farm = Frm.id
      WHERE (A.id_mother = $1 OR A.id_father = $1)
      ORDER BY A.time_added DESC
  `,
    [id],
  );
  return result.rows;
}

async function getGallery(id: string) {
  const result = await query(
    "SELECT file FROM goats_pic WHERE id_goat = $1 ORDER BY time_added DESC",
    [id],
  );
  return result.rows;
}

async function getLactation(id: string) {
  const result = await query(
    "SELECT * FROM goats_lact WHERE id_goat = $1 ORDER BY lact_no ASC",
    [id],
  );
  return result.rows;
}

async function getAncestors(rootId: number | null) {
  if (!rootId) return null;

  const res = await query(`
    WITH RECURSIVE ancestry AS (
      SELECT id, name, id_father, id_mother, sex, 0 as level 
      FROM animals 
      WHERE id = $1
      UNION ALL
      SELECT a.id, a.name, a.id_father, a.id_mother, a.sex, anc.level + 1
      FROM animals a
      JOIN ancestry anc ON (a.id = anc.id_mother OR a.id = anc.id_father)
      WHERE anc.level < 4
    )
    SELECT a.*, d.code_ua 
    FROM ancestry a
    LEFT JOIN goats_data d ON a.id = d.id_goat
  `, [rootId]);

  const rows = res.rows;
  const nodes = new Map();
  rows.forEach(r => nodes.set(r.id, r));

  function buildTree(id: number | null): any {
    if (!id || !nodes.has(id)) return null;
    const node = { ...nodes.get(id) };
    node.father = buildTree(node.id_father);
    node.mother = buildTree(node.id_mother);
    return node;
  }

  return buildTree(rootId);
}

async function getOwnMilkProductivity(id: string) {
  const res = await query(
    `SELECT 
      par_0 as lact_no, 
      par_1 as lact_days, 
      par_2 as milk, 
      par_3 as fat, 
      par_4 as protein,
      par_5 as lactose,
      par_6 as peak_yield,
      par_7 as avg_yield,
      par_8 as density,
      par_9 as flow_rate,
      have_graph,
      source,
      time_added as added
    FROM goats_milk 
    WHERE id_goat = $1 
    ORDER BY par_0 ASC`,
    [id],
  );
  return res.rows;
}

async function getExpertAssessment(id: string) {
  const res = await query(
    `SELECT * FROM goats_test WHERE id_goat = $1 ORDER BY date_test DESC`,
    [id],
  );
  return res.rows;
}

async function getCertData(id: string) {
  const result = await query("SELECT * FROM goats_cert WHERE id_goat = $1", [
    id,
  ]);
  return result.rows[0] || {};
}

async function getAncestorLactations(id: string) {
  const treeRes = await query(
    `
    WITH RECURSIVE ancestry AS (
      SELECT id, name, id_mother, id_father, 0 as level, 'ME' as path FROM animals WHERE id = $1
      UNION ALL
      SELECT a.id, a.name, a.id_mother, a.id_father, anc.level + 1,
             CASE 
               WHEN a.id = anc.id_mother THEN anc.path || 'M' 
               WHEN a.id = anc.id_father THEN anc.path || 'F'
             END
      FROM animals a
      JOIN ancestry anc ON (a.id = anc.id_mother OR a.id = anc.id_father)
      WHERE anc.level < 4
    )
    SELECT id, name, path FROM ancestry
  `,
    [id],
  );

  const ids = treeRes.rows.map((r: any) => r.id);
  if (ids.length === 0) return {};

  const lactRes = await query(
    `
    SELECT L.*, A.name as goat_name 
    FROM goats_lact L 
    JOIN animals A ON L.id_goat = A.id 
    WHERE L.id_goat = ANY($1)
    ORDER BY L.lact_no ASC
  `,
    [ids],
  );

  const groups: any = {};
  lactRes.rows.forEach((l: any) => {
    if (!groups[l.id_goat]) groups[l.id_goat] = [];
    groups[l.id_goat].push(l);
  });

  const pathMap: any = {};
  treeRes.rows.forEach((r: any) => {
    pathMap[r.path] = {
      id: r.id,
      name: r.name,
      lactations: groups[r.id] || [],
    };
  });

  return pathMap;
}

export default async function GoatDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  const goat = await getGoatData(id);

  if (!goat)
    return (
      <div className="p-40 text-center text-4xl font-black text-primary uppercase bg-[#F0F4F0] min-h-screen">
        ANIMAL NOT FOUND
      </div>
    );

  const [
    descendants,
    gallery,
    lactation,
    ancestry,
    ownMilk,
    expertTests,
    certData,
    ancestorLacts,
  ] = await Promise.all([
    getOffspringDetailed(id),
    getGallery(id),
    getLactation(id),
    getAncestors(parseInt(id)),
    getOwnMilkProductivity(id),
    getExpertAssessment(id),
    getCertData(id),
    getAncestorLactations(id),
  ]);

  const cookieStore = await cookies();
  const lang = (cookieStore.get("nxt-lang")?.value as Locale) || "ru";
  const t = getTranslation(lang);

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-sans tracking-tight">
      <div className="max-w-8xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Breadcrumbs
          items={[
            { label: t.nav.registry, href: "/catalog/goats" },
            { label: goat.name },
          ]}
        />

        {/* HEADER SECTION - PREMIUM CARD */}
        <div className="bg-white rounded-lg shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-[#491907] to-[#713117]">
            <div className="absolute -bottom-1 left-8 flex items-end gap-6">
              <div className="w-24 h-24 bg-white rounded-xl shadow-lg border-4 border-white overflow-hidden">
                {goat.ava ? (
                  <img src={goat.ava} className="w-full h-full object-cover" alt={goat.name} />
                ) : (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300 font-black text-2xl lowercase">
                    {goat.name[0]}
                  </div>
                )}
              </div>
              <div className="pb-2">
                <h1 className="text-3xl font-black text-white drop-shadow-sm tracking-tight">
                  {goat.name}
                </h1>
                <p className="text-white/80 font-bold text-[10px] uppercase tracking-[0.2em]">
                  {goat.breed_name} • {goat.sex === 1 ? t.goats.male : t.goats.female}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-14 pb-8 px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex gap-8 items-center text-[10px] font-black uppercase">
               <div className="flex flex-col gap-0.5">
                  <span className="text-gray-400 font-bold text-[8px] tracking-widest">{t.goats.registryCode}</span>
                  <span className="text-[#491907] font-black text-xs">{goat.code_ua || goat.id}</span>
               </div>
               {goat.f_id && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400 font-bold text-[8px] tracking-widest">{t.goats.fatherData}</span>
                    <Link href={`/goats/${goat.f_id}`} className="text-blue-700 hover:text-blue-900 underline decoration-blue-200">
                      {goat.f_name}
                    </Link>
                  </div>
                )}
                {goat.m_id && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400 font-bold text-[8px] tracking-widest">{t.goats.motherData}</span>
                    <Link href={`/goats/${goat.m_id}`} className="text-blue-700 hover:text-blue-900 underline decoration-pink-200">
                      {goat.m_name}
                    </Link>
                  </div>
                )}
            </div>

            <div className="flex gap-2">
               <button className="px-4 py-2 bg-[#491907] text-white rounded-lg text-[10px] font-black tracking-widest uppercase hover:bg-black transition-all shadow-md active:scale-95">
                  Print Certificate
               </button>
               <button className="px-4 py-2 bg-white border border-[#491907]/10 text-[#491907] rounded-lg text-[10px] font-black tracking-widest uppercase hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                  Edit Records
               </button>
            </div>
          </div>
        </div>

        {/* BASIC INFO TABLE SECTION */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-[#491907] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.basicInfo}
            </h3>
          </div>
          <div className="p-0 overflow-hidden">
            <GoatTable goats={[goat]} t={t} isMain />
          </div>
        </section>

        {/* GALLERY SECTION */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[#491907] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.gallery}
            </h2>
            <div className="flex items-center gap-4 text-[10px]">
              <label className="cursor-pointer bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-bold hover:bg-blue-100 transition-all flex items-center gap-2">
                 <span>{t.goats.add} photo</span>
                 <input type="file" className="hidden" />
              </label>
              <button className="text-gray-400 hover:text-[#491907] transition-all">
                {t.goats.refresh}
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              {gallery.length > 0 ? (
                gallery.map((p: any, idx: number) => (
                  <div
                    key={idx}
                    className="w-32 aspect-[4/3] bg-white border border-gray-100 p-1 rounded-xl shadow-sm group relative overflow-hidden ring-1 ring-gray-200"
                  >
                    <img
                      src={`/img/${p.file}`}
                      className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                       <span className="text-white text-[10px] font-black uppercase tracking-widest underline decoration-white/30 decoration-2">view</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl">
                   <span className="text-[10px] italic opacity-40 uppercase tracking-widest">
                     No photos in gallery
                   </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* PEDIGREE SECTION */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-[#491907] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.pedigree}: {goat.name}
            </h2>
          </div>
          <div className="p-6 md:p-10">
            <div className="rounded-lg border border-gray-200 shadow-xl shadow-gray-100/50 overflow-hidden ring-1 ring-black/5">
              <PedigreeChart ancestry={ancestry} />
            </div>
          </div>
        </section>

        {/* OFFSPRING & DESCENDANTS */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[#491907] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.offspring}
            </h2>
          </div>
          <div className="p-6 space-y-8">
            <div className="overflow-x-auto rounded-lg border border-gray-100 shadow-sm">
              <table className="w-full text-center text-[9px] border-collapse font-black uppercase whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-100 text-[#491907]">
                  <tr className="divide-x bg-red-200 divide-gray-100">
                    <th className="p-3">{t.goats.sons}</th>
                    <th className="p-3">{t.goats.daughters}</th>
                    <th className="p-3">{t.goats.grandsons}</th>
                    <th className="p-3">{t.goats.granddaughters}</th>
                    <th className="p-3">{t.goats.grgrandsons}</th>
                    <th className="p-3">{t.goats.grgranddaughters}</th>
                    <th className="p-3">{t.goats.grgrgrandsons}</th>
                    <th className="p-3">{t.goats.grgrgranddaughters}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-x divide-gray-100">
                  <tr>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        {descendants.filter(d => d.sex === 1).length > 0 ? descendants.filter(d => d.sex === 1).map(d => (
                          <Link key={d.id} href={`/goats/${d.id}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                            {d.nickname || d.name}
                          </Link>
                        )) : <span className="opacity-20">-</span>}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        {descendants.filter(d => d.sex === 0).length > 0 ? descendants.filter(d => d.sex === 0).map(d => (
                          <Link key={d.id} href={`/goats/${d.id}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                            {d.nickname || d.name}
                          </Link>
                        )) : <span className="opacity-20">-</span>}
                      </div>
                    </td>
                    <td className="p-3 opacity-20">-</td>
                    <td className="p-3 opacity-20">-</td>
                    <td className="p-3 opacity-20">-</td>
                    <td className="p-3 opacity-20">-</td>
                    <td className="p-3 opacity-20">-</td>
                    <td className="p-3 opacity-20">-</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-2">
              <h3 className="text-[#491907] text-[9px] font-black uppercase tracking-widest opacity-60">
                {t.goats.directDescendantsTitle}
              </h3>
              <div className="rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <GoatTable goats={descendants} t={t} />
              </div>
            </div>
          </div>
        </section>

        {/* OWN MILK PRODUCTIVITY */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[#491907] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.ownProductivityTitle}
            </h2>
            <button className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase hover:bg-blue-100 transition-all">
              {t.goats.add} record
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-center text-[9px] border-collapse font-black uppercase whitespace-nowrap">
              <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100/50 text-emerald-800">
                <tr className="divide-x divide-emerald-100">
                  <th className="p-3">№</th>
                  <th className="p-3">{t.goats.lactNo}</th>
                  <th className="p-3">{t.goats.lactDays}</th>
                  <th className="p-3">{t.goats.lactMilk}</th>
                  <th className="p-3">{t.goats.lactFat}</th>
                  <th className="p-3">{t.goats.lactProtein}</th>
                  <th className="p-3">{t.goats.lactose}</th>
                  <th className="p-3">{t.goats.peakMilk}</th>
                  <th className="p-3">{t.goats.lactMilkDay}</th>
                  <th className="p-3">{t.goats.density}</th>
                  <th className="p-3">{t.goats.flowRate}</th>
                  <th className="p-3">{t.goats.lactGraph}</th>
                  <th className="p-3">{t.goats.source}</th>
                  <th className="p-3">{t.goats.editShort}</th>
                  <th className="p-3">{t.goats.added}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ownMilk.map((m: any, idx: number) => (
                  <tr
                    key={idx}
                    className="divide-x divide-gray-100 hover:bg-emerald-50/20 transition-colors"
                  >
                    <td className="p-3 text-gray-400">{idx + 1}</td>
                    <td className="p-3">{m.lact_no}</td>
                    <td className="p-3">{m.lact_days}</td>
                    <td className="p-3 text-emerald-700 text-[11px] scale-110">{m.milk}</td>
                    <td className="p-3">{m.fat}</td>
                    <td className="p-3">{m.protein}</td>
                    <td className="p-3">{m.lactose || "-"}</td>
                    <td className="p-3">{m.peak_yield || "-"}</td>
                    <td className="p-3">{m.avg_yield || "-"}</td>
                    <td className="p-3">{m.density || "-"}</td>
                    <td className="p-3">{m.flow_rate || "-"}</td>
                    <td className="p-3">
                        {m.have_graph ? (
                           <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-sm">YES</span>
                        ) : "-"}
                    </td>
                    <td className="p-3 truncate max-w-[120px] opacity-60">
                      {m.source || "-"}
                    </td>
                    <td className="p-3">
                       <button className="text-blue-600 hover:text-blue-900 font-bold italic">...</button>
                    </td>
                    <td className="p-3 text-gray-400">
                      {m.added ? new Date(m.added).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))}
                {ownMilk.length === 0 && (
                  <tr>
                    <td colSpan={15} className="py-20 text-gray-300 italic flex items-center justify-center gap-2">
                      <span className="text-xl">🥛</span>
                      {t.catalog.empty}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* EXPERT ASSESSMENT */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[#491907] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.expertAssessment}
            </h2>
            {(goat.cert_no || goat.cert_serial) ? (
              <div className="flex items-center gap-4">
                <Link 
                  href={`/goats/${goat.id}/assessment`}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-black transition-all shadow-sm"
                >
                  {expertTests.length > 0 ? t.goats.editShort : t.goats.add} {t.goats.expertAssessment.replace(':', '')}
                </Link>
                <div className="h-6 w-[1px] bg-gray-200"></div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#491907]/50">
                   <Link href={`/goats/${goat.id}/certificate/1`} className="hover:text-blue-600 hover:underline">Certificate 1</Link>
                   <span className="opacity-30">|</span>
                   <Link href={`/goats/${goat.id}/certificate/2`} className="hover:text-blue-600 hover:underline">Certificate 2</Link>
                </div>
              </div>
            ) : (
              <div className="text-[10px] font-black uppercase text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 border-dashed">
                {t.goats.certNo || 'Certificate'} Required for assessment
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            {expertTests.length > 0 ? (
              <table className="w-full text-[9px] border-collapse text-center uppercase font-black whitespace-nowrap">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 text-blue-800">
                  <tr className="divide-x divide-blue-100">
                    <th className="p-3">{t.goats.breeder}</th>
                    <th className="p-3">{t.goats.added}</th>
                    <th className="p-3">{t.goats.certType}</th>
                    <th className="p-3">{t.goats.certHeightWithers}</th>
                    <th className="p-3">{t.goats.certHeightSacrum}</th>
                    <th className="p-3">{t.goats.certChestCirc}</th>
                    <th className="p-3">{t.goats.certBodyLength}</th>
                    <th className="p-3">Weight (kg)</th>
                    <th className="p-3">{t.goats.certFinalScore}</th>
                    <th className="p-3">{t.goats.certClass}</th>
                    <th className="p-3">{t.goats.certCategory}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {expertTests.map((test: any, i: number) => {
                      const get = (key: string) => {
                        const val = test[key] ?? test[key.charAt(0).toUpperCase() + key.slice(1)];
                        return (val !== null && val !== undefined && val !== "") ? val : "-";
                      };
                      return (
                        <tr
                          key={i}
                          className="divide-x divide-gray-100 hover:bg-blue-50/20 transition-colors"
                        >
                          <td className="p-3 truncate max-w-[150px] font-bold">
                            {get('who_expert')}
                          </td>
                          <td className="p-3 text-gray-400">
                            {test.date_test || test.Date_test
                              ? new Date(test.date_test || test.Date_test).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="p-3 opacity-60">
                            {test.test_type === 1 || test.Test_type === 1 ? "Classical" : "Young"}
                          </td>
                          <td className="p-3">{get('par_1')}</td>
                          <td className="p-3">{get('par_2')}</td>
                          <td className="p-3">{get('par_3')}</td>
                          <td className="p-3">{get('par_4')}</td>
                          <td className="p-3">{get('weight')}</td>
                          <td className="p-3 text-red-600 text-[11px] scale-105">
                            {get('score_total')}
                          </td>
                          <td className="p-3">
                             <span className="px-2 py-0.5 bg-gray-100 rounded-lg">{get('class')}</span>
                          </td>
                          <td className="p-3">{get('category')}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            ) : (
              <div className="py-20 text-gray-300 italic flex flex-col items-center justify-center gap-1">
                 <span className="text-xl">📋</span>
                 {t.catalog.empty}
              </div>
            )}
          </div>
        </section>

        {/* CERT DATA SELECTOR */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[#491907] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.certLactDataTitle}
            </h2>
            <button className="bg-white border border-gray-200 px-3 py-1 rounded-lg text-[10px] font-black uppercase hover:bg-gray-50 transition-all shadow-sm">
              {t.goats.refresh}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[9px] border-collapse font-black text-center uppercase whitespace-nowrap">
              <thead className="bg-gray-100 border-b border-gray-200 text-[#491907]">
                <tr className="divide-x divide-gray-200">
                  <th className="p-3">{t.goats.lactViewer}</th>
                  <th className="p-3 w-[25%] uppercase">{t.goats.certChoice}</th>
                  <th className="p-3">{t.goats.lactNo}</th>
                  <th className="p-3">{t.goats.lactDays}</th>
                  <th className="p-3">{t.goats.lactMilk}</th>
                  <th className="p-3">{t.goats.lactFat}</th>
                  <th className="p-3">{t.goats.lactProtein}</th>
                  <th className="p-3">{t.goats.lactMilkDay}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <CertRows
                  label="П"
                  count={5}
                  bgColor="bg-[#F6B8EB]/10"
                  certData={certData}
                  ancestorLacts={ancestorLacts}
                  pathPrefix="i"
                  pathKey="ME"
                />
                <CertRows
                  label="М"
                  count={3}
                  bgColor="bg-[#F8DAB8]/20"
                  certData={certData}
                  ancestorLacts={ancestorLacts}
                  pathPrefix="m"
                  pathKey="MEM"
                />
                <CertRows
                  label="О"
                  count={3}
                  bgColor="bg-[#F8CBAD]/15"
                  certData={certData}
                  ancestorLacts={ancestorLacts}
                  pathPrefix="f"
                  pathKey="MEF"
                />
                <CertRows
                  label="ММ"
                  count={3}
                  bgColor="bg-gray-50"
                  certData={certData}
                  ancestorLacts={ancestorLacts}
                  pathPrefix="mm"
                  pathKey="MEMM"
                />
                <CertRows
                  label="ОМ"
                  count={3}
                  bgColor="bg-gray-50/50"
                  certData={certData}
                  ancestorLacts={ancestorLacts}
                  pathPrefix="fm"
                  pathKey="MEMF"
                />
                <CertRows
                  label="МО"
                  count={3}
                  bgColor="bg-gray-50"
                  certData={certData}
                  ancestorLacts={ancestorLacts}
                  pathPrefix="mf"
                  pathKey="MEFM"
                />
                <CertRows
                  label="ОО"
                  count={3}
                  bgColor="bg-gray-50/50"
                  certData={certData}
                  ancestorLacts={ancestorLacts}
                  pathPrefix="ff"
                  pathKey="MEFF"
                />
              </tbody>
            </table>
          </div>
        </section>

        {/* 3RD GEN PRODUCTIVITY */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-[#491907] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.thirdGenProductivity}
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-300 border border-gray-100 rounded-lg overflow-hidden shadow-sm">
               {[
                 { l: "MMM", f: "id_mmm_row1" },
                 { l: "BMM", f: "id_fmm_row1" },
                 { l: "MBM", f: "id_mfm_row1" },
                 { l: "BBM", f: "id_ffm_row1" },
                 { l: "MMB", f: "id_mmf_row1" },
                 { l: "BMB", f: "id_fmf_row1" },
                 { l: "MBB", f: "id_mff_row1" },
                 { l: "BBB", f: "id_fff_row1" },
               ].map((item, i) => (
                 <div key={i} className="bg-gray-300 p-4 flex flex-col items-center gap-2 group hover:bg-red-50/10 transition-colors">
                    <span className="text-[10px] font-black text-[#491907] bg-red-300 px-3 py-1 rounded-full scale-95 shadow-sm">
                       {item.l}
                    </span>
                    <div className="w-full">
                       {certData[item.f] ? (
                         <div className="text-center bg-red-200 py-2 text-emerald-600 font-black text-xs">
                            {certData[item.f]}
                         </div>
                       ) : (
                         <input
                           type="text"
                           placeholder="---"
                           className="w-full text-[10px] font-black text-center bg-gray-50 border border-gray-100 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all shadow-inner"
                         />
                       )}
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* MOVEMENT DATA SECTION */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-[#491907] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              Animal Movement
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4 text-[10px] font-black uppercase">
               <button className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-blue-100 transition-all">View Movement</button>
               <button className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-blue-100 transition-all">Move Animal</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-50">
               <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Share Invite (Hours)</span>
                    <input type="text" defaultValue="1" className="w-16 border border-gray-200 rounded-lg p-2 font-black text-center focus:ring-2 focus:ring-blue-100 outline-none" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Generations</span>
                    <input type="text" defaultValue="2" className="w-16 border border-gray-200 rounded-lg p-2 font-black text-center focus:ring-2 focus:ring-blue-100 outline-none" />
                  </div>
               </div>
               <div className="flex items-end gap-2 pb-1">
                  <div className="flex-1 flex flex-col gap-2">
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Invite Link</span>
                     <input type="text" placeholder="Link will appear here..." className="w-full border border-gray-200 rounded-lg p-2 font-black bg-gray-50 text-gray-400 outline-none" />
                  </div>
                  <button className="h-[42px] px-6 bg-[#491907] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                    Generate
                  </button>
               </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function CertRows({
  label,
  count,
  bgColor,
  certData,
  ancestorLacts,
  pathPrefix,
  pathKey,
}: any) {
  const rows = [];
  const node = ancestorLacts[pathKey] || { name: "?", lactations: [] };

  for (let i = 1; i <= count; i++) {
    const fieldName = `id_${pathPrefix}_row${i}`;
    const selectedId = certData[fieldName];
    const selectedLact = node.lactations.find((l: any) => l.id === selectedId);

    rows.push(
      <tr
        key={i}
        className={`${bgColor} divide-x divide-gray-100 border-b border-gray-100 last:border-0 hover:brightness-95 transition-all h-10`}
      >
        <td className="p-1 px-3 font-black text-[#491907] w-12">{label}</td>
        <td className="p-1.5 px-4 text-start min-w-[200px]">
          <select
            className="w-full text-[10px] bg-white border border-gray-200 rounded-md p-1.5 outline-none font-bold shadow-sm focus:ring-2 focus:ring-[#491907]/20 transition-all"
            defaultValue={selectedId || ""}
          >
            <option value="">-- select --</option>
            {node.lactations.map((l: any) => (
              <option key={l.id} value={l.id}>
                L{l.lact_no} • {l.lact_days}d • {l.milk}kg • {l.fat}% • {l.protein}%
              </option>
            ))}
          </select>
        </td>
        <td className="p-1.5 font-bold text-gray-700">{selectedLact?.lact_no || "-"}</td>
        <td className="p-1.5 font-bold text-gray-700">{selectedLact?.lact_days || "-"}</td>
        <td className="p-1.5 font-black text-emerald-600 scale-110">
          {selectedLact?.milk || "-"}
        </td>
        <td className="p-1.5 font-bold text-gray-700">{selectedLact?.fat || "-"}</td>
        <td className="p-1.5 font-bold text-gray-700">{selectedLact?.protein || "-"}</td>
        <td className="p-1.5 font-bold text-gray-600">{selectedLact?.milk_day || "-"}</td>
      </tr>,
    );
  }
  return <>{rows}</>;
}

function PedigreeChart({ ancestry }: { ancestry: any }) {
  if (!ancestry) return null;

  return (
    <div className="flex flex-col w-full text-[9px] uppercase font-black bg-white">
      {/* HEADER STRIPE */}
      <div className="bg-[#491907] flex h-8 items-center border-b border-white/10 px-4">
         <span className="text-white/40 text-[7px] tracking-widest font-black uppercase">Ancestral Lineage (4 Generations)</span>
      </div>

      <div className="flex divide-x divide-gray-400">
        <div className="flex-1 flex flex-col">
          <CompactNode
            node={ancestry.father}
            prefix="O:"
            color="bg-[#C5E0B4]"
            border
          />
          <CompactNode
            node={ancestry.mother}
            prefix="M:"
            color="bg-[#F8CBAD]"
          />
        </div>

        <div className="flex-1 flex flex-col">
          {[ancestry.father, ancestry.mother].map((p, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col border-b last:border-0 border-gray-400"
            >
              <CompactNode
                node={p?.father}
                prefix="O:"
                color="bg-[#E2F0D9]"
                border
              />
              <CompactNode
                node={p?.mother}
                prefix="M:"
                color="bg-[#F6B8EB]/50"
              />
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col">
          {[ancestry.father, ancestry.mother].map((p, i) =>
            [p?.father, p?.mother].map((gp, j) => (
              <div
                key={`${i}-${j}`}
                className="flex-1 flex flex-col border-b last:border-0 border-gray-400"
              >
                <CompactNode
                  node={gp?.father}
                  prefix="O:"
                  color="bg-[#E2F0D9]/40"
                  border
                />
                <CompactNode
                  node={gp?.mother}
                  prefix="M:"
                  color="bg-[#F6B8EB]/30"
                />
              </div>
            )),
          )}
        </div>

        <div className="flex-1 flex flex-col">
          {[ancestry.father, ancestry.mother].map((p, i) =>
            [p?.father, p?.mother].map((gp, j) =>
              [gp?.father, gp?.mother].map((ggp, k) => (
                <div
                  key={`${i}-${j}-${k}`}
                  className="flex-1 flex flex-col border-b last:border-0 border-gray-300"
                >
                  <CompactNode
                    node={ggp?.father}
                    prefix="O:"
                    color="bg-gray-100"
                    border
                  />
                  <CompactNode
                    node={ggp?.mother}
                    prefix="M:"
                    color="bg-gray-50"
                  />
                </div>
              )),
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function CompactNode({ node, prefix, color, border }: any) {
  return (
    <div
      className={`flex-1 min-h-[32px] p-1.5 flex items-center gap-1 leading-tight ${color} ${border ? "border-b border-gray-400" : ""}`}
    >
      {node ? (
        <>
          <span className={prefix === "O:" ? "text-blue-600" : "text-pink-600"}>
            {prefix}
          </span>
          <Link
            href={`/goats/${node.id}`}
            className="hover:underline truncate max-w-[110px]"
          >
            {node.name}
          </Link>
          <span className="opacity-50 text-[7px] font-bold">
            ({node.code_ua || node.id})
          </span>
        </>
      ) : (
        <span className="opacity-10">-</span>
      )}
    </div>
  );
}
