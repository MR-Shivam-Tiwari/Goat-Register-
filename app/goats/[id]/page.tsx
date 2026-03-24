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

async function getAncestors(
  id: number | null,
  level: number = 0,
): Promise<any> {
  if (level >= 4 || !id) return null;
  const res = await query(
    "SELECT id, name, id_father, id_mother, sex FROM animals WHERE id = $1",
    [id],
  );
  if (res.rows.length === 0) return null;
  const g = res.rows[0];
  const dataRes = await query(
    "SELECT code_ua FROM goats_data WHERE id_goat = $1",
    [g.id],
  );
  g.code_ua = dataRes.rows[0]?.code_ua;

  return {
    ...g,
    father: await getAncestors(g.id_father, level + 1),
    mother: await getAncestors(g.id_mother, level + 1),
  };
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
    `SELECT 
      who_expert, 
      date_test, 
      test_type, 
      par_1 as height_wither, 
      par_2 as height_rump, 
      par_3 as chest_girth, 
      par_4 as body_length, 
      weight, 
      score_total, 
      class, 
      category
    FROM goats_test 
    WHERE id_goat = $1`,
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
      <div className="max-w-[2000px] mx-auto p-4 md:p-8 space-y-12">
        <Breadcrumbs
          items={[
            { label: t.nav.registry, href: "/catalog/goats" },
            { label: goat.name },
          ]}
        />

        {/* HEADER SECTION */}
        <div className="space-y-4">
          <h1 className="text-[#491907] text-2xl font-black uppercase tracking-tight">
            {t.goats.goatInfo} {goat.name} ({goat.code_ua || goat.id})
          </h1>

          <div className="flex gap-4 text-[10px] font-bold">
            {goat.f_id && (
              <div className="flex items-center gap-1">
                <span className="opacity-50 uppercase">
                  {t.goats.fatherData}:
                </span>
                <Link
                  href={`/goats/${goat.f_id}`}
                  className="text-blue-700 hover:underline px-1.5 py-0.5 bg-blue-50 rounded"
                >
                  {goat.f_name} ({goat.f_code_ua || goat.f_id})
                </Link>
              </div>
            )}
            {goat.m_id && (
              <div className="flex items-center gap-1">
                <span className="opacity-50 uppercase">
                  {t.goats.motherData}:
                </span>
                <Link
                  href={`/goats/${goat.m_id}`}
                  className="text-blue-700 hover:underline px-1.5 py-0.5 bg-pink-50 rounded"
                >
                  {goat.m_name} ({goat.m_code_ua || goat.m_id})
                </Link>
              </div>
            )}
          </div>

          <section className="space-y-1">
            <h3 className="text-[#491907] text-[10px] font-black uppercase">
              {t.goats.basicInfo}
            </h3>
            <div className="border border-[#491907]/10 rounded shadow-sm overflow-hidden bg-white">
              <GoatTable goats={[goat]} t={t} isMain />
            </div>
          </section>
        </div>

        {/* GALLERY SECTION (Image 2 style) */}
        <section className="space-y-4">
          <h2 className="text-[#491907] text-xs font-black uppercase border-b border-gray-100 pb-1">
            {t.goats.gallery}
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 text-[10px]">
              <span className="font-bold opacity-70">
                Add a photo to gallery:
              </span>
              <input
                type="file"
                className="text-[10px] border border-gray-300 p-1 bg-white"
              />
              <button className="px-3 py-1 bg-gray-100 border border-gray-400 font-bold uppercase hover:bg-white active:bg-gray-200">
                {t.goats.refresh}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {gallery.length > 0 ? (
                gallery.map((p: any, idx: number) => (
                  <div
                    key={idx}
                    className="w-24 aspect-[4/3] bg-white border border-gray-300 p-0.5 rounded shadow-sm group relative"
                  >
                    <img
                      src={`/img/${p.file}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all cursor-pointer"></div>
                  </div>
                ))
              ) : (
                <span className="text-[10px] italic opacity-30">
                  No photos in gallery
                </span>
              )}
            </div>
          </div>
        </section>

        {/* PEDIGREE SECTION (Image 1 style) */}
        <section className="space-y-2">
          <h2 className="text-[#491907] text-xs font-black uppercase">
            {t.goats.pedigree}: {goat.name}
          </h2>
          <div className="border border-gray-400 shadow-md overflow-hidden">
            <PedigreeChart ancestry={ancestry} />
          </div>
        </section>

        {/* OFFSPRING & DESCENDANTS (Image 3 style) */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-[#491907] text-xs font-black uppercase">
              {t.goats.offspring}:
            </h2>
            <div className="overflow-x-auto border border-gray-400 shadow-sm">
              <table className="w-full text-center text-[9px] border-collapse font-black uppercase">
                <thead className="bg-[#10FF10] border-b border-gray-400">
                  <tr className="divide-x divide-gray-400">
                    <th className="p-1 px-4">{t.goats.sons}</th>
                    <th className="p-1 px-4">{t.goats.daughters}</th>
                    <th className="p-1 px-4">{t.goats.grandsons}</th>
                    <th className="p-1 px-4">{t.goats.granddaughters}</th>
                    <th className="p-1 px-4">{t.goats.grgrandsons}</th>
                    <th className="p-1 px-4">{t.goats.grgranddaughters}</th>
                    <th className="p-1 px-4">{t.goats.grgrgrandsons}</th>
                    <th className="p-1 px-4">{t.goats.grgrgranddaughters}</th>
                  </tr>
                </thead>
                <tbody className="bg-[#E2F0D9] divide-x divide-gray-400">
                  <tr>
                    <td className="p-2">-</td>
                    <td className="p-2">
                      {descendants
                        .filter((d) => d.sex === 0)
                        .map((d) => (
                          <Link
                            key={d.id}
                            href={`/goats/${d.id}`}
                            className="text-blue-700 hover:underline mx-2"
                          >
                            {d.name}
                          </Link>
                        ))}
                      {descendants.filter((d) => d.sex === 0).length === 0 &&
                        "-"}
                    </td>
                    <td className="p-2">-</td>
                    <td className="p-2">-</td>
                    <td className="p-2">-</td>
                    <td className="p-2">-</td>
                    <td className="p-2">-</td>
                    <td className="p-2">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-[#491907] text-xs font-black uppercase">
              {t.goats.directDescendantsTitle}:
            </h2>
            <div className="border border-gray-300 shadow-sm rounded overflow-hidden">
              <GoatTable goats={descendants} t={t} />
            </div>
          </div>
        </section>

        {/* OWN MILK PRODUCTIVITY (Image 4 style) */}
        <section className="space-y-4">
          <h2 className="text-[#491907] text-xs font-black uppercase flex items-center gap-2">
            {t.goats.ownProductivityTitle}:
            <button className="text-blue-600 text-xs hover:underline font-normal italic lowercase">
              {t.goats.add}
            </button>
          </h2>
          <div className="overflow-x-auto border border-[#491907]/20 shadow-md bg-white">
            <table className="w-full text-center text-[9px] border-collapse font-black uppercase whitespace-nowrap">
              <thead className="bg-[#10FF10] border-b border-gray-400">
                <tr className="divide-x divide-gray-400">
                  <th className="p-1 px-3">№</th>
                  <th className="p-1 px-3">Номер лактации</th>
                  <th className="p-1 px-3">Кол-во дней лактации</th>
                  <th className="p-1 px-3">Удой (кг)</th>
                  <th className="p-1 px-3">Молочный жир (%)</th>
                  <th className="p-1 px-3">Молочный белок (%)</th>
                  <th className="p-1 px-3">Лактоза (%)</th>
                  <th className="p-1 px-3">Суточный пиковый удой (кг)</th>
                  <th className="p-1 px-3">Среднесуточный удой (кг)</th>
                  <th className="p-2 border-r border-gray-400">
                    Плотность (кг)
                  </th>
                  <th className="p-2 border-r border-gray-400">
                    Скорость молокоотдачи (кг/min)
                  </th>
                  <th className="p-1 px-3">График лактационной кривой</th>
                  <th className="p-1 px-3">Источник полученной информации</th>
                  <th className="p-1 px-3">Испр</th>
                  <th className="p-1 px-3">Добавлен</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {ownMilk.map((m: any, idx: number) => (
                  <tr
                    key={idx}
                    className="divide-x divide-gray-300 hover:bg-green-50/50"
                  >
                    <td className="p-2">{idx + 1}</td>
                    <td className="p-2">{m.lact_no}</td>
                    <td className="p-2">{m.lact_days}</td>
                    <td className="p-2 text-red-700">{m.milk}</td>
                    <td className="p-2">{m.fat}</td>
                    <td className="p-2">{m.protein}</td>
                    <td className="p-2">{m.lactose || "-"}</td>
                    <td className="p-2">{m.peak_yield || "-"}</td>
                    <td className="p-2">{m.avg_yield || "-"}</td>
                    <td className="p-2">{m.density || "-"}</td>
                    <td className="p-2">{m.flow_rate || "-"}</td>
                    <td className="p-2">{m.have_graph ? "Да" : "Нет"}</td>
                    <td className="p-2 truncate max-w-[120px]">
                      {m.source || "-"}
                    </td>
                    <td className="p-2 text-blue-600 underline cursor-pointer">
                      ...
                    </td>
                    <td className="p-2">
                      {m.added ? new Date(m.added).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))}
                {ownMilk.length === 0 && (
                  <tr>
                    <td colSpan={15} className="p-8 text-gray-300 italic">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* EXPERT ASSESSMENT (Image 4 style) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-[#491907] text-xs font-black uppercase">
              {t.goats.expertAssessment}:
            </h2>
            <button className="text-blue-600 text-xs hover:underline lowercase italic">
              {t.goats.add}
            </button>
          </div>

          {expertTests.length > 0 && (
            <div className="overflow-x-auto border border-gray-400 shadow-md bg-white">
              <table className="w-full text-[9px] border-collapse text-center uppercase font-black whitespace-nowrap">
                <thead className="bg-[#10FF10] border-b border-gray-400">
                  <tr className="divide-x divide-gray-400">
                    <th className="p-2 px-4 whitespace-nowrap">
                      Зав. (Breeder)
                    </th>
                    <th className="p-2 px-4 whitespace-nowrap">Дата (Date)</th>
                    <th className="p-2 px-4">Тип (Type)</th>
                    <th className="p-2 px-3">Высота (Withers)</th>
                    <th className="p-2 px-3">Крестец (Sacrum)</th>
                    <th className="p-2 px-3">Грудь (Chest)</th>
                    <th className="p-2 px-3">Длина (Length)</th>
                    <th className="p-2 px-3">Вес (Weight)</th>
                    <th className="p-2 px-4 text-red-700">Счет (Score)</th>
                    <th className="p-2 px-3">Класс (Class)</th>
                    <th className="p-2 px-3">Кат. (Cat)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {expertTests.map((test: any, i: number) => (
                    <tr
                      key={i}
                      className="divide-x divide-gray-300 hover:bg-green-50/40 h-8"
                    >
                      <td className="p-1 px-4 truncate max-w-[120px]">
                        {test.who_expert || "-"}
                      </td>
                      <td className="p-1 px-4 whitespace-nowrap">
                        {test.date_test
                          ? new Date(test.date_test).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="p-1 px-4">
                        {test.test_type === 1 ? "Classical" : "Young"}
                      </td>
                      <td className="p-1 px-3">{test.par_1 || "-"}</td>
                      <td className="p-1 px-3">{test.par_2 || "-"}</td>
                      <td className="p-1 px-3">{test.par_3 || "-"}</td>
                      <td className="p-1 px-3">{test.par_4 || "-"}</td>
                      <td className="p-1 px-3">{test.weight || "-"}</td>
                      <td className="p-1 px-4 text-red-700 font-black">
                        {test.score_total}
                      </td>
                      <td className="p-1 px-3">{test.class}</td>
                      <td className="p-1 px-3">{test.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {expertTests.length === 0 && (
            <div className="p-4 bg-gray-50 border border-gray-200 text-[9px] italic text-center text-gray-400">
              No expert assessment records found
            </div>
          )}
        </section>

        {/* CERT DATA SELECTOR (Image 4 style) */}
        <section className="space-y-4 pt-6">
          <div className="flex items-center gap-4">
            <h2 className="text-[#491907] text-xs font-black uppercase">
              {t.goats.certLactDataTitle}:
            </h2>
            <button className="px-3 py-0.5 bg-gray-100 border border-gray-400 text-[9px] font-black uppercase rounded shadow-sm hover:bg-white active:bg-gray-200">
              {t.goats.refresh}
            </button>
          </div>
          <div className="overflow-x-auto border border-gray-400 shadow-md">
            <table className="w-full text-[9px] border-collapse font-black text-center uppercase">
              <thead className="bg-[#10FF10] border-b border-gray-500">
                <tr className="divide-x divide-gray-500">
                  <th className="p-1 px-4">Кто</th>
                  <th className="p-1 px-4 w-[25%] uppercase">Выбор</th>
                  <th className="p-1 px-4">Номер лактации</th>
                  <th className="p-1 px-4">Дней лактации</th>
                  <th className="p-1 px-4">Удой за лактацию в кг</th>
                  <th className="p-1 px-4">Жир %</th>
                  <th className="p-1 px-4">Белок %</th>
                  <th className="p-1 px-4">Среднесуточный удой (кг)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-400">
                <CertRows
                  label="П"
                  count={5}
                  bgColor="bg-[#F6B8EB]"
                  certData={certData}
                  ancestorLacts={ancestorLacts}
                  pathPrefix="i"
                  pathKey="ME"
                />
                <CertRows
                  label="М"
                  count={3}
                  bgColor="bg-[#F8DAB8]"
                  certData={certData}
                  ancestorLacts={ancestorLacts}
                  pathPrefix="m"
                  pathKey="MEM"
                />
                <CertRows
                  label="О"
                  count={3}
                  bgColor="bg-[#E89F98]"
                  certData={certData}
                  ancestorLacts={ancestorLacts}
                  pathPrefix="f"
                  pathKey="MEF"
                />
                <CertRows
                  label="ММ"
                  count={3}
                  bgColor="bg-[#F6ECB8]"
                  certData={certData}
                  ancestorLacts={ancestorLacts}
                  pathPrefix="mm"
                  pathKey="MEMM"
                />
                <CertRows
                  label="ОМ"
                  count={3}
                  bgColor="bg-[#F6BDB8]"
                  certData={certData}
                  ancestorLacts={ancestorLacts}
                  pathPrefix="fm"
                  pathKey="MEMF"
                />
                <CertRows
                  label="МО"
                  count={3}
                  bgColor="bg-[#F6ECB8]"
                  certData={certData}
                  ancestorLacts={ancestorLacts}
                  pathPrefix="mf"
                  pathKey="MEFM"
                />
                <CertRows
                  label="ОО"
                  count={3}
                  bgColor="bg-[#F6BDB8]"
                  certData={certData}
                  ancestorLacts={ancestorLacts}
                  pathPrefix="ff"
                  pathKey="MEFF"
                />
              </tbody>
            </table>
          </div>
        </section>

        {/* 3RD GEN PRODUCTIVITY (Image 5 style) */}
        <section className="space-y-4 pt-4 border-t border-gray-100">
          <h2 className="text-[#491907] text-[10px] font-black uppercase">
            {t.goats.thirdGenProductivity}:
          </h2>
          <div className="grid grid-cols-4 border border-gray-400 text-[9px] font-black uppercase">
            {[
              { l: "MMM", f: "id_mmm_row1" },
              { l: "BMM", f: "id_fmm_row1" },
              { l: "MBM", f: "id_mfm_row1" },
              { l: "BBM", f: "id_ffm_row1" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col border-r last:border-0 border-gray-400 text-center"
              >
                <div className="bg-[#10FF10] p-1 border-b border-gray-400">
                  {item.l}
                </div>
                <div className="bg-[#E2F0D9] p-2 flex items-center justify-center min-h-[40px]">
                  {certData[item.f] ? (
                    <span className="text-red-700 font-black">
                      {certData[item.f]}
                    </span>
                  ) : (
                    <input
                      type="text"
                      className="w-full bg-white border border-gray-300 px-1 text-center h-5 outline-none focus:border-blue-500"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 border border-gray-400 text-[9px] font-black uppercase">
            {[
              { l: "MMB", f: "id_mmf_row1" },
              { l: "BMB", f: "id_fmf_row1" },
              { l: "MBB", f: "id_mff_row1" },
              { l: "BBB", f: "id_fff_row1" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col border-r last:border-0 border-gray-400 text-center"
              >
                <div className="bg-[#10FF10] p-1 border-b border-gray-400">
                  {item.l}
                </div>
                <div className="bg-[#E2F0D9] p-2 flex items-center justify-center min-h-[40px]">
                  {certData[item.f] ? (
                    <span className="text-red-700 font-black">
                      {certData[item.f]}
                    </span>
                  ) : (
                    <input
                      type="text"
                      className="w-full bg-white border border-gray-300 px-1 text-center h-5 outline-none focus:border-blue-500"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MOVEMENT DATA SECTION (From Image 5) */}
        <section className="space-y-4 pt-8 border-t border-gray-100">
          <div className="text-[10px] font-bold space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[#491907] uppercase">
                Движение животного:
              </span>
              <button className="text-blue-600 hover:underline">
                Посмотреть движение
              </button>
              <span className="opacity-20">|</span>
              <button className="text-blue-600 hover:underline">
                Переместить
              </button>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center gap-2">
                <span>Инвайт на эту страницу: На сколько часов:</span>
                <input
                  type="text"
                  defaultValue="1"
                  className="w-8 border border-gray-300 px-1 text-center font-bold"
                />
              </div>
              <div className="flex items-center gap-2">
                <span>Поколений:</span>
                <input
                  type="text"
                  defaultValue="2"
                  className="w-8 border border-gray-300 px-1 text-center font-bold"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <input
                type="text"
                className="w-full max-w-sm border border-gray-300 p-1 font-bold"
                placeholder="Invite link will appear here..."
              />
              <button className="px-4 py-1 bg-gray-100 border border-gray-400 text-[9px] uppercase font-black hover:bg-white active:bg-gray-200">
                Получить
              </button>
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
        className={`${bgColor} divide-x divide-gray-400 border-b border-gray-400 last:border-0 h-8`}
      >
        <td className="p-1.5 font-black">{label}</td>
        <td className="p-1 px-4 text-start">
          <select
            className="w-full text-[9px] bg-white border border-gray-400 p-0.5 outline-none font-bold shadow-sm"
            defaultValue={selectedId || ""}
          >
            <option value="">-- select --</option>
            {node.lactations.map((l: any) => (
              <option key={l.id} value={l.id}>
                {l.lact_no}/{l.lact_days}/{l.milk}/{l.fat}/{l.protein}/
                {l.milk_day}
              </option>
            ))}
          </select>
        </td>
        <td className="p-1.5 font-bold">{selectedLact?.lact_no || "-"}</td>
        <td className="p-1.5 font-bold">{selectedLact?.lact_days || "-"}</td>
        <td className="p-1.5 font-black text-red-700">
          {selectedLact?.milk || "-"}
        </td>
        <td className="p-1.5 font-bold">{selectedLact?.fat || "-"}</td>
        <td className="p-1.5 font-bold">{selectedLact?.protein || "-"}</td>
        <td className="p-1.5 font-bold">{selectedLact?.milk_day || "-"}</td>
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
      <div className="bg-[#491907] flex h-5 border-b border-gray-500">
        <div className="flex-1 border-r border-white/20 flex items-center justify-center text-white text-[7px]">
          •
        </div>
        <div className="flex-1 border-r border-white/20 flex items-center justify-center text-white text-[7px]">
          •
        </div>
        <div className="flex-1 border-r border-white/20 flex items-center justify-center text-white text-[7px]">
          •
        </div>
        <div className="flex-1 flex items-center justify-center text-white text-[7px]">
          •
        </div>
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
