import { query } from "@/lib/db";
import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { getTranslation, Locale } from "@/lib/translations";
import { adminOnly } from "@/lib/access-control";
import { redirect } from "next/navigation";
import { saveLactationAction } from "@/lib/actions";
import DeleteLactationButton from "@/components/DeleteLactationButton";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ row?: string }>;
}

export default async function LactationFormPage({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: PageProps) {
  await adminOnly();
  const { id } = await paramsPromise;
  const { row } = await searchParamsPromise;
  const cookieStore = await cookies();
  const lang = (cookieStore.get("nxt-lang")?.value as Locale) || "ru";
  const t = getTranslation(lang);

  const goatRes = await query("SELECT id, name FROM animals WHERE id = $1", [id]);
  const goat = goatRes.rows[0];
  if (!goat) {
    return <div className="p-8 text-center font-bold text-red-600">Goat not found</div>;
  }

  let existingLact: any = null;
  if (row && parseInt(row) > 0) {
    const lactRes = await query(
      "SELECT * FROM goats_lact WHERE id = $1 AND id_goat = $2",
      [parseInt(row), parseInt(id)]
    );
    existingLact = lactRes.rows[0] || null;
  }

  // Pre-filled defaults
  const defaultViewer = existingLact ? existingLact.viewer : goat.name;
  const defaultLactNo = existingLact ? existingLact.lact_no : "";
  const defaultLactDays = existingLact ? existingLact.lact_days : "";
  const defaultMilk = existingLact ? existingLact.milk : "";
  const defaultFat = existingLact ? existingLact.fat : "";
  const defaultProtein = existingLact ? existingLact.protein : "";
  const defaultMilkDay = existingLact ? existingLact.milk_day : "";
  const defaultHaveGraph = existingLact ? existingLact.have_graph : 0;

  async function handleSubmit(formData: FormData) {
    "use server";
    const result = await saveLactationAction(id, row || null, formData);
    if (result.success) {
      redirect(`/goats/${id}`);
    } else {
      console.error(result.error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-[#FCFAF2] border-2 border-[#491907]/20 rounded-2xl p-8 shadow-sm">
        {/* Back Link */}
        <Link
          href={`/goats/${id}`}
          className="text-blue-600 hover:text-blue-800 underline font-bold text-xs uppercase tracking-wider block mb-6"
        >
          &larr; {lang === 'ru' ? 'Назад' : 'Back'}
        </Link>

        {/* Title */}
        <h1 className="text-2xl font-black text-[#491907] uppercase tracking-widest border-b border-[#491907]/10 pb-4 mb-6 font-mono">
          {lang === 'ru' ? 'Данные по лактации' : 'Lactation data'}
        </h1>

        {/* Form */}
        <form action={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="viewer"
              defaultValue={defaultViewer}
              placeholder={lang === 'ru' ? 'Потомок/предок' : 'Descendant/ancestor'}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-[#491907] focus:ring-1 focus:ring-[#491907]/20 outline-none bg-white shadow-sm transition-all placeholder-gray-400"
              required
            />
          </div>

          <div>
            <input
              type="number"
              name="lact_no"
              defaultValue={defaultLactNo}
              placeholder={lang === 'ru' ? 'Номер лактации' : 'Lactation number'}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-[#491907] focus:ring-1 focus:ring-[#491907]/20 outline-none bg-white shadow-sm transition-all placeholder-gray-400"
              required
            />
          </div>

          <div>
            <input
              type="text"
              name="lact_days"
              defaultValue={defaultLactDays}
              placeholder={lang === 'ru' ? 'Дней лактации' : 'Days of lactation'}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-[#491907] focus:ring-1 focus:ring-[#491907]/20 outline-none bg-white shadow-sm transition-all placeholder-gray-400"
              required
            />
          </div>

          <div>
            <input
              type="number"
              step="any"
              name="milk"
              defaultValue={defaultMilk}
              placeholder={lang === 'ru' ? 'Удой за лактацию в кг' : 'Milk yield per lactation in kg'}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-[#491907] focus:ring-1 focus:ring-[#491907]/20 outline-none bg-white shadow-sm transition-all placeholder-gray-400"
              required
            />
          </div>

          <div>
            <input
              type="number"
              step="any"
              name="fat"
              defaultValue={defaultFat}
              placeholder={lang === 'ru' ? 'Жир %' : 'Fat %'}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-[#491907] focus:ring-1 focus:ring-[#491907]/20 outline-none bg-white shadow-sm transition-all placeholder-gray-400"
            />
          </div>

          <div>
            <input
              type="number"
              step="any"
              name="protein"
              defaultValue={defaultProtein}
              placeholder={lang === 'ru' ? 'Белок %' : 'Protein %'}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-[#491907] focus:ring-1 focus:ring-[#491907]/20 outline-none bg-white shadow-sm transition-all placeholder-gray-400"
              required
            />
          </div>

          <div>
            <input
              type="number"
              step="any"
              name="milk_day"
              defaultValue={defaultMilkDay}
              placeholder={lang === 'ru' ? 'Среднесуточный удой (кг)' : 'Average daily milk yield (kg)'}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-[#491907] focus:ring-1 focus:ring-[#491907]/20 outline-none bg-white shadow-sm transition-all placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-4">
            <select
              name="have_graph"
              defaultValue={defaultHaveGraph}
              className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-[#491907] focus:ring-1 focus:ring-[#491907]/20 outline-none bg-white shadow-sm transition-all"
            >
              <option value="0">{lang === 'ru' ? 'Нет' : 'No'}</option>
              <option value="1">{lang === 'ru' ? 'Да' : 'Yes'}</option>
            </select>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {lang === 'ru' ? 'График лактационной кривой' : 'Lactation curve graph'}
            </span>
          </div>

          <div className="pt-4 flex justify-between items-center">
            <button
              type="submit"
              className="bg-[#491907] hover:bg-black text-white font-black text-xs uppercase tracking-widest px-8 py-3 rounded-lg shadow-md transition-all active:scale-95"
            >
              {lang === 'ru' ? 'Записать' : 'Write down'}
            </button>
            {row && (
              <DeleteLactationButton goatId={id} rowId={row} lang={lang} />
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
