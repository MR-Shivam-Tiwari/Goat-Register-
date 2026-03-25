import { query } from "@/lib/db";
import { getTranslation, Locale } from "@/lib/translations";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import MilkForm from "./MilkForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MilkAddPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ row?: string }>
}) {
  const { id } = await params;
  const { row } = await searchParams;
  
  const goatRes = await query("SELECT id, name FROM animals WHERE id = $1", [id]);
  const goat = goatRes.rows[0];
  if (!goat) notFound();
  
  let initialData = null;
  if (row) {
    const milkRes = await query("SELECT * FROM goats_milk WHERE id = $1 AND id_goat = $2", [row, id]);
    initialData = milkRes.rows[0];
  }

  const cookieStore = await cookies();
  const locale = (cookieStore.get("nxt-lang")?.value || "ru") as Locale;
  const t = getTranslation(locale);

  return (
    <div className="min-h-screen bg-gray-50/50 py-20 px-6">
       <div className="max-w-xl mx-auto mb-10 text-center">
          <Link href={`/goats/${id}`} className="text-[#491907]/40 hover:text-[#491907] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
            ← Back to profiles
          </Link>
          <div className="mt-4">
             <span className="text-[9px] font-black uppercase text-gray-300 tracking-[0.3em]">Breeding ID: {id} • Animal: {goat.name}</span>
          </div>
       </div>
       <MilkForm goatId={id} initialData={initialData} t={t} />
    </div>
  );
}
