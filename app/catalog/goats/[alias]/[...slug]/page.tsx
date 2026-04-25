import { query } from "@/lib/db";
import Link from "next/link";
import { Suspense } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { cookies } from "next/headers";
import { getTranslation, Locale } from "@/lib/translations";
import FilterCard from "./FilterCard";
import ClassicGoatTable from "@/components/ClassicGoatTable";
import RegistryImage from "@/components/RegistryImage";
import { getSessionUser } from "@/lib/access-control";

export const dynamic = "force-dynamic";

interface Goat {
  name: string;
  sex: number;
  is_abg: number;
  manuf: string;
  owner: string;
  date_born: any;
  time_added: any;
  reg_id: number;
  id_stoodbook: number;
  code_ua: string;
  code_abg: string;
  code_farm: string;
  code_chip: string;
  code_int: string;
  code_brand: string;
  born_weight: number;
  born_qty: number;
  horns_type: string;
  have_gen: string;
  gen_mat: string;
  farm_name: string;
  id_farm?: number;
  source: string;
  special: string;
  // Mother
  m_name?: string;
  m_id?: number;
  m_reg_code?: string;
  m_code_ua?: string;
  m_code_abg?: string;
  m_code_farm?: string;
  m_code_chip?: string;
  m_code_int?: string;
  m_code_brand?: string;
  // Father
  f_name?: string;
  f_id?: number;
  f_reg_code?: string;
  f_code_ua?: string;
  f_code_abg?: string;
  f_code_farm?: string;
  f_code_chip?: string;
  f_code_int?: string;
  f_code_brand?: string;
  // Certification (goats_test)
  test_type?: string;
  score_total?: number;
  par_1?: number;
  par_2?: number;
  par_3?: number;
  par_4?: number;
  cert_class?: string;
  category?: string;
  // Productivity (goats_lact)
  viewer?: string;
  lact_no?: number;
  lact_days?: number;
  milk?: number;
  fat?: number;
  protein?: number;
  milk_day?: number;
  have_graph?: number;
  status: number;
  cert_serial?: string;
  cert_no?: string;
  blood_percent?: string | number;
}

const STOODBOOK_MAP: Record<string, number> = {
  rhb: 1,
  f1: 2,
  f2: 3,
  f3: 4,
  f4: 5,
  f5: 6,
  f6: 7,
  f7: 8,
  f8: 13,
  rfb: 9,
  ex1: 10,
  ex2: 11,
  ex3: 12,
};

function getRegisterNames(t: any): Record<string, string> {
  return {
    rhb: t.rules.rhbTitle,
    f1: `${t.catalog.rcbGen} F1`,
    f2: `${t.catalog.rcbGen} F2`,
    f3: `${t.catalog.rcbGen} F3`,
    f4: `${t.catalog.rcbGen} F4`,
    f5: `${t.catalog.rcbGen} F5`,
    f6: `${t.catalog.rcbGen} F6`,
    f7: `${t.catalog.rcbGen} F7`,
    f8: `${t.catalog.rcbGen} F8`,
    rfb: t.rules.rfbTitle,
    ex1: "RExB",
    ex2: "RExB",
    ex3: "RExB",
  };
}
async function getBreedData(alias: string, lang: string = "ru") {
  if (alias === "all") {
    return {
      id: 0,
      name: lang === "ru" ? "Все породы" : "All Breeds",
      alias: "all",
    };
  }
  const result = await query("SELECT * FROM breeds WHERE alias = $1", [alias]);
  return result.rows[0] as { id: number; name: string; alias: string } | null;
}

async function getBreedPictures(alias: string) {
  const result = await query(
    "SELECT sex, file FROM pictures WHERE TRIM(alias) ILIKE TRIM($1)",
    [alias],
  );
  const pics: Record<number, string> = {};
  result.rows.forEach((p) => (pics[p.sex] = p.file));
  return pics;
}

