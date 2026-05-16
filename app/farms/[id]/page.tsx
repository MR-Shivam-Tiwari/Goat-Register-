import { query } from "@/lib/db";
import Link from "next/link";
import fs from "fs";
import path from "path";
import Breadcrumbs from "@/components/Breadcrumbs";
import { cookies } from "next/headers";
import { getTranslation, Locale } from "@/lib/translations";
import { Pencil, Info, Truck } from "lucide-react";
import { getSessionUser } from "@/lib/access-control";
import SmartFarmImage from "@/components/SmartFarmImage";
import FarmGoatTables from "@/components/FarmGoatTables";

export const dynamic = "force-dynamic";

interface Farm {
  id: number;
  name: string;
  tmpl: string; // This is the description
  pic1: string;
  pic2: string | null;
  displayAva?: string | null;
  displayPic2?: string | null;
}

function extractPrefix(farmName: string, goats: any[]): string {
  if (goats.length === 0) return farmName.split(/[ \.\-\/]/)[0];

  // Get the first word of every goat name
  const words = goats
    .map((g) => g.name.trim().split(/[ \.\-\/]/)[0])
    .filter((w) => w && w.length > 2); // Increased to 3+ characters

  if (words.length === 0) {
    const defaultPrefix = farmName.split(/[ \.\-\/]/)[0];
    return defaultPrefix.length > 2 ? defaultPrefix : "";
  }

  // Count frequencies
  const counts: Record<string, number> = {};
  words.forEach((w) => {
    counts[w] = (counts[w] || 0) + 1;
  });

  // Return the most frequent first word
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
}

async function getFarmData(id: string): Promise<Farm | null> {
  if (id === '0') {
    return {
      id: 0,
      name: 'WITHOUT FARM',
      tmpl: '<p>ANIMALS NOT TIED TO A FARM</p>',
      pic1: 'no_pic.png',
      pic2: null
    };
  }
  const result = await query(
    "SELECT id, name, tmpl, pic1, pic2 FROM farms WHERE id = $1",
    [id],
  );
  if (result.rows.length === 0) return null;

  const farm = result.rows[0] as Farm;
  const isKamdhenu =
    farm.name.toLowerCase().includes("kamdhenu") ||
    farm.name.includes("КАМАДХЕНУ") ||
    farm.name.includes("Камадхену");

  let displayAva = null;
  
  if (isKamdhenu) {
    displayAva = "/api/uploads/kamadhenu_card.jpg";
  }

  if (farm.pic1 && farm.pic1 !== "no_pic.png") {
    let targetPath = "";
    if (farm.pic1 === "kamadhenu.jpg") {
      targetPath = "/img/kamadhenu.jpg";
    } else if (farm.pic1 === "11.jpg") {
      targetPath = "/img/farm/11.jpg";
    } else if (farm.pic1 === "new_farm.png") {
      targetPath = "/img/farm/new_farm.png";
    } else {
      targetPath = `/api/uploads/${farm.pic1}`;
    }

    try {
      const actualFile = targetPath.startsWith('/api/uploads/') 
        ? targetPath.replace('/api/uploads/', '') 
        : targetPath;
      const fullPath = targetPath.startsWith('/api/uploads/')
        ? path.join(process.cwd(), "public", "uploads", actualFile)
        : path.join(process.cwd(), "public", targetPath);

      if (fs.existsSync(fullPath)) {
        displayAva = targetPath;
      } else if (isKamdhenu) {
        if (fs.existsSync(path.join(process.cwd(), "public/uploads/kamadhenu.jpg"))) {
          displayAva = "/api/uploads/kamadhenu.jpg";
        }
      }
    } catch (err) {
      console.error(`Error checking file existence for ${targetPath}:`, err);
    }
  }

  let displayPic2 = null;
  if (farm.pic2 && farm.pic2 !== "no_pic.png") {
    let targetPath = "";
    if (farm.pic2 === "kamadhenu.jpg") {
      targetPath = "/img/kamadhenu.jpg";
    } else if (farm.pic2 === "11.jpg") {
      targetPath = "/img/farm/11.jpg";
    } else if (farm.pic2 === "new_farm.png") {
      targetPath = "/img/farm/new_farm.png";
    } else {
      targetPath = `/api/uploads/${farm.pic2}`;
    }

    try {
      const actualFile = targetPath.startsWith('/api/uploads/') 
        ? targetPath.replace('/api/uploads/', '') 
        : targetPath;
      const fullPath = targetPath.startsWith('/api/uploads/')
        ? path.join(process.cwd(), "public", "uploads", actualFile)
        : path.join(process.cwd(), "public", targetPath);

      if (fs.existsSync(fullPath)) {
        displayPic2 = targetPath;
      }
    } catch (err) {
      console.error(`Error checking file existence for ${targetPath}:`, err);
    }
  }

  return { ...farm, displayAva, displayPic2 };
}
async function getFarmGoats(id: string) {
  let sql = "";
  let params: any[] = [];

  if (id === "0") {
    sql = `
      SELECT DISTINCT ON (A.id)
        A.id, A.name, A.sex, A.id_user, A.id_farm, B.name as breed_name, 
        Di.is_abg, Di.manuf, Di.owner, Di.date_born, Di.blood_percent,
        F.name as current_farm_name,
        COALESCE(Di.ava, (SELECT file FROM goats_pic WHERE id_goat = A.id ORDER BY time_added DESC LIMIT 1)) as main_photo
      FROM animals A
      LEFT JOIN goats_data Di ON A.id = Di.id_goat
      LEFT JOIN breeds B ON Di.id_breed = B.id
      LEFT JOIN farms F ON A.id_farm = F.id
      WHERE A.id_farm = 0 AND A.is_reg = 1
      ORDER BY A.id, A.name ASC
    `;
  } else {
    sql = `
      SELECT DISTINCT ON (A.id)
        A.id, A.name, A.sex, A.id_user, A.id_farm, B.name as breed_name, 
        Di.is_abg, Di.manuf, Di.owner, Di.date_born, Di.blood_percent,
        F.name as current_farm_name,
        COALESCE(Di.ava, (SELECT file FROM goats_pic WHERE id_goat = A.id ORDER BY time_added DESC LIMIT 1)) as main_photo
      FROM animals A
      LEFT JOIN goats_data Di ON A.id = Di.id_goat
      LEFT JOIN breeds B ON Di.id_breed = B.id
      LEFT JOIN farms F ON A.id_farm = F.id
      WHERE A.id_farm = $1::int AND A.is_reg = 1
      ORDER BY A.id, A.name ASC
    `;
    params = [id];
  }

  const result = await query(sql, params);
  return result.rows;
}

