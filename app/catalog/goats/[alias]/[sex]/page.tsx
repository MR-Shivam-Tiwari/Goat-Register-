import { query } from "@/lib/db";
import Link from "next/link";
import { Suspense } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { cookies } from "next/headers";
import { getTranslation, Locale } from "@/lib/translations";
import FilterCard from "./FilterCard";
import GoatTable from "@/components/GoatTable";

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
  rfb: 9,
  ex1: 10,
  ex2: 11,
  ex3: 12,
};

function getRegisterNames(t: any): Record<string, string> {
  return {
    rhb: t.rules.rhbTitle,
    f1: "RCB Generation F1",
    f2: "RCB Generation F2",
    f3: "RCB Generation F3",
    f4: "RCB Generation F4",
    f5: "RCB Generation F5",
    f6: "RCB Generation F6",
    f7: "RCB Generation F7",
    rfb: t.rules.rfbTitle,
    ex1: "Experimental (up to 50%)",
    ex2: "Experimental (51–75%)",
    ex3: "Experimental (76–98%)",
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
  const sex = sex_slug === "male" ? 1 : 0;
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
  params: Promise<{ alias: string; sex: string }>;
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
  const { sex } = params;
  const { reg, age, view, farm, owner, show, breed: breedParam } = searchParams;
  const alias = breedParam || params.alias;
  const s = searchParams.s || sex;

  const cookieStore = await cookies();
  const lang = (cookieStore.get("nxt-lang")?.value as Locale) || "ru";
  const t = getTranslation(lang);
  const REGISTER_NAMES = getRegisterNames(t);

  const breed = await getBreedData(alias, lang);
  if (!breed)
    return (
      <div className="p-40 text-center text-5xl font-black text-primary uppercase">
        Breed not found
      </div>
    );

  const pics = await getBreedPictures(alias);
  const breedImg = `/img/${pics[s === "male" ? 1 : 0] || "noimage.gif"}`;

  // Detect dead/eliminated view
  const isDead = sex === "dead" || (typeof window === "undefined" && false);
  const actualSex = s === "dead" ? "female" : s;

  const sexLabel =
    actualSex === "male"
      ? t.goats.male
      : actualSex === "female"
        ? t.goats.female
        : lang === "ru"
          ? "Молодняк"
          : "Kids (Young)";

  const breadcrumbItems: any[] = [
    { label: t.catalog.breadcrumbs, href: "/catalog/goats" },
    { label: breed.name, href: `/catalog/goats/${alias}` },
    { label: sexLabel },
  ];

  if (reg) {
    breadcrumbItems.push({ label: REGISTER_NAMES[reg] || reg });
  } else if (view) {
    breadcrumbItems.push({
      label: view === "rcb" ? "RCB Generations" : "Experimental Registry",
    });
  }

  const showRegisterGrid =
    (sex === "male" || sex === "female") && !reg && !view && !show;
  const showGenerationGrid = view === "rcb" && !show;
  const showExperimentalGrid = view === "ex" && !show;
  const showTable = !!(reg || age || farm || owner || show === "all");

  const filterOptions = showTable
    ? await getFilterOptions()
    : { breeds: [], farms: [], owners: [] };

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-16 px-4 font-sans leading-tight text-gray-800">
      <div className="max-w-[2000px] mx-auto space-y-10">
        <Breadcrumbs items={breadcrumbItems} />

        {showRegisterGrid && (
          <section className="space-y-12">
            <header className="border-b border-primary/10 pb-8 text-center max-w-4xl mx-auto uppercase">
              <h2 className="text-4xl md:text-5xl font-black text-primary mb-4 tracking-tight">
                {lang === "ru" ? "Реестры породы" : "Registry Types"}
              </h2>
              <p className="text-sm font-bold opacity-40">
                {lang === "ru"
                  ? `Выберите категорию генетического реестра для ${breed.name}`
                  : `Select a genetic registry category for ${breed.name}`}
              </p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  id: "rhb",
                  name: t.rules.rhbTitle,
                  code: "RHB",
                  desc:
                    lang === "ru"
                      ? "Чистопородные животные с сертифицированной родословной."
                      : "Purebred animals with certified pedigree.",
                },
                {
                  id: "rcb",
                  name: lang === "ru" ? "Поглощение" : "Absorption",
                  code: "RCB",
                  desc:
                    lang === "ru"
                      ? "Программы поглотительного скрещивания под контролем."
                      : "Controlled absorption crossbreeding programs.",
                  isFolder: true,
                },
                {
                  id: "rfb",
                  name: t.rules.rfbTitle,
                  code: "RFB",
                  desc:
                    lang === "ru"
                      ? "Отбор по строгим стандартам физических характеристик."
                      : "Selection by strict physical characteristic standards.",
                },
                {
                  id: "ex",
                  name: lang === "ru" ? "Эксперимент" : "Experimental",
                  code: "RExB",
                  desc:
                    lang === "ru"
                      ? "Специализированные линии и экспериментальные программы."
                      : "Specialized lines and experimental programs.",
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
                  className="bg-white p-8 flex flex-col items-center text-center group border border-primary/10 hover:border-secondary rounded-2xl transition-colors shadow-sm"
                >
                  <div className="w-16 h-16 mb-4 rounded-lg overflow-hidden bg-primary/5 p-2 border border-primary/10">
                    <img
                      src={breedImg}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-black text-primary mb-1 tracking-tight uppercase">
                    {item.name}
                  </h3>
                  <span className="text-secondary font-black text-[10px] mb-4 uppercase tracking-widest">
                    {item.code}
                  </span>
                  <p className="text-xs text-primary/70 mb-8">{item.desc}</p>
                  <div className="mt-auto px-6 py-2 w-full bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                    {t.catalog.launch} ➔
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {showGenerationGrid && (
          <section className="space-y-12">
            <header className="border-b border-primary/10 pb-8 text-center max-w-4xl mx-auto uppercase">
              <h2 className="text-4xl md:text-5xl font-black text-primary mb-4 tracking-tight">
                RCB Generations
              </h2>
              <p className="text-sm font-bold opacity-40 italic">
                {lang === "ru"
                  ? "Основной список для программ поглощения (F1–F7)"
                  : "Main list for absorption programs (F1–F7)"}
              </p>
            </header>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <Link
                  key={num}
                  href={`?reg=f${num}`}
                  className="bg-white rounded-xl p-8 flex items-center justify-between hover:bg-primary/5 group transition-colors border border-primary/10 hover:border-primary/20 shadow-sm"
                >
                  <h3 className="text-3xl font-black text-primary uppercase italic">
                    F{num}
                  </h3>
                  <span className="text-secondary font-black text-[10px] uppercase tracking-widest text-right">
                    → {t.catalog.launch}
                    <br />
                    List
                  </span>
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
          <section className="space-y-12">
            <header className="border-b border-primary/10 pb-8 text-center max-w-4xl mx-auto uppercase">
              <h2 className="text-4xl md:text-5xl font-black text-primary mb-4 tracking-tight">
                RExB Classification
              </h2>
              <p className="text-sm font-bold opacity-40 italic">
                {lang === "ru"
                  ? "Списки по стандартам экспериментального процента"
                  : "Lists by experimental percentage standards"}
              </p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  id: "ex1",
                  name: "RExB 1",
                  s: lang === "ru" ? "До 50%" : "Up to 50%",
                },
                {
                  id: "ex2",
                  name: "RExB 2",
                  s: lang === "ru" ? "51% до 75%" : "51% to 75%",
                },
                {
                  id: "ex3",
                  name: "RExB 3",
                  s: lang === "ru" ? "76% до 98%" : "76% to 98%",
                },
              ].map((item) => (
                <Link
                  key={item.id}
                  href={`?reg=${item.id}`}
                  className="bg-white rounded-xl p-10 flex flex-col items-center group hover:border-secondary transition-colors border border-primary/10 shadow-sm"
                >
                  <h3 className="text-3xl font-black text-primary mb-2 uppercase italic">
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

        {showTable && (
          <section className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-primary/5 pb-6 gap-6">
              <div>
                <h2 className="text-xl font-black text-primary uppercase leading-tight tracking-tighter mb-2 italic">
                  {breed.name} /{" "}
                  {reg
                    ? REGISTER_NAMES[reg]
                    : age ? `${lang === "ru" ? "До" : "Up to"} ${age}M` : (lang === "ru" ? "Весь реестр" : "All Registry")}
                </h2>
                <div className="flex gap-2">
                  <span className="bg-primary text-secondary px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest">
                    {s === "male" ? t.goats.male : t.goats.female}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <FilterCard 
                    label={lang === "ru" ? "Порода" : "Breed"}
                    param="breed"
                    currentValue={alias}
                    options={[{ id: 'all', name: `-- ${lang === "ru" ? "Все породы" : "All Breeds"} --` }, ...filterOptions.breeds.map((b: { alias: string; name: string }) => ({ id: b.alias, name: b.name }))]}
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
                    label={lang === 'ru' ? 'Возраст' : 'Age'}
                    param="age"
                    currentValue={age}
                    options={[
                        { id: '12', name: lang === 'ru' ? 'До 12 мес.' : 'Up to 12m' },
                        { id: '24', name: lang === 'ru' ? 'До 24 мес.' : 'Up to 24m' },
                        { id: '36', name: lang === 'ru' ? 'До 36 мес.' : 'Up to 36m' },
                        { id: 'all', name: lang === 'ru' ? 'Все' : 'All Ages' }
                    ]}
                />
                <Link href={`/catalog/goats/${alias}/${sex}${reg ? `?reg=${reg}` : "?show=all"}`} className="px-6  bg-[#CFA97A] border h-8  mt-4 border-primary/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary hover:bg-black hover:text-white transition-all shadow-sm flex items-center">
                    ← {lang === "ru" ? "СБРОС" : "RESET"}
                </Link>
              </div>
            </header>

            <div
              className="bg-white border rounded-sm shadow-2xl relative"
              style={{ height: "72vh" }}
            >
              <div className="overflow-auto h-full">
                <Suspense
                  fallback={
                    <div className="p-20 text-center font-black uppercase opacity-20 text-xs text-primary">
                      Accessing Genetic Registry...
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
                    />
                  </Suspense>
                </div>
              </div>
            </section>
          )}
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
  }: {
    breedId: number;
    sex: string;
    reg?: string;
    age?: string;
    farm?: string;
    owner?: string;
    t: any;
    lang: string;
  }) {
    const goats = await getGoats(breedId, sex, reg, age, false, farm, owner);
    return <GoatTable goats={goats} t={t} />;
  }
