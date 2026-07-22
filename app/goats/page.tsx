import { query } from "@/lib/db";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { cookies } from "next/headers";
import { getTranslation, Locale } from "@/lib/translations";
import { redirect } from "next/navigation";
import GoatFilters from "@/components/GoatFilters";
import { getSessionUser } from "@/lib/access-control";
import GoatDeleteButton from "@/components/GoatDeleteButton";
import GoatListTable from "@/components/GoatListTable";

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
    const q = filters.q.trim().toLowerCase();
    params.push(`%${q}%`);
    let subClause = `(LOWER(A.name) LIKE $${params.length} OR LOWER(Di.code_ua) LIKE $${params.length} OR LOWER(B.name) LIKE $${params.length})`;

    // Check if searching for a registry code like R10023 or X10023
    const regMatch = q.match(/^[rx](\d+)$/i);
    if (regMatch) {
      const idSearch = parseInt(regMatch[1]) - 10000;
      if (!isNaN(idSearch)) {
        params.push(idSearch);
        subClause += ` OR A.id = $${params.length}`;
      }
    }
    
    // Check if numeric ID
    if (!isNaN(Number(q)) && q.length > 0) {
        params.push(Number(q));
        subClause += ` OR A.id = $${params.length}`;
    }

    whereClause += ` AND (${subClause})`;
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
      Di.ava as main_photo
    FROM animals A
    LEFT JOIN goats_data Di ON A.id = Di.id_goat
    LEFT JOIN breeds B ON Di.id_breed = B.id
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
  if (!user || (user.role < 10 && user.is_apk !== 1)) {
    redirect("/login");
  }
  const isAdmin = user && user.role >= 10;

  const cookieStore = await cookies();
  const lang = (cookieStore.get("nxt-lang")?.value as Locale) || "ru";
  const t = getTranslation(lang);

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-8 px-2 md:px-6 lg:px-8 font-sans leading-tight text-gray-800">
      <div className="max-w-[1700px] mx-auto space-y-6">
        <Breadcrumbs
          items={[{ label: t.nav.registry }]}
          t={t}
          locale={lang}
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

        <GoatListTable
          goats={goats}
          t={t}
          lang={lang}
          user={user}
          isAdmin={!!isAdmin}
        />
      </div>
    </div>
  );
}
