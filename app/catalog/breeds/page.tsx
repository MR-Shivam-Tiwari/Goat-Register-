import { query } from "@/lib/db";
import { cookies } from "next/headers";
import { getTranslation, Locale } from "@/lib/translations";
import Breadcrumbs from "@/components/Breadcrumbs";
import BreedManager from "@/components/BreedManager";
import { getSessionUser } from "@/lib/access-control";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getBreeds() {
  const result = await query("SELECT * FROM breeds ORDER BY place ASC, name ASC");
  return result.rows;
}

export default async function BreedManagementPage() {
  const user = await getSessionUser();
  if (!user || user.role < 10) {
    redirect("/login");
  }

  const breeds = await getBreeds();
  const cookieStore = await cookies();
  const lang = (cookieStore.get("nxt-lang")?.value as Locale) || "ru";
  const t = getTranslation(lang);

  return (
    <div className="min-h-screen py-12 px-6 md:px-12 lg:px-24 font-sans tracking-tight bg-[#FDFDFD]">
      <div className="max-w-[1700px] mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <Breadcrumbs 
              items={[
                { label: t.catalog.breadcrumbs, href: "/catalog/goats" },
                { label: t.breedManage.manageBreeds }
              ]} 
              t={t} 
              locale={lang} 
            />
            <h1 className="text-4xl font-black text-[#491907] uppercase tracking-tighter leading-none">
              {t.breedManage.title}
            </h1>
            <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">
              {t.breedManage.registryControl}
            </p>
          </div>
        </div>

        <div className="bg-white p-1 rounded-sm shadow-xl border border-black/10">
          <div className="bg-white p-6 md:p-10 rounded-sm">
            <BreedManager initialBreeds={breeds} t={t} />
          </div>
        </div>
      </div>
    </div>
  );
}
