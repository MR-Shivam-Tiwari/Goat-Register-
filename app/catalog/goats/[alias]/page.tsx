import { query } from "@/lib/db";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { cookies } from "next/headers";
import { getTranslation, Locale } from "@/lib/translations";
import {
  LayoutGrid,
  ArrowRight,
  Skull,
  History,
  LogOut,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getBreedData(alias: string) {
  const result = await query(
    "SELECT id, name, alias FROM breeds WHERE TRIM(alias) ILIKE TRIM($1)",
    [alias],
  );
  return result.rows[0];
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

export default async function BreedPage({
  params: paramsPromise,
}: {
  params: Promise<{ alias: string }>;
}) {
  const params = await paramsPromise;
  const breed = await getBreedData(params.alias);
  const cookieStore = await cookies();
  const lang = (cookieStore.get("nxt-lang")?.value as Locale) || "ru";
  const t = getTranslation(lang);

  if (!breed)
    return (
      <div className="p-40 text-center text-4xl font-black text-primary uppercase tracking-[1em]">
        {t.catalog.breedNotFound}
      </div>
    );

  const pics = await getBreedPictures(params.alias);
  const alias = params.alias.trim().toUpperCase();

  const categories = [
    {
      id: "female",
      name: t.catalog.stockGrid.female,
      sex: 0,
      desc: t.goats.stockRecords,
      img:
        alias === "AN"
          ? "breedimage/kozi-ang.jpg"
          : alias === "BUR"
            ? "breedimage/burskaia-koza.jpg"
            : "breedimage/kozi13.jpg",
      color: "bg-[transparent]",
    },
    {
      id: "male",
      name: t.catalog.stockGrid.male,
      sex: 1,
      desc: t.goats.breedingSires,
      img:
        alias === "AN"
          ? "breedimage/nub-kozli.jpg"
          : alias === "BUR"
            ? "img/image.png"
            : "breedimage/kozli3.jpg",
      color: "bg-[transparent]",
    },
    {
      id: "child",
      name: t.catalog.stockGrid.kids,
      sex: 2,
      desc: t.goats.offspringDesc,
      img:
        alias === "AN"
          ? "breedimage/nub-kozliata.jpg"
          : alias === "BUR"
            ? "breedimage/burskaia-kozliata.jpg"
            : "breedimage/kozliata3.jpg",
      color: "bg-[transparent]",
    },
  ];

  const isUkrainian = ["UAW", "UAC", "UAS"].includes(alias);

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-6 px-4 md:px-12 lg:px-24 tracking-tight">
      <div className="max-w-[1200px] mx-auto space-y-8">
        <Breadcrumbs
          items={[
            { label: breed.name },
          ]}
          t={t}
          locale={lang}
        />

        {/* MODULE 1: BREED REGISTRIES (Top) */}
        <section className="space-y-6 pt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {categories.map((cat) => {
              const href = `/catalog/goats/${breed.alias.trim()}/${cat.id}`;
              
              return (
                <Link
                  key={cat.id}
                  href={href}
                  className="group flex flex-col items-center text-center"
                >
                  <div className="w-full max-w-[280px] flex items-center justify-center overflow-hidden mb-4">
                    <img
                      src={`/${cat.img}`}
                      alt={cat.name}
                      className="max-h-[160px] w-auto h-auto object-contain transition-all duration-300 group-hover:scale-105 [mix-blend-mode:multiply]"
                    />
                  </div>
                        <div className="flex flex-col items-center">
                            <h3 translate="no" className="text-base font-bold text-primary uppercase tracking-tight leading-none group-hover:text-secondary transition-colors not-italic">
                                {cat.name}
                            </h3>
                        </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* MODULE 2: ANIMAL MOVEMENT (Middle Segment) */}
        {true && (
          <section className="py-2 space-y-6">
            <div className="flex items-center gap-4">
              <span translate="no" className="text-base font-black uppercase tracking-tight text-primary whitespace-nowrap not-italic">
                {t.catalog.movementTitle}
              </span>
              <div className="flex-1 h-px bg-primary/10" />
            </div>

            <div className="flex items-center justify-center">
              <Link
                href={`/catalog/goats/${breed.alias.trim()}/move`}
                className="group flex items-center gap-6 p-6 rounded-2xl bg-[#481907] border border-[#ECC41E] hover:opacity-90 w-[600px] transition-all"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-white/10 text-white">
                  <History size={24} />
                </div>
                <div className="flex-1">
                  <p translate="no" className="text-xl font-black text-white uppercase tracking-tighter leading-none">
                    {t.catalog.transferredAnimalsList}
                  </p>
                </div>
                <ArrowRight size={20} className="text-white opacity-40 group-hover:opacity-100 transition-all" />
              </Link>
            </div>
          </section>
        )}

        {/* MODULE 3: DECEASED REGISTRY (Bottom Segment) */}
        {true && (
          <section className="pt-6 pb-12 space-y-6">
            <div className="flex items-center gap-4">
              <span translate="no" className="text-base font-black uppercase tracking-tight text-primary whitespace-nowrap not-italic">
                {t.catalog.deceasedTitle}
              </span>
              <div className="flex-1 h-px bg-primary/10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MovementLink
                href={`/catalog/goats/${breed.alias.trim()}/female/dead`}
                label={t.catalog.deadDoes}
                icon={<Skull size={18} />}
                theme="bg-[#23412A] border-[#23412A] hover:opacity-90"
                textColor="text-white"
              />
              <MovementLink
                href={`/catalog/goats/${breed.alias.trim()}/male/dead`}
                label={t.catalog.deadBucks}
                icon={<Skull size={18} />}
                theme="bg-[#23412A] border-[#23412A] hover:opacity-90"
                textColor="text-white"
              />
              <MovementLink
                href={`/catalog/goats/${breed.alias.trim()}/child/dead`}
                label={t.catalog.deadKids}
                icon={<Skull size={18} />}
                theme="bg-[#23412A] border-[#23412A] hover:opacity-90"
                textColor="text-white"
              />
            </div>
          </section>
        )}

        <footer className="border-t border-gray-100 pt-8 pb-10 text-center opacity-30">
          <span className="text-[10px] font-black text-primary uppercase tracking-tighter">
            © {new Date().getFullYear()} {t.home.footerCopyright}
          </span>
        </footer>
      </div>
    </div>
  );
}

function MovementLink({ href, label, icon, theme, textColor }: any) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-4 p-5 rounded-xl border transition-all duration-300 hover:shadow-md ${theme}`}
    >
      <div
        className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 ${textColor}`}
      >
        {icon}
      </div>
      <div>
        <p
          translate="no"
          className={`text-[16px] font-black uppercase tracking-tight ${textColor}`}
        >
          {label}
        </p>
      </div>
      <ArrowRight
        size={14}
        className={`ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all ${textColor}`}
      />
    </Link>
  );
}
