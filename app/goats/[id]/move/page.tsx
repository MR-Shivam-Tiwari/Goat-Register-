import { query } from "@/lib/db";
import { getTranslation, Locale } from "@/lib/translations";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import MovementForm from "./MovementForm";
import MovementHistory from "./MovementHistory";

export const dynamic = "force-dynamic";

export default async function MovementPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ mode?: 'add' | 'view' }>
}) {
  const { id } = await params;
  const { mode = 'view' } = await searchParams;
  
  const goatRes = await query("SELECT id, name, id_farm FROM animals WHERE id = $1", [id]);
  const goat = goatRes.rows[0];
  if (!goat) notFound();
  
  const farmsRes = await query("SELECT id, name FROM farms WHERE id != '0' ORDER BY name");
  const farms = farmsRes.rows;

  const cookieStore = await cookies();
  const locale = (cookieStore.get("nxt-lang")?.value || "ru") as Locale;
  const t = getTranslation(locale);

  return (
    <div className="min-h-screen bg-[#FDFBF7]/50 py-20 px-6 font-sans">
       <div className="max-w-4xl mx-auto mb-16 text-center">
          <Link href={`/goats/${id}`} className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-full text-[#491907]/40 hover:text-[#491907] font-black text-[10px] uppercase tracking-widest transition-all hover:shadow-lg hover:shadow-[#491907]/5 hover:-translate-y-0.5 active:translate-y-0">
            ← {t.nav.catalog}
          </Link>
          
          <div className="mt-8 space-y-2">
             <div className="flex items-center justify-center gap-3">
               <div className="h-[1px] w-8 bg-gray-200"></div>
               <span className="text-[9px] font-black uppercase text-gray-300 tracking-[0.4em]">Breeding ID: {id}</span>
               <div className="h-[1px] w-8 bg-gray-200"></div>
             </div>
             <h1 className="text-4xl font-black text-[#491907] tracking-tight">{goat.name}</h1>
          </div>
          
          <div className="flex justify-center gap-12 mt-12 border-b border-gray-100/60 pb-1">
            <Link 
              href={`/goats/${id}/move?mode=view`}
              className={`text-[11px] font-black uppercase tracking-[0.2em] pb-5 border-b-2 transition-all duration-300 ${mode === 'view' ? 'border-[#491907] text-[#491907]' : 'border-transparent text-gray-300 hover:text-gray-500 hover:border-gray-200'}`}
            >
              {t.goats.animalMovement} History
            </Link>
            <Link 
              href={`/goats/${id}/move?mode=add`}
              className={`text-[11px] font-black uppercase tracking-[0.2em] pb-5 border-b-2 transition-all duration-300 ${mode === 'add' ? 'border-[#491907] text-[#491907]' : 'border-transparent text-gray-300 hover:text-gray-500 hover:border-gray-200'}`}
            >
              {t.goats.add} Movement
            </Link>
          </div>
       </div>

       <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          {mode === 'add' ? (
            <MovementForm goatId={id} currentFarmId={goat.id_farm} farms={farms} t={t} />
          ) : (
            <MovementHistory goatId={id} t={t} />
          )}
       </div>
    </div>
  );
}
