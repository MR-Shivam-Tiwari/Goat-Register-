import { query } from "@/lib/db";
import { getTranslation, Locale } from "@/lib/translations";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import AssessmentForm from "./AssessmentForm";
import Link from "next/link";
import { adminOnly } from "@/lib/access-control";

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

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await adminOnly();
  const { id } = await params;

  // Verify goat exists
  const goatRes = await query(
    "SELECT id_goat FROM goats_data WHERE id_goat = $1",
    [id],
  );
  const goat = goatRes.rows[0];
  if (!goat) notFound();

  const initialData = await getGoatExpertAssessment(id);
  const cookieStore = await cookies();
  const lang =
    (cookieStore.get("nxt-lang")?.value as Locale) ||
    (cookieStore.get("NEXT_LOCALE")?.value as Locale) ||
    "ru";
  const t = getTranslation(lang);

  return (
    <div className="min-h-screen bg-[#FAF6EE] py-12 px-6">
      <div className="max-w-xl mx-auto mb-3">
        <Link
          href={`/goats/${id}`}
          className="text-blue-600 hover:underline text-sm font-sans"
        >
          {lang === "ru" ? "Назад" : "Back"}
        </Link>
      </div>
      <AssessmentForm goatId={id} initialData={initialData} t={t} lang={lang} />
    </div>
  );
}