async function getDisplacedGoats(id: string, prefix: string) {
  if (!id || id === '0') return [];
  // Include goats that:
  // 1. Have a movement record FROM this farm AND are not here now
  // 2. Were BRED by this farm (manuf matches prefix) AND are not here now
  const result = await query(`
    SELECT DISTINCT ON (A.id)
      A.id, A.name, A.sex, A.id_user, B.name as breed_name, 
      Di.is_abg, Di.manuf, Di.owner, Di.date_born, Di.blood_percent,
      COALESCE(Di.ava, (SELECT file FROM goats_pic WHERE id_goat = A.id ORDER BY time_added DESC LIMIT 1)) as main_photo
    FROM animals A
    LEFT JOIN goats_move M ON A.id = M.id_goat
    LEFT JOIN goats_data Di ON A.id = Di.id_goat
    LEFT JOIN breeds B ON Di.id_breed = B.id
    WHERE (
        (M.id_farm_of = $1::int AND A.id_farm != $1::int)
        OR 
        ($2 != '' AND Di.manuf ILIKE $2 || '%')
      )
      AND A.id_farm != $1::int
      AND A.id_farm != 0
      AND A.is_reg = 1
    ORDER BY A.id, A.name ASC
  `, [id, prefix]);
  return result.rows;
}

export default async function FarmDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = await paramsPromise;
  const { id } = params;
  const farm = await getFarmData(id);

  const cookieStore = await cookies();
  const lang = (cookieStore.get("nxt-lang")?.value as Locale) || "ru";
  const t = getTranslation(lang);

  const sessionUser = await getSessionUser();
  const isAdmin = sessionUser && sessionUser.role >= 10;

  if (!farm)
    return (
      <div className="p-40 text-center text-4xl font-black text-[#491907] animate-pulse uppercase tracking-[1em]">
        {t.farms.farmNotFound}
      </div>
    );

  const goats = await getFarmGoats(id);
  const detectedPrefix = id === '0' ? '' : extractPrefix(farm.name, goats);
  const displaced = id === '0' ? [] : await getDisplacedGoats(id, detectedPrefix);
  const displayName = id === '0' ? (t.goats.withoutFarm || 'WITHOUT FARM') : farm.name;

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-8 px-4 md:px-12 lg:px-24 tracking-tight">
      <div className="max-w-[1500px] mx-auto space-y-4">
        <Breadcrumbs
          items={[
            { label: t.farms.breadcrumbs, href: "/farms" },
            { label: displayName },
          ]}
          t={t}
          locale={lang}
        />

      {/* FARM NAME & PREFIX - TOP LEVEL */}
      <div className="pb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-[#491907] uppercase tracking-tight">
          {displayName}
        </h1>
          {detectedPrefix && (
            <p className="text-sm font-bold text-[#491907] uppercase tracking-widest mt-1 opacity-70">
              Prefix: {detectedPrefix}
            </p>
          )}
        </div>

        {/* MAIN DISPLAY SECTION */}
        {id !== "0" && (
          <section className="bg-[#FAF9F6] border border-gray-200 shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[500px]">
            {/* IMAGE COLUMN (Left) */}
            <div className="lg:w-[500px] shrink-0 bg-gray-50 flex items-center justify-center p-1 border-r border-gray-200 relative group min-h-[500px]">
              <SmartFarmImage
                src={(farm.displayPic2 || farm.displayAva) ?? null}
                alt={farm.name}
                fill={true}
                className="object-contain shadow-inner"
                emptyText={t.catalog?.empty || 'NO PHOTO AVAILABLE'}
              />
            </div>

            {/* DESCRIPTION COLUMN (Right) */}
            <div className="flex-1 p-12 flex flex-col items-center justify-center text-center">
              <div className="max-w-2xl w-full">
                <div
                  className="text-[#491907] leading-loose font-medium prose prose-slate max-w-none prose-p:my-4 prose-strong:text-[#491907] text-[15px]"
                  dangerouslySetInnerHTML={{ __html: farm.tmpl }}
                />
              </div>

              {isAdmin && id !== '0' && (
                <div className="mt-8">
                  <a
                    href={`/farms/${farm.id}/edit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2 bg-[#491907] text-white rounded-sm font-bold text-[11px] uppercase tracking-widest hover:bg-black transition-all group"
                  >
                    <Pencil size={14} />
                    {t.common.edit}
                  </a>
                </div>
              )}
            </div>
          </section>
        )}

        <div className="pt-4">
          <Link
            href="/farms"
            className="text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:underline"
          >
            ← {t.farms.toFarmList}
          </Link>
        </div>

        {/* TABLES SECTION */}
        <FarmGoatTables 
          goats={goats}
          displaced={displaced}
          t={t}
          lang={lang}
          sessionUser={sessionUser}
          farmId={id}
        />
    </div>
  </div>
  );
}