async function getGoats(
  breed_id: number,
  sex_slug: string,
  reg?: string,
  age?: string,
  showDead?: boolean,
  farmId?: string,
  owner?: string,
) {
  const sex = sex_slug === "male" ? 1 : (sex_slug === "child" ? 2 : 0);
  const statusCondition = showDead ? "A.status = 0" : "A.status = 1";
  let filterClause = "";

  if (age && age !== "all") {
    filterClause += ` AND Di.date_born > (CURRENT_DATE - INTERVAL '${age} month')`;
  }
  if (farmId && farmId !== "all") {
    filterClause += ` AND A.id_farm = ${parseInt(farmId)}`;
  }
  if (owner && owner !== "all") {
    filterClause += ` AND Di.owner = '${owner.replace(/'/g, "''")}'`;
  }

  let sql = `
      SELECT 
        A.id, A.is_reg, A.name, A.sex, A.id AS reg_id, A.status, A.time_added, A.id_farm,
        Di.ava, Di.is_abg, Di.manuf, Di.owner, Di.date_born, Di.born_weight, Di.born_qty,
        Di.horns_type, Di.have_gen, Di.gen_mat, Di.id_stoodbook, Di.blood_percent,
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
        B.name AS breed_name, B.alias AS breed_alias
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
      WHERE A.sex = $1 AND ${statusCondition} ${filterClause}
    `;

  if (breed_id !== 0) {
    sql = sql.replace("WHERE ", "WHERE Di.id_breed = $2 AND ");
  }

  const params: any[] = [sex];
  if (breed_id !== 0) params.push(breed_id);
  let paramIdx = breed_id !== 0 ? 3 : 2;
  if (reg && STOODBOOK_MAP[reg]) {
    sql += ` AND Di.id_stoodbook = $${paramIdx}`;
    params.push(STOODBOOK_MAP[reg]);
    paramIdx++;
  }

  sql += " ORDER BY A.time_added DESC";
  const result = await query(sql, params);
  return result.rows as Goat[];
}

async function getFilterOptions() {
  const breeds = await query("SELECT id, name, alias FROM breeds WHERE alias IS NOT NULL ORDER BY name");
  const farms = await query("SELECT id, name FROM farms ORDER BY name");
  const owners = await query(
    "SELECT DISTINCT owner FROM goats_data WHERE owner IS NOT NULL AND owner != '' ORDER BY owner",
  );
  return {
    breeds: breeds.rows as { id: number; name: string; alias: string }[],
    farms: farms.rows as { id: number; name: string }[],
    owners: owners.rows.map((r) => r.owner) as string[],
  };
}

