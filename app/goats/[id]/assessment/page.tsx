import { query } from "@/lib/db";
import { getTranslation, Locale } from "@/lib/translations";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import AssessmentForm from "./AssessmentForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getGoatExpertAssessment(id: string) {
  const res = await query(
    `SELECT * FROM goats_test 
    WHERE id_goat = $1
    ORDER BY date_test DESC 
    LIMIT 1`,
    [id],
  );
  return res.rows[0];
}

export default async function AssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Verify goat exists and has certificate (per user rule)
  const goatRes = await query("SELECT id_goat, cert_no, cert_serial FROM goats_data WHERE id_goat = $1", [id]);
  const goat = goatRes.rows[0];
  if (!goat) notFound();
  
  // Rule: Must have certificate
  if (!goat.cert_no && !goat.cert_serial) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
              <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl text-center border border-gray-100">
                  <div className="text-4xl mb-4">📜</div>
                  <h2 className="text-xl font-black uppercase text-[#491907] mb-2">Certificate Required</h2>
                  <p className="text-gray-400 text-sm font-bold mb-8">An expert assessment can only be added to goats with an official breeding certificate number.</p>
                  <Link href={`/goats/${id}`} className="bg-[#491907] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase hover:bg-black transition-all inline-block shadow-lg">Back to Profile</Link>
              </div>
          </div>
      );
  }

  const initialData = await getGoatExpertAssessment(id);
  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value || "ru") as Locale;
  const t = getTranslation(locale);

  return (
    <div className="min-h-screen bg-gray-50/50 py-20 px-6">
       <div className="max-w-xl mx-auto mb-10">
          <Link href={`/goats/${id}`} className="text-[#491907]/40 hover:text-[#491907] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-colors">
            ← Back to profiles
          </Link>
       </div>
       <AssessmentForm goatId={id} initialData={initialData} t={t} />
    </div>
  );
}