export default async function GoatsListPage({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: {
  params: Promise<{ alias: string; slug: string[] }>;
  searchParams: Promise<{
    reg?: string;
    age?: string;
    s?: string;
    view?: string;
    farm?: string;
    owner?: string;
    show?: string;
    breed?: string;
  }>;
}) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const { slug } = params;
  const sex = slug[0];
  const status = slug[1];
  const { reg, age, view, farm, owner, show, breed: breedParam } = searchParams;
  const alias = breedParam || params.alias;
  const s = searchParams.s || sex;

  const user = await getSessionUser();

  const cookieStore = await cookies();
  const lang = (cookieStore.get("nxt-lang")?.value as Locale) || "ru";
  const t = getTranslation(lang);
  const REGISTER_NAMES = getRegisterNames(t);

  const breed = await getBreedData(alias, lang);
  if (!breed)
    return (
      <div className="p-40 text-center text-5xl font-black text-primary uppercase">
        {t.catalog.breedNotFound}
      </div>
    );

  const pics = await getBreedPictures(alias);
  const breedImg = `/img/breeds/${alias}.png`;

  // Detect dead/eliminated view from second slug segment
  const isDead = status === "dead";
  const actualSex = s === "dead" ? "female" : s;

  const sexLabel =
    actualSex === "male"
      ? t.goats.male
      : actualSex === "female"
        ? t.goats.female
        : t.catalog.kidsYoung;

  const isUkrainian = ["UAW", "UAC", "UAS"].includes(alias.toUpperCase());
  const breedAliasSimple = alias.trim().toUpperCase();

  const breadcrumbItems: any[] = [
    { label: breed.name, href: `/catalog/goats/${breedAliasSimple}` },
    { label: t.catalog.goats, href: `/catalog/goats/${breedAliasSimple}/${sex}` },
    { label: t.catalog.breedingRegistries }
  ];

  if (reg && !isUkrainian) {
    breadcrumbItems.push({ label: REGISTER_NAMES[reg] || reg });
  } else if (view && !isUkrainian) {
    breadcrumbItems.push({
      label: view === "rcb" ? "Absorption Crossing Registry" : "RExB",
    });
  }

  const showRegisterGrid =
    (sex === "male" || sex === "female") && !reg && !view && !show && !isDead && !isUkrainian;
  const showGenerationGrid = view === "rcb" && !show;
  const showExperimentalGrid = view === "ex" && !show;
  const showKidsGrid = sex === "child" && !age && !show && !isDead;
  const showTable = !!(reg || age || farm || owner || show === "all" || (sex === "child" && age) || isDead || isUkrainian);

  const filterOptions = showTable
    ? await getFilterOptions()
    : { breeds: [], farms: [], owners: [] };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col px-4 font-sans leading-tight text-gray-800 overflow-hidden">
      <div className="max-w-[2800px] w-full mx-auto flex flex-col h-full space-y-2 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-gray-100 mt-10 mb-6">
          <div className="flex-shrink-0">
            <Breadcrumbs items={breadcrumbItems} t={t} />
          </div>
          {showTable && reg !== 'rfb' && (
            <div className="flex flex-wrap items-center gap-3">
                  <FilterCard 
                      label={t.catalog.allBreeds}
                      param="breed"
                      currentValue={alias}
                      options={[{ id: 'all', name: `-- ${t.catalog.allBreeds} --` }, ...filterOptions.breeds.map((b: { alias: string; name: string }) => ({ id: b.alias, name: b.name }))]}
                  />
                  <FilterCard
                      label={t.goats.farm}
                      param="farm"
                      currentValue={farm}
                      options={filterOptions.farms.map(f => ({ id: f.id.toString(), name: f.name }))}
                  />
                  <FilterCard 
                      label={t.goats.owner}
                      param="owner"
                      currentValue={owner}
                      options={filterOptions.owners.map(o => ({ id: o, name: o }))}
                  />
                  <FilterCard 
                      label={t.catalog.age}
                      param="age"
                      currentValue={age}
                      options={[
                          { id: '12', name: t.catalog.upTo12m },
                          { id: '24', name: t.catalog.upTo24m },
                          { id: '36', name: t.catalog.upTo36m },
                          { id: 'all', name: t.catalog.allAges }
                      ]}
                  />
                  <Link href={`/catalog/goats/${alias}/${sex}${reg ? `?reg=${reg}` : "?show=all"}`} className="px-4 bg-[#CFA97A] border h-7 rounded text-[9px] font-black uppercase tracking-widest text-primary hover:bg-black hover:text-white transition-all shadow-sm flex items-center">
                      ← {t.catalog.reset}
                  </Link>
            </div>
          )}
        </div>

        <div className="flex-1  min-h-0 overflow-hidden">
          {showRegisterGrid && (
            <section className="h-full overflow-y-auto space-y-12 pb-10">
            <header className="border-b border-primary/10 pb-8 text-center max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black text-primary mb-4 tracking-tight">
                {t.catalog.registerPage.title}
              </h2>
              <p className="text-sm font-bold opacity-40">
                {t.catalog.registerPage.subtitle} {breed.name}
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-10">
              {[
                {
                  id: "rhb",
                  name: t.catalog.registerPage.rhb,
                  sub: t.catalog.registerPage.rhbSub,
                  code: "RHB",
                  img: "/img/kozi-ang.jpg",
                },
                {
                  id: "rcb",
                  name: t.catalog.registerPage.rcb,
                  sub: t.catalog.registerPage.rcbSub,
                  code: "RCB",
                  img: "/img/kozi-ang.jpg",
                  isFolder: true,
                },
                {
                  id: "rfb",
                  name: t.catalog.registerPage.rfb,
                  desc: t.catalog.registerPage.rfbDesc,
                  code: "RFB",
                  img: "/img/kozi-ang.jpg",
                },
                {
                  id: "ex",
                  name: t.catalog.registerPage.rexb,
                  desc: t.catalog.registerPage.rexbDesc,
                  code: "RExB",
                  img: "/img/kozi-ang.jpg",
                  isFolder: true,
                },
              ].map((item) => (
                <Link
                  key={item.id}
                  href={
                    (item as any).isFolder
                      ? `?view=${item.id}`
                      : `?reg=${item.id}`
                  }
                  className="group flex flex-col bg-white border border-gray-200 h-full transition-colors hover:border-[#441a0e]"
                >
                  <div className="aspect-square w-full overflow-hidden border-b border-gray-100 bg-white flex items-center justify-center p-6">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col items-center text-center p-8 flex-1">
                    <h3 className="text-base font-black text-gray-900 leading-tight mb-2">
                        {item.name}
                    </h3>
                    {item.sub && (
                        <p className="text-[12px] font-bold text-gray-400 tracking-widest mb-4">
                            {item.sub}
                        </p>
                    )}
                    {item.desc && (
                        <p className="text-xs text-gray-500 leading-relaxed max-w-[220px]">
                            {item.desc}
                        </p>
                    )}
                    
                    <div className="w-full mt-auto pt-8">
                        <div className="w-full py-3 bg-[#441a0e] text-white font-black text-[10px] uppercase tracking-[0.25em] text-center rounded-sm">
                            {t.catalog.launch} ➔
                        </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

          {showGenerationGrid && (
            <section className="h-full overflow-y-auto space-y-12 pb-10">
            <header className="border-b border-primary/10 pb-8 text-center max-w-4xl mx-auto">
              <h2 className="text-3xl font-normal text-primary mb-2">
                {t.catalog.registerPage.rcb}
              </h2>
            </header>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {[
                { id: 1, p: '50%' },
                { id: 2, p: '75%' },
                { id: 3, p: '87.5%' },
                { id: 4, p: '93.75%' },
                { id: 5, p: '96.87%' },
                { id: 6, p: '98.43%' },
                { id: 7, p: '99.21%' },
                { id: 8, p: '99.6%' }
              ].map((f) => (
                <Link
                  key={f.id}
                  href={`?reg=f${f.id}`}
                  target="_blank"
                  className="group bg-white p-8 rounded-xl border border-primary/10 hover:border-primary/20 transition-all shadow-sm hover:shadow-xl flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-primary italic">F {f.id}</span>
                      <span className="text-xs font-bold text-primary/30">{f.p}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black tracking-widest text-primary/30 group-hover:text-primary transition-colors block">
                      — {t.catalog.launch.toLowerCase() === 'відкрити' || t.catalog.launch.toLowerCase() === 'open' || t.catalog.launch.toLowerCase() === 'открыть' ? 'открыть' : t.catalog.launch}
                    </span>
                  </div>
                </Link>
              ))}
              <Link
                href={`/catalog/goats/${alias}/${sex}`}
                className="bg-primary/5 rounded-xl p-8 flex items-center justify-center text-primary/40 hover:text-primary transition-colors border border-dashed border-primary/20"
              >
                <span className="text-[10px] font-black uppercase tracking-widest">
                  ← {t.common.back}
                </span>
              </Link>
            </div>
          </section>
        )}

          {showExperimentalGrid && (
            <section className="h-full overflow-y-auto space-y-12 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {[
                {
                  id: "ex1",
                  name: "RExB 1",
                  s: t.catalog.upTo50,
                },
                {
                  id: "ex2",
                  name: "RExB 2",
                  s: t.catalog.upTo75,
                },
                {
                  id: "ex3",
                  name: "RExB 3",
                  s: t.catalog.upTo98,
                },
              ].map((item) => (
                <Link
                  key={item.id}
                  href={`?reg=${item.id}`}
                  className="bg-white rounded-xl p-10 flex flex-col items-center group hover:border-secondary transition-colors border border-primary/10 shadow-sm"
                >
                  <h3 className="text-3xl font-black text-primary mb-2">
                    {item.name}
                  </h3>
                  <span className="text-primary/40 font-black text-sm uppercase tracking-widest">
                    {item.s}
                  </span>
                  <div className="mt-8 px-6 py-2 border border-primary/10 rounded-lg text-primary font-black text-[10px] uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-colors">
                    {t.catalog.launch}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {showKidsGrid && (
            <section className="h-full overflow-y-auto space-y-12 pb-10">
                <header className="border-b border-primary/10 pb-10 text-center max-w-4xl mx-auto">
                    <h2 className="text-3xl font-black text-primary uppercase">
                        {t.catalog.kidsGrid.title}
                    </h2>
                </header>
                
                <div className="grid grid-cols-3 gap-10 max-w-6xl mx-auto pb-10">
                    {[
                        { id: 'male', age: '3', label: t.catalog.kidsGrid.male03 },
                        { id: 'male', age: '6', label: t.catalog.kidsGrid.male36 },
                        { id: 'male', age: '12', label: t.catalog.kidsGrid.male612 },
                        { id: 'female', age: '3', label: t.catalog.kidsGrid.female03 },
                        { id: 'female', age: '6', label: t.catalog.kidsGrid.female36 },
                        { id: 'female', age: '12', label: t.catalog.kidsGrid.female612 },
                    ].map((item, idx) => (
                        <Link 
                            key={idx}
                            href={`?s=${item.id}&age=${item.age}`}
                            className="group flex flex-col items-center text-center"
                        >
                            <div className="aspect-square w-full max-w-[220px] bg-white flex items-center justify-center p-4 mb-4">
                                <img src="/img/kozliata.jpg" className="w-full h-full object-contain transition-transform group-hover:scale-105" alt="" />
                            </div>
                            <div className="px-2">
                                <h3 className="text-[11px] font-normal text-[#491907] leading-tight transition-colors group-hover:text-secondary">
                                    {item.label}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        )}

        {showTable && (
          <section className="h-full flex flex-col space-y-4">
            <header className="hidden">
            </header>

            <div className="flex-1 min-h-0 bg-white border rounded-sm shadow-2xl relative">
              <div className="w-full h-full">
                <Suspense
                  fallback={
                    <div className="p-20 text-center font-black uppercase opacity-20 text-xs text-primary">
                      {t.common.loading}
                    </div>
                  }
                >
                    <GoatTableContainer 
                      breedId={breed.id} 
                      sex={actualSex} 
                      reg={reg} 
                      age={age} 
                      farm={farm} 
                      owner={owner} 
                      t={t} 
                      lang={lang}
                      showDead={isDead}
                      currentUser={user}
                    />
                  </Suspense>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

  async function GoatTableContainer({
    breedId,
    sex,
    reg,
    age,
    farm,
    owner,
    t,
    lang,
    showDead,
    currentUser
  }: {
    breedId: number;
    sex: string;
    reg?: string;
    age?: string;
    farm?: string;
    owner?: string;
    t: any;
    lang: string;
    showDead?: boolean;
    currentUser?: any;
  }) {
    const goats = await getGoats(breedId, sex, reg, age, showDead, farm, owner);
    return <ClassicGoatTable goats={goats} t={t} currentUser={currentUser} />;
  }
