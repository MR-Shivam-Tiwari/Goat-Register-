import { query } from "@/lib/db";
import { getTranslation, Locale } from "@/lib/translations";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PrintButton from "@/components/PrintButton";
import { getSessionUser } from "@/lib/access-control";
import CertificateLactationTable from "@/components/CertificateLactationTable";
import { getAncestorLactations as fetchAncestorLacts } from "@/lib/goats-data";

export const dynamic = "force-dynamic";

async function getGoatCertData(id: string) {
  const result = await query(
    `
      SELECT 
        A.name, A.sex, A.id AS id, A.id_mother, A.id_father, A.id_user,
        Di.date_born, Di.born_weight, Di.born_qty, Di.score as goat_score,
        Di.horns_type, Di.code_ua, Di.code_abg, Di.code_chip, Di.manuf as breeder_manual, Di.owner as owner_manual,
        Di.blood_percent, Di.special,
        B.name as breed_name,
        S.name as studbook_name, S.alias as studbook_alias,
        T.score_total as test_score, T.class as test_class, T.category,
        U.name as user_farm_name, U.phone as user_phone, U.email as user_email
      FROM animals A
      LEFT JOIN goats_data Di ON A.id = Di.id_goat
      LEFT JOIN breeds B      ON Di.id_breed = B.id
      LEFT JOIN stoodbook S   ON Di.id_stoodbook = S.id
      LEFT JOIN users U       ON A.id_user = U.id
      LEFT JOIN (
         SELECT * FROM goats_test WHERE id_goat = $1 ORDER BY date_test DESC LIMIT 1
      ) T ON A.id = T.id_goat
      WHERE A.id = $1
    `,
    [id],
  );
  return result.rows[0];
}

async function getLactations(id: string) {
  const res = await query(
    `SELECT 
      lact_no, 
      lact_days, 
      milk, 
      fat, 
      protein
    FROM goats_lact 
    WHERE id_goat = $1 
    ORDER BY id ASC LIMIT 5`,
    [id],
  );
  return res.rows;
}

async function getCertSelections(id: string) {
  const res = await query("SELECT * FROM goats_cert WHERE id_goat = $1", [id]);
  return res.rows[0] || {};
}

async function getAncestorLactations(ids: any[]) {
  if (ids.length === 0) return [];
  const validIds = ids
    .filter((id) => id && !isNaN(Number(id)))
    .map((id) => Number(id));
  if (validIds.length === 0) return [];

  const res = await query(
    `SELECT gl.*, a.name as offspring_name 
       FROM goats_lact gl 
       JOIN animals a ON gl.id_goat = a.id 
       WHERE gl.id IN (SELECT unnest($1::int[]))`,
    [validIds],
  );
  return res.rows;
}

async function getOffspringLactations(buckId: number) {
  // Get best lactation per daughter, then pick top 3 by milk yield
  const res = await query(
    `SELECT * FROM (
        SELECT DISTINCT ON (a.id) gl.*, a.name as offspring_name
        FROM goats_lact gl
        JOIN animals a ON gl.id_goat = a.id
        WHERE a.id_father = $1
        ORDER BY a.id, gl.milk DESC
     ) best_per_daughter
     ORDER BY milk DESC
     LIMIT 3`,
    [buckId],
  );
  return res.rows;
}

async function getAncestorDetails(ids: number[]) {
  if (ids.length === 0) return [];
  const res = await query(
    `
    SELECT 
      A.id, A.name, A.sex, A.id_mother, A.id_father,
      Di.date_born, Di.born_weight, Di.born_qty, Di.score as goat_score,
      Di.horns_type, Di.code_ua, Di.code_abg, Di.code_chip, Di.manuf, Di.owner,
      Di.blood_percent,
      B.name as breed_name, B.alias as breed_alias,
      S.name as studbook_name, S.alias as studbook_alias,
      T.score_total as test_score, T.class as test_class
    FROM animals A
    LEFT JOIN goats_data Di ON A.id = Di.id_goat
    LEFT JOIN breeds B      ON Di.id_breed = B.id
    LEFT JOIN stoodbook S   ON Di.id_stoodbook = S.id
    LEFT JOIN LATERAL (
       SELECT * FROM goats_test WHERE id_goat = A.id ORDER BY date_test DESC LIMIT 1
    ) T ON TRUE
    WHERE A.id IN (SELECT unnest($1::int[]))
  `,
    [ids],
  );
  return res.rows;
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string; type: string }>;
}) {
  const { id, type } = await params;
  const user = await getSessionUser();
  const goat = await getGoatCertData(id);
  if (!goat) notFound();

  // ACCESS CONTROL: Allow Admin (role >= 10) or Owner (by id_user)
  const isOwner = user && (user.role >= 10 || user.id === goat.id_user);

  if (!isOwner) {
    redirect("/goats");
  }

  const cookieStore = await cookies();
  const locale = (cookieStore.get("nxt-lang")?.value || "ru") as Locale;
  const t = getTranslation(locale);

  const formatDate = (dateStr: string | Date | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const getHornType = (type: number) => {
    const horns = {
      ru: ["", "комолая / polled", "обезрожена / dehorned", "рогатая / horned"],
      en: ["", "polled", "dehorned", "horned"],
      uk: ["", "комола / polled", "знерожена / dehorned", "рогата / horned"],
    };
    const set = horns[locale] || horns["ru"];
    return set[type] || set[3];
  };

  const getSymbol = (key: string) => {
    const symbols = {
      ru: {
        m: "М",
        f: "Б",
        mm: "ММ",
        fm: "МБ",
        mf: "БМ",
        ff: "ББ",
        mmm: "МММ",
        fmm: "БММ",
        mfm: "МБМ",
        ffm: "ББМ",
        mmf: "ММБ",
        fmf: "БМБ",
        mff: "МББ",
        fff: "БББ",
      },
      en: {
        m: "M",
        f: "F",
        mm: "MM",
        fm: "FM",
        mf: "MF",
        ff: "FF",
        mmm: "MMM",
        fmm: "FMM",
        mfm: "MFM",
        ffm: "FFM",
        mmf: "MMF",
        fmf: "FMF",
        mff: "MFF",
        fff: "FFF",
      },
      uk: {
        m: "М",
        f: "Б",
        mm: "ММ",
        fm: "МБ",
        mf: "БМ",
        ff: "ББ",
        mmm: "МММ",
        fmm: "БММ",
        mfm: "МБМ",
        ffm: "ББМ",
        mmf: "ММБ",
        fmf: "БМБ",
        mff: "МББ",
        fff: "БББ",
      },
    };
    const set = symbols[locale] || symbols["ru"];
    return (set as any)[key] || key.toUpperCase();
  };

  const cert1Labels: any = {
    ru: {
      nickname: "Кличка:",
      birthDate: "Д.рожд.:",
      sex: "Пол:",
      idAbg: "ID ABG:",
      idUa: "ID UA:",
      chip: "Чип:",
      breeder: "Заводчик:",
      breed: "Порода:",
      purity: "Породность:",
      bloodPercent: "Кровность:",
      qtyBorn: "Рожд. в числе:",
      weightBorn: "Вес при рожд.:",
      liveWeight: "Живой вес:",
      color: "Масть:",
      horns: "Рогатость:",
      scoreBorn: "Бал при рожд.:",
      teatsQty: "Кол-во сосков:",
      expertAssessment: "Экс.оц., кол-во бал.:",
      class: "Класс:",
      studbook: "Плем.кн.:",
      tribalValue: "Племінна цінність і власна продуктивність тварини",
      lactNo: "№",
      lactDays: "Дней",
      milkKg: "кг",
      milkClass: "Класс",
      fatPercent: "%",
      fatClass: "Класс",
      proteinPercent: "%",
      proteinClass: "Класс",
      toWhom: "Видане (кому), адреса, телефон:",
      breederFull: "Заводчик, адреса, телефон:",
      recordedCorrectly: "Recorded correctly",
      country: "Украина",
      headOfGsStripe: 'Председатель ГС "................" ФИО',
      signatureSeal: "Подпись и печать...",
      headOfGs: "Голова ГС",
      association: "“Асоціація Племінних Кіз”",
      pib: "ФИО:",
      dateIssued: "Дата видачі:",
      officialDoc: "Official Registration Document",
      male: "Male",
      female: "Female",
      lactHeader: "ЛАКТАЦІЯ / LACTATION",
      milkHeader: "НАДОЙ / MILK YIELD",
      fatHeader: "ЖИР / MILK FAT",
      proteinHeader: "БЕЛОК / MILK PROTEIN",
      pickLactations: "ВЫБЕРИТЕ ЛАКТАЦИИ ДЛЯ ПЕЧАТИ ➔",
      certPreviewMode: "Режим предварительного просмотра сертификата",
      backToProfile: "← Назад к козе",
      printLabel: "Печать",
    },
    en: {
      nickname: "Nickname:",
      birthDate: "D.O.B.:",
      sex: "Sex:",
      idAbg: "ID ABG:",
      idUa: "ID UA:",
      chip: "Chip:",
      breeder: "Breeder:",
      breed: "Breed:",
      purity: "Breed Purity:",
      bloodPercent: "Blood %:",
      qtyBorn: "Born Qty:",
      weightBorn: "Birth Weight:",
      liveWeight: "Live Weight:",
      color: "Color/Coat:",
      horns: "Horn Status:",
      scoreBorn: "Score at birth:",
      teatsQty: "Teats Qty:",
      expertAssessment: "Exp. Assessment:",
      class: "Class:",
      studbook: "Studbook:",
      tribalValue: "Breeding value and own productivity of the animal",
      lactNo: "No.",
      lactDays: "Days",
      milkKg: "kg",
      milkClass: "Class",
      fatPercent: "%",
      fatClass: "Class",
      proteinPercent: "%",
      proteinClass: "Class",
      toWhom: "Issued (to whom), address, telephone:",
      breederFull: "Breeder, address, telephone:",
      recordedCorrectly: "Recorded correctly",
      country: "Ukraine",
      headOfGsStripe: 'Head of GS "................" Name',
      signatureSeal: "Signature and seal...",
      headOfGs: "",
      association: "",
      pib: "Surname:",
      dateIssued: "Date of issue:",
      officialDoc: "Official Registration Document",
      male: "Male",
      female: "Female",
      lactHeader: "LACTATION",
      milkHeader: "MILK YIELD",
      fatHeader: "MILK FAT",
      proteinHeader: "MILK PROTEIN",
      pickLactations: "PICK LACTATIONS TO PRINT ➔",
      certPreviewMode: "Certificate Preview Mode",
      backToProfile: "← Back to Profile",
      printLabel: "Print",
    },
    uk: {
      nickname: "Кличка:",
      birthDate: "Д.нар.:",
      sex: "Стать:",
      idAbg: "ID ABG:",
      idUa: "ID UA:",
      chip: "Чіп:",
      breeder: "Заводчик:",
      breed: "Порода:",
      purity: "Породність:",
      bloodPercent: "Кровність:",
      qtyBorn: "Нар. в числі:",
      weightBorn: "Вага п/н:",
      liveWeight: "Жива вага:",
      color: "Масть:",
      horns: "Рогатість:",
      scoreBorn: "Бал п/н:",
      teatsQty: "Кіл-ть сосків:",
      expertAssessment: "Екс.оц.,к-ть бал.:",
      class: "Клас:",
      studbook: "Плем.кн.:",
      tribalValue: "Племінна цінність і власна продуктивність тварини",
      lactNo: "№",
      lactDays: "Днів",
      milkKg: "кг",
      milkClass: "Клас",
      fatPercent: "%",
      fatClass: "Клас",
      proteinPercent: "%",
      proteinClass: "Клас",
      toWhom: "Видане (кому), адреса, телефон:",
      breederFull: "Заводчик, адреса, телефон:",
      recordedCorrectly: "Recorded correctly",
      country: "Україна / Ukraine",
      headOfGsStripe: 'Голова ГС "................" ПІБ',
      signatureSeal: "Підпис та печатка...",
      headOfGs: "Голова ГС",
      association: "“Асоціація Племінних Кіз”",
      pib: "ПІБ:",
      dateIssued: "Дата видачі:",
      officialDoc: "Official Registration Document",
      male: "Козел / Male",
      female: "Коза / Female",
      lactHeader: "ЛАКТАЦІЯ / LACTATION",
      milkHeader: "НАДІЙ / MILK YIELD",
      fatHeader: "ЖИР / MILK FAT",
      proteinHeader: "МОЛОЧНИЙ БІЛОК / PROTEIN",
      pickLactations: "ОБЕРІТЬ ЛАКТАЦІЇ ДЛЯ ДРУКУ ➔",
      certPreviewMode: "Режим попереднього перегляду сертифіката",
      backToProfile: "← Назад до профілю",
    },
  };

  const getStdb = (alias: string) => {
    if (alias === "ex") return "RExB";
    if (alias === "tg") return "RHB";
    if (alias === "ft") return "RFB";
    return "RHB";
  };

  const cl1 = cert1Labels[locale] || cert1Labels["ru"];

  if (type === "1") {
    const lactations = await getLactations(id);
    const stdb = getStdb(goat.studbook_alias);

    return (
      <div className="min-h-screen bg-white p-4 pb-20 font-sans text-black print:p-0 print:bg-white">
        <style
          dangerouslySetInnerHTML={{
            __html: `
            /* Hide global UI on this page */
            header, nav, footer, .global-nav, .global-footer { display: none !important; }
            body { background: #ffffff !important; }

            @media print {
              /* Print on top of pre-printed blank:
                 Blank already has: UKRAINE header, Association Of Breeding Goats,
                 goat watermark, decorative border, holographic sticker (~6-7cm top).
                 Our content fills the remaining ~22cm below that area. */
              @page { size: A4 portrait; margin: 0; }
              body { 
                background: transparent !important; 
                margin: 0 !important; 
                padding-top: 7.3cm !important;
                padding-left: 0.8cm !important;
                padding-right: 0.8cm !important;
                padding-bottom: 1.0cm !important;
              }
              .cert-title-block {
                margin-top: -1.8cm !important;
                margin-bottom: 1.8cm !important;
              }
              .lactation-table-container {
                margin-top: 45px !important;
              }
              .printable-area { 
                border: none !important; 
                box-shadow: none !important; 
                padding: 0px !important; 
                margin: 0 !important; 
                width: 100% !important; 
                max-width: 100% !important; 
                box-sizing: border-box !important;
                overflow: visible !important;
                background: transparent !important;
              }
              .print-hidden, .no-print { display: none !important; }
              .print-only { display: flex !important; }
              input, textarea { 
                border: none !important; 
                background: transparent !important; 
                padding: 0 !important; 
                margin: 0 !important; 
                height: auto !important; 
                line-height: inherit !important;
                box-shadow: none !important;
                color: black !important;
              }
              /* Banners print black & white */
              .cert-bottom-section {
                background: transparent !important;
                color: black !important;
              }
              .cert-bottom-section * { background: transparent !important; color: black !important; }
              /* Keep brown table header color */
              .productive-table-header {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              /* Compact spacing for print */
              .space-y-4 > * + * { margin-top: 0.4rem !important; }
              .space-y-3\.5 > * + * { margin-top: 0.3rem !important; }
            }
            .grid-table { border-collapse: collapse; width: 100%; border: 1.5px solid #000; }
            .grid-table td { border: 1px solid #000; padding: 2px 5px; font-size: 10.5px; vertical-align: middle; height: 22px; }
            .grid-table input { font-weight: bold !important; }
            .grid-label { font-weight: bold; width: 115px; background: #fff; text-align: left; font-size: 10px; }
            .productive-table { border-collapse: collapse; width: 100%; border: 1.5px solid #000; text-align: center; }
            .productive-table th, .productive-table td { border: 1px solid #000; padding: 0px; font-size: 10px; }
            .productive-table th { background: transparent; color: #000; font-weight: bold; padding: 1px; }
            .productive-table input { width: 100%; height: 100%; border: none; outline: none; text-align: center; background: transparent; font-size: 10.5px; font-weight: bold; }
            .lactation-table-container { margin-top: 40px; }
            .print-only { display: none; }
        `,
          }}
        />

        <div className="print-hidden no-print mb-4 max-w-[950px] mx-auto flex justify-between items-center bg-[#FDFDFD] border border-gray-200 rounded-lg p-3 shadow-sm text-black">
          <Link
            href={`/goats/${id}`}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black border border-gray-300 rounded font-black text-xs uppercase transition-all flex items-center gap-2"
          >
            {cl1.backToProfile}
          </Link>
          <div className="text-xs font-bold text-gray-500">
            {cl1.certPreviewMode}
          </div>
          <PrintButton
            label={cl1.printLabel}
            className="bg-[#522513] text-white px-6 py-2 rounded font-black text-xs uppercase hover:bg-[#3b1a0d] transition-all shadow-md"
          />
        </div>

        <div className="w-full max-w-[950px] mx-auto bg-white p-4 shadow-md relative printable-area border-2 border-black overflow-hidden rounded-sm print:shadow-none print:border-none print:p-0 print:bg-transparent">
          <main className="space-y-2 print:space-y-1">
            {/* Certificate header — 3 lines printed on blank (unique per animal) */}
            <div className="cert-title-block flex flex-col gap-0.5 mx-auto w-full text-center mb-2">
              <input
                className="w-full text-center font-black uppercase text-[15px] bg-transparent border-b border-black/20 pb-0.5 outline-none text-black focus:border-black/60 print:border-none print:pb-0 print:text-[14px]"
                defaultValue={
                  locale === "en"
                    ? stdb === "RHB"
                      ? "BREEDING CERTIFICATE"
                      : "CERTIFICATE OF CONFORMITY"
                    : stdb === "RHB"
                      ? locale === "uk"
                        ? "ПЛЕМІННЕ СВІДОЦТВО"
                        : "ПЛЕМЕННОЕ СВИДЕТЕЛЬСТВО"
                      : locale === "uk"
                        ? "СЕРТИФІКАТ ВІДПОВІДНОСТІ"
                        : "СЕРТИФИКАТ СООТВЕТСТВИЯ"
                }
              />
              <input
                className="w-full text-center font-black uppercase text-[15px] bg-transparent border-b border-black/20 pb-0.5 outline-none text-black focus:border-black/60 print:border-none print:pb-0 print:text-[14px]"
                defaultValue={`${stdb} R${10000 + Number(goat.id)}`}
              />
              <input
                className="w-full text-center font-bold uppercase text-[11px] bg-transparent outline-none text-black focus:text-black print:text-black print:text-[10px]"
                defaultValue={
                  locale === "en"
                    ? "OFFICIAL REGISTRATION DOCUMENT"
                    : locale === "uk"
                      ? "ОФІЦІЙНИЙ РЕЄСТРАЦІЙНИЙ ДОКУМЕНТ"
                      : "ОФИЦИАЛЬНЫЙ РЕГИСТРАЦИОННЫЙ ДОКУМЕНТ"
                }
              />
            </div>

            <table className="grid-table border-[1.5px] border-black">
              <tbody>
                <tr>
                  <td colSpan={2} className="p-0">
                    <input
                      className="w-full h-full font-bold bg-transparent border-none outline-none text-black text-[12px] px-1"
                      defaultValue={goat.name}
                    />
                  </td>
                  <td className="grid-label p-0">
                    <input
                      className="w-full h-full font-bold bg-transparent border-none outline-none text-black text-[10px] px-1"
                      defaultValue={cl1.breed}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full font-bold bg-transparent border-none outline-none text-black text-[11px]"
                      defaultValue={goat.breed_name || ""}
                    />
                  </td>
                  <td className="grid-label p-0">
                    <input
                      className="w-full h-full font-bold bg-transparent border-none outline-none text-black text-[10px] px-1"
                      defaultValue={cl1.horns}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full font-bold bg-transparent uppercase text-[10px] border-none outline-none text-black"
                      defaultValue={getHornType(goat.horns_type)}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="grid-label p-0">
                    <input
                      className="w-full h-full font-bold bg-transparent border-none outline-none text-black text-[10px] px-1"
                      defaultValue={cl1.birthDate}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full bg-transparent border-none outline-none text-black"
                      defaultValue={formatDate(goat.date_born)}
                    />
                  </td>
                  <td className="grid-label p-0">
                    <input
                      className="w-full h-full font-bold bg-transparent border-none outline-none text-black text-[10px] px-1"
                      defaultValue={cl1.purity}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full bg-transparent border-none outline-none text-black"
                      defaultValue={
                        goat.blood_percent != null
                          ? String(goat.blood_percent)
                          : ""
                      }
                    />
                  </td>
                  <td className="grid-label p-0">
                    <input
                      className="w-full h-full font-bold bg-transparent border-none outline-none text-black text-[10px] px-1"
                      defaultValue={cl1.scoreBorn}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full bg-transparent border-none outline-none text-black"
                      defaultValue={
                        goat.goat_score != null ? String(goat.goat_score) : ""
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td className="grid-label p-0">
                    <input
                      className="w-full h-full font-bold bg-transparent border-none outline-none text-black text-[10px] px-1"
                      defaultValue={cl1.sex}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full font-bold bg-transparent uppercase text-[11px] border-none outline-none text-black"
                      defaultValue={goat.sex === 1 ? cl1.male : cl1.female}
                    />
                  </td>
                  <td className="grid-label p-0">
                    <input
                      className="w-full h-full font-bold bg-transparent border-none outline-none text-black text-[10px] px-1"
                      defaultValue={cl1.bloodPercent}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full bg-transparent border-none outline-none text-black"
                      defaultValue={
                        goat.blood_percent !== null &&
                        goat.blood_percent !== undefined
                          ? String(goat.blood_percent)
                          : ""
                      }
                    />
                  </td>
                  <td className="grid-label p-0">
                    <input
                      className="w-full h-full font-bold bg-transparent border-none outline-none text-black text-[10px] px-1"
                      defaultValue={
                        locale === "en" ? "Teats Qty:" : "Кіл-ть сосків:"
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="w-full font-bold bg-transparent border-none outline-none text-black"
                      defaultValue=""
                    />
                  </td>
                </tr>
                <tr>
                  <td className="grid-label p-0">
                    <input
                      className="w-full h-full font-bold bg-transparent border-none outline-none text-black text-[10px] px-1"
                      defaultValue={cl1.idAbg}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full font-bold bg-transparent border-none outline-none text-black"
                      defaultValue={
                        goat.code_abg ||
                        `ABG UA ${goat.id.toString().padStart(6, "0")}`
                      }
                    />
                  </td>
                  <td className="grid-label p-0">
                    <input
                      className="w-full h-full font-bold bg-transparent border-none outline-none text-black text-[10px] px-1"
                      defaultValue={cl1.qtyBorn}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full bg-transparent border-none outline-none text-black"
                      defaultValue={
                        goat.born_qty != null ? String(goat.born_qty) : ""
                      }
                    />
                  </td>
                  <td className="grid-label p-0">
                    <input
                      className="w-full h-full font-bold bg-transparent border-none outline-none text-black text-[10px] px-1"
                      defaultValue={cl1.expertAssessment}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full bg-transparent border-none outline-none font-bold text-black"
                      defaultValue={goat.test_score || ""}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="grid-label p-0">
                    <input
                      className="w-full h-full font-bold bg-transparent border-none outline-none text-black text-[10px] px-1"
                      defaultValue={cl1.idUa}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full bg-transparent border-none outline-none text-black"
                      defaultValue={goat.code_ua || ""}
                    />
                  </td>
                  <td className="grid-label p-0">
                    <input
                      className="w-full h-full font-bold bg-transparent border-none outline-none text-black text-[10px] px-1"
                      defaultValue={cl1.weightBorn}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full bg-transparent border-none outline-none text-black"
                      defaultValue={
                        goat.born_weight != null ? String(goat.born_weight) : ""
                      }
                    />
                  </td>
                  <td className="grid-label p-0">
                    <input
                      className="w-full h-full font-bold bg-transparent border-none outline-none text-black text-[10px] px-1"
                      defaultValue={cl1.class}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full font-bold bg-transparent border-none outline-none text-black"
                      defaultValue={goat.test_class || ""}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="grid-label p-0">
                    <input
                      className="w-full h-full font-bold bg-transparent border-none outline-none text-black text-[10px] px-1"
                      defaultValue={cl1.chip}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full font-bold bg-transparent border-none outline-none text-black"
                      defaultValue={goat.code_chip || ""}
                    />
                  </td>
                  <td className="grid-label p-0">
                    <input
                      className="w-full h-full font-bold bg-transparent border-none outline-none text-black text-[10px] px-1"
                      defaultValue={cl1.liveWeight}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full bg-transparent border-none outline-none text-black"
                      defaultValue=""
                    />
                  </td>
                  <td className="grid-label p-0">
                    <input
                      className="w-full h-full font-bold bg-transparent border-none outline-none text-black text-[10px] px-1"
                      defaultValue={cl1.studbook}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full font-bold bg-transparent border-none outline-none text-black"
                      defaultValue={`${stdb} R${10000 + Number(goat.id)}`}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="grid-label p-0">
                    <input
                      className="w-full h-full font-bold bg-transparent border-none outline-none text-black text-[10px] px-1"
                      defaultValue={cl1.breeder}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full font-bold bg-transparent text-[10px] border-none outline-none text-black"
                      defaultValue={
                        goat.breeder_manual || goat.user_farm_name || ""
                      }
                    />
                  </td>
                  <td className="grid-label p-0">
                    <input
                      className="w-full h-full font-bold bg-transparent border-none outline-none text-black text-[10px] px-1"
                      defaultValue={cl1.color}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full bg-transparent border-none outline-none text-black"
                      defaultValue={goat.special || ""}
                    />
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tbody>
            </table>

            {/* Lactation Table component */}
            <div className="w-full lactation-table-container">
              <CertificateLactationTable lactations={lactations} cl1={cl1} />
            </div>

            {/* ── BOTTOM SECTION matching physical certificate ── */}
            <div className="cert-bottom-section mt-5 border border-dashed border-gray-200 rounded-sm p-4 print:border-none print:p-0 print:mt-8 text-black">
              {/* Row 1: Issued to whom */}
              <div className="flex items-start px-2 py-1.5 gap-4 border-b border-dashed border-black/5 print:border-none print:px-0 print:py-1">
                <input
                  className="text-[11px] font-bold text-black shrink-0 w-60 leading-tight bg-transparent border-none outline-none"
                  defaultValue={cl1.toWhom}
                />
                <input
                  className="flex-1 bg-transparent border-none outline-none text-[11px] font-semibold text-black"
                  defaultValue={`${goat.user_farm_name || goat.breeder_manual || ""}${goat.user_phone ? ", " + goat.user_phone : ""}${goat.user_email ? ", " + goat.user_email : ""}`}
                />
              </div>

              {/* Row 2: Breeder */}
              <div className="flex items-start px-2 py-1.5 gap-4 border-b border-dashed border-black/5 print:border-none print:px-0 print:py-1">
                <input
                  className="text-[11px] font-bold text-black shrink-0 w-60 leading-tight bg-transparent border-none outline-none"
                  defaultValue={cl1.breederFull}
                />
                <input
                  className="flex-1 bg-transparent border-none outline-none text-[11px] font-semibold text-black"
                  defaultValue={`${goat.breeder_manual || goat.user_farm_name || ""}${goat.user_phone ? ", " + goat.user_phone : ""}`}
                />
              </div>

              {/* Row 3: Recorded correctly */}
              <div className="px-2 py-2 border-b border-dashed border-black/5 print:border-none print:px-0 print:py-2">
                <input
                  className="w-full bg-transparent border-none outline-none font-black text-[11.5px] text-black italic"
                  defaultValue={cl1.recordedCorrectly}
                />
              </div>

              {/* Row 4: Bottom strip: date/org left | name center-right | empty sticker space far-right */}
              <div className="flex justify-between items-start relative min-h-[90px] mt-4 px-2 py-2 print:px-0 print:py-0 print:mt-6 bg-transparent text-black">
                {/* Left Column: 2 lines stacked vertically */}
                <div className="flex flex-col gap-2.5 flex-1 min-w-0 pr-[40px] print:pr-[40px]">
                  {/* Line 1: Head of GS / Title */}
                  <input
                    className="bg-transparent border-none outline-none text-[11px] font-bold text-black w-full leading-tight"
                    defaultValue={
                      locale === "en"
                        ? 'Head of GS "Association of Breeding Goats"'
                        : locale === "uk"
                          ? 'Голова ГС "Асоціація Племінних Кіз"'
                          : 'Председатель ГС "Асоціація Племінних Кіз"'
                    }
                  />

                  {/* Line 2: Date Label & Value */}
                  <input
                    className="bg-transparent border-none outline-none text-[11px] text-black font-bold w-full"
                    defaultValue={`${cl1.dateIssued || "Date of issue / Дата видачі:"} ${formatDate(new Date())}`}
                  />
                </div>

                {/* Center-Right Column: Name, aligned vertically with Line 2 */}
                <div className="flex items-center justify-center self-center shrink-0 pr-12 print:pr-12">
                  <input
                    className="bg-transparent border-none outline-none text-[12.5px] font-bold text-black text-center w-48"
                    defaultValue={
                      locale === "en" ? "Alekseeva M.V." : "Алексєєва М.В."
                    }
                  />
                </div>

                {/* Far Right Column: Empty space for holographic sticker (blank space) */}
                <div className="w-[120px] print:w-[120px] h-10 shrink-0 self-center flex items-center justify-center">
                  {/* Faint dashed boundary only on screen as a guide where the sticker goes */}
                  <div
                    className="no-print w-10 h-10 rounded-full border border-dashed border-gray-300 opacity-40 shrink-0"
                    title="Physical holographic sticker will be placed here after printing"
                  ></div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (type === "2") {
    const selections = await getCertSelections(id);
    const ancestorLacts = await fetchAncestorLacts(id);
    const prefixes = [
      "m",
      "f",
      "mm",
      "fm",
      "mf",
      "ff",
      "mmm",
      "fmm",
      "mfm",
      "ffm",
      "mmf",
      "fmf",
      "mff",
      "fff",
    ];

    const treeRes = await query(
      `
        WITH RECURSIVE ancestry AS (
          SELECT id, name, id_mother, id_father, 0 as level, '' as path FROM animals WHERE id = $1
          UNION ALL
          SELECT a.id, a.name, a.id_mother, a.id_father, anc.level + 1,
                 CASE 
                   WHEN a.id = anc.id_mother THEN anc.path || 'm' 
                   WHEN a.id = anc.id_father THEN anc.path || 'f'
                 END
          FROM animals a
          JOIN ancestry anc ON (a.id = anc.id_mother OR a.id = anc.id_father)
          WHERE anc.level < 4
        )
        SELECT id, path FROM ancestry WHERE path != ''
      `,
      [id],
    );

    const pathIdMap: any = {};
    treeRes.rows.forEach((r: any) => (pathIdMap[r.path] = r.id));
    const allAncestorIds = treeRes.rows.map((r) => r.id);

    const ancestorDetails = await getAncestorDetails(allAncestorIds);
    const detailsMap: any = {};
    ancestorDetails.forEach((d: any) => {
      const path = Object.keys(pathIdMap).find((p) => pathIdMap[p] === d.id);
      if (path) detailsMap[path] = d;
    });

    const allSelectedLactIds: number[] = [];
    prefixes.forEach((p) => {
      [1, 2, 3].forEach((j) => {
        const lid = selections[`id_${p}_row${j}`];
        if (lid && !isNaN(Number(lid))) allSelectedLactIds.push(Number(lid));
      });
    });

    const lacts = await getAncestorLactations(allSelectedLactIds);
    const lactMap: any = {};
    lacts.forEach((l: any) => (lactMap[l.id] = l));

    const cert2Labels: any = {
      ru: {
        average: "Средние показатели",
        days: "Дней лактации",
        milk: "Надой",
        fat: "Молочный жир",
        protein: "Молочный белок",
        kg: "кг",
        class: "Класс",
        offspring: "Потомки",
        offspringId: "ID Потомка",
        breed: "Порода",
        born: "Рожд:",
        blood: "Кровь:",
        classLabel: "Класс:",
        score: "Балл:",
        owner: "Влад:",
        recordedCorrectly: "Recorded Correctly / ПОДТВЕРЖДЕНО:",
        certStatement:
          "Этот сертификат является официальным документом, подтверждающим племенную ценность животного.",
        headOfGs: "HEAD OF GS: Alekseeva M.V. / _______________",
        date: "DATE:",
        ancestors: "Пращуры",
        descendants: "Потомки",
      },
      en: {
        average: "Average Indicators",
        days: "Lactation Days",
        milk: "Milk Yield",
        fat: "Milk Fat",
        protein: "Milk Protein",
        kg: "kg",
        class: "Class",
        offspring: "Offspring",
        offspringId: "Offspring ID",
        breed: "Breed",
        born: "Born:",
        blood: "Blood:",
        classLabel: "Class:",
        score: "Score:",
        owner: "Owner:",
        recordedCorrectly: "Recorded Correctly / CONFIRMED:",
        certStatement:
          "This certificate is an official document confirming the breeding value of the animal.",
        headOfGs: "HEAD OF GS: Alekseeva M.V. / _______________",
        date: "DATE:",
        ancestors: "Ancestors",
        descendants: "Offspring",
      },
      uk: {
        average: "Середні показники",
        days: "Днів лактації",
        milk: "Надій",
        fat: "Молочний жир",
        protein: "Молочний білок",
        kg: "кг",
        class: "Клас",
        offspring: "Нащадки",
        offspringId: "ID Нащадка",
        breed: "Порода",
        born: "Нар:",
        blood: "Кров:",
        classLabel: "Клас:",
        score: "Бал:",
        owner: "Власн:",
        recordedCorrectly: "Recorded Correctly / ПІДТВЕРДЖЕНО:",
        certStatement:
          "Цей сертифікат є офіційним документом, що підтверджує племінну цінність тварини.",
        headOfGs: "HEAD OF GS: Alekseeva M.V. / _______________",
        date: "DATE:",
        ancestors: "Пращури",
        descendants: "Нащадки",
      },
    };

    const cl2 = cert2Labels[locale] || cert2Labels["ru"];

    const renderLactTable = async (p: string, anc: any) => {
      let rows = [1, 2, 3]
        .map((j) => {
          const lid = selections[`id_${p}_row${j}`];
          return lactMap[lid];
        })
        .filter(Boolean);

      const isMale = anc.sex === 1;
      if (rows.length === 0 && isMale && anc.id) {
        // For males, we fetch daughters data as fallback
        const daughters = await getOffspringLactations(anc.id);
        rows = daughters;
      }

      let avgMilk = 0,
        avgFat = 0,
        avgProt = 0;
      if (rows.length > 0) {
        avgMilk =
          rows.reduce(
            (acc: any, r: any) => acc + (parseFloat(r.milk) || 0),
            0,
          ) / rows.length;
        avgFat =
          rows.reduce((acc: any, r: any) => acc + (parseFloat(r.fat) || 0), 0) /
          rows.length;
        avgProt =
          rows.reduce(
            (acc: any, r: any) => acc + (parseFloat(r.protein) || 0),
            0,
          ) / rows.length;
      }

      if (isMale) {
        return (
          <table
            className="w-full text-[8px] border-collapse text-center text-black border-t border-black"
            style={{ borderTopWidth: "1px" }}
          >
            <thead className="bg-white border-b border-black font-bold uppercase text-[7px] text-black">
              <tr className="border-b border-black h-[14px]">
                <th
                  rowSpan={2}
                  className="border-r border-black p-0 w-[18%] align-middle leading-[8px] text-[6.5px]"
                >
                  {cl2.ancestors}
                  <br />
                  <span className="font-normal text-[5.5px]">
                    {cl2.descendants}
                  </span>
                </th>
                <th colSpan={2} className="border-r border-black py-0.5">
                  {cl2.days}
                </th>
                <th colSpan={2} className="border-r border-black py-0.5">
                  {cl2.milk}
                </th>
                <th colSpan={2} className="border-r border-black py-0.5">
                  {cl2.fat}
                </th>
                <th colSpan={2} className="py-0.5">
                  {cl2.protein}
                </th>
              </tr>
              <tr className="text-[6.5px] border-b border-black h-[11px]">
                <th className="border-r border-black py-0.5 w-6">№</th>
                <th className="border-r border-black py-0.5 w-[12%] whitespace-nowrap">
                  {cl2.days}
                </th>
                <th className="border-r border-black py-0.5 w-[14%]">
                  {cl2.kg}
                </th>
                <th className="border-r border-black py-0.5 w-[10%]">
                  {cl2.class}
                </th>
                <th className="border-r border-black py-0.5 w-[10%]">%</th>
                <th className="border-r border-black py-0.5 w-[10%]">
                  {cl2.class}
                </th>
                <th className="border-r border-black py-0.5 w-[10%]">%</th>
                <th className="py-0.5 w-[10%]">{cl2.class}</th>
              </tr>
            </thead>
            <tbody className="font-bold text-[7.5px] text-black">
              {[...Array(3)].map((_, i) => {
                const r = rows[i] || {};
                return (
                  <tr
                    key={i}
                    className="border-b border-black h-4 leading-none"
                  >
                    <td className="p-0 border-r border-black">
                      <input
                        className="w-full h-full border-none outline-none text-center bg-transparent text-[7.5px] uppercase"
                        defaultValue={r.offspring_name || ""}
                      />
                    </td>
                    <td className="p-0 border-r border-black">
                      <input
                        className="w-full h-full border-none outline-none text-center bg-transparent text-[7.5px]"
                        defaultValue={
                          r.lact_no || (rows[i] ? String(i + 1) : "")
                        }
                      />
                    </td>
                    <td className="p-0 border-r border-black">
                      <input
                        className="w-full h-full border-none outline-none text-center bg-transparent text-[7.5px]"
                        defaultValue={r.lact_days || ""}
                      />
                    </td>
                    <td className="p-0 border-r border-black">
                      <input
                        className="w-full h-full border-none outline-none text-center bg-transparent font-black text-[7.5px]"
                        defaultValue={r.milk || ""}
                      />
                    </td>
                    <td className="p-0 border-r border-black">
                      <input
                        className="w-full h-full border-none outline-none text-center bg-transparent text-[7.5px]"
                        defaultValue={rows[i] ? "Elite" : ""}
                      />
                    </td>
                    <td className="p-0 border-r border-black">
                      <input
                        className="w-full h-full border-none outline-none text-center bg-transparent text-[7.5px]"
                        defaultValue={r.fat || ""}
                      />
                    </td>
                    <td className="p-0 border-r border-black">
                      <input
                        className="w-full h-full border-none outline-none text-center bg-transparent text-[7.5px]"
                        defaultValue={rows[i] ? "Elite" : ""}
                      />
                    </td>
                    <td className="p-0 border-r border-black">
                      <input
                        className="w-full h-full border-none outline-none text-center bg-transparent text-[7.5px]"
                        defaultValue={r.protein || ""}
                      />
                    </td>
                    <td className="p-0">
                      <input
                        className="w-full h-full border-none outline-none text-center bg-transparent text-[7.5px]"
                        defaultValue={rows[i] ? "Elite" : ""}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="font-bold text-[7.5px] uppercase text-black">
              <tr className="h-4 leading-none">
                <td
                  colSpan={3}
                  className="border-r border-black text-center py-0.5"
                >
                  {cl2.average}
                </td>
                <td className="border-r border-black py-0.5">
                  <input
                    className="w-full h-full border-none outline-none text-center font-black"
                    defaultValue={rows.length > 0 ? avgMilk.toFixed(1) : ""}
                  />
                </td>
                <td className="border-r border-black py-0.5">
                  {rows.length > 0 ? "Elite" : ""}
                </td>
                <td className="border-r border-black py-0.5">
                  <input
                    className="w-full h-full border-none outline-none text-center"
                    defaultValue={rows.length > 0 ? avgFat.toFixed(2) : ""}
                  />
                </td>
                <td className="border-r border-black py-0.5">
                  {rows.length > 0 ? "Elite" : ""}
                </td>
                <td className="border-r border-black py-0.5">
                  <input
                    className="w-full h-full border-none outline-none text-center"
                    defaultValue={rows.length > 0 ? avgProt.toFixed(2) : ""}
                  />
                </td>
                <td className="py-0.5">{rows.length > 0 ? "Elite" : ""}</td>
              </tr>
            </tfoot>
          </table>
        );
      } else {
        return (
          <table
            className="w-full text-[8px] border-collapse text-center text-black border-t border-black"
            style={{ borderTopWidth: "1px" }}
          >
            <thead className="bg-white border-b border-black font-bold uppercase text-[7px] text-black">
              <tr className="border-b border-black h-[14px]">
                <th colSpan={2} className="border-r border-black py-0.5">
                  {cl2.days}
                </th>
                <th colSpan={2} className="border-r border-black py-0.5">
                  {cl2.milk}
                </th>
                <th colSpan={2} className="border-r border-black py-0.5">
                  {cl2.fat}
                </th>
                <th colSpan={2} className="py-0.5">
                  {cl2.protein}
                </th>
              </tr>
              <tr className="text-[6.5px] border-b border-black h-[11px]">
                <th className="border-r border-black py-0.5 w-6">№</th>
                <th className="border-r border-black py-0.5 w-[14%] whitespace-nowrap">
                  {cl2.days}
                </th>
                <th className="border-r border-black py-0.5 w-[18%]">
                  {cl2.kg}
                </th>
                <th className="border-r border-black py-0.5 w-[11%]">
                  {cl2.class}
                </th>
                <th className="border-r border-black py-0.5 w-[12%]">%</th>
                <th className="border-r border-black py-0.5 w-[11%]">
                  {cl2.class}
                </th>
                <th className="border-r border-black py-0.5 w-[12%]">%</th>
                <th className="py-0.5 w-[11%]">{cl2.class}</th>
              </tr>
            </thead>
            <tbody className="font-bold text-[7.5px] text-black">
              {[...Array(3)].map((_, i) => {
                const r = rows[i] || {};
                return (
                  <tr
                    key={i}
                    className="border-b border-black h-4 leading-none"
                  >
                    <td className="p-0 border-r border-black">
                      <input
                        className="w-full h-full border-none outline-none text-center bg-transparent text-[7.5px]"
                        defaultValue={
                          r.lact_no || (rows[i] ? String(i + 1) : "")
                        }
                      />
                    </td>
                    <td className="p-0 border-r border-black">
                      <input
                        className="w-full h-full border-none outline-none text-center bg-transparent text-[7.5px]"
                        defaultValue={r.lact_days || ""}
                      />
                    </td>
                    <td className="p-0 border-r border-black">
                      <input
                        className="w-full h-full border-none outline-none text-center bg-transparent font-black text-[7.5px]"
                        defaultValue={r.milk || ""}
                      />
                    </td>
                    <td className="p-0 border-r border-black">
                      <input
                        className="w-full h-full border-none outline-none text-center bg-transparent text-[7.5px]"
                        defaultValue={rows[i] ? "Elite" : ""}
                      />
                    </td>
                    <td className="p-0 border-r border-black">
                      <input
                        className="w-full h-full border-none outline-none text-center bg-transparent text-[7.5px]"
                        defaultValue={r.fat || ""}
                      />
                    </td>
                    <td className="p-0 border-r border-black">
                      <input
                        className="w-full h-full border-none outline-none text-center bg-transparent text-[7.5px]"
                        defaultValue={rows[i] ? "Elite" : ""}
                      />
                    </td>
                    <td className="p-0 border-r border-black">
                      <input
                        className="w-full h-full border-none outline-none text-center bg-transparent text-[7.5px]"
                        defaultValue={r.protein || ""}
                      />
                    </td>
                    <td className="p-0">
                      <input
                        className="w-full h-full border-none outline-none text-center bg-transparent text-[7.5px]"
                        defaultValue={rows[i] ? "Elite" : ""}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="font-bold text-[7.5px] uppercase text-black">
              <tr className="h-4 leading-none">
                <td
                  colSpan={2}
                  className="border-r border-black text-center py-0.5"
                >
                  {cl2.average}
                </td>
                <td className="border-r border-black py-0.5">
                  <input
                    className="w-full h-full border-none outline-none text-center font-black"
                    defaultValue={rows.length > 0 ? avgMilk.toFixed(1) : ""}
                  />
                </td>
                <td className="border-r border-black py-0.5">
                  {rows.length > 0 ? "Elite" : ""}
                </td>
                <td className="border-r border-black py-0.5">
                  <input
                    className="w-full h-full border-none outline-none text-center"
                    defaultValue={rows.length > 0 ? avgFat.toFixed(2) : ""}
                  />
                </td>
                <td className="border-r border-black py-0.5">
                  {rows.length > 0 ? "Elite" : ""}
                </td>
                <td className="border-r border-black py-0.5">
                  <input
                    className="w-full h-full border-none outline-none text-center"
                    defaultValue={rows.length > 0 ? avgProt.toFixed(2) : ""}
                  />
                </td>
                <td className="py-0.5">{rows.length > 0 ? "Elite" : ""}</td>
              </tr>
            </tfoot>
          </table>
        );
      }
    };

    const renderMiniLactTableRows = async (p: string, d: any) => {
      const dbPrefixMap: Record<string, string> = {
        mf: "fm",
        fm: "mf",
      };
      const dbPrefix = dbPrefixMap[p] || p;

      let rows = [1, 2, 3]
        .map((j) => {
          const lid = selections[`id_${dbPrefix}_row${j}`];
          return lactMap[lid];
        })
        .filter(Boolean);

      const isMale = d.sex === 1;
      if (rows.length === 0 && isMale && d.id) {
        const daughters = await getOffspringLactations(d.id);
        rows = daughters;
      }

      const headers = {
        ru: ["Дней лакт.", "Надой", "Жир %", "Белок %", "Класс"],
        uk: ["Днів лакт.", "Надій", "Жир %", "Білок %", "Клас"],
        en: ["Days", "Milk", "Fat %", "Protein %", "Class"],
      };
      const lbls = headers[locale] || headers["ru"];

      return (
        <>
          <tr
            className="border-t border-b border-black h-[11px] bg-white font-bold uppercase text-[6.5px] text-black"
            style={{ borderTopWidth: "0.6px", borderBottomWidth: "1px" }}
          >
            <td
              className="border-r border-black py-0.5 w-[15%] text-center select-none"
              style={{ borderRightWidth: "1px" }}
            >
              {lbls[0]}
            </td>
            <td
              className="border-r border-black py-0.5 w-[35%] text-center select-none"
              style={{ borderRightWidth: "1px" }}
            >
              {lbls[1]}
            </td>
            <td
              className="border-r border-black py-0.5 w-[15%] text-center select-none"
              style={{ borderRightWidth: "1px" }}
            >
              {lbls[2]}
            </td>
            <td
              className="border-r border-black py-0.5 w-[15%] text-center select-none"
              style={{ borderRightWidth: "1px" }}
            >
              {lbls[3]}
            </td>
            <td className="py-0.5 w-[20%] text-center select-none">
              {lbls[4]}
            </td>
          </tr>
          {[...Array(3)].map((_, i) => {
            const r = rows[i] || {};
            const isLast = i === 2;
            return (
              <tr
                key={i}
                className={
                  isLast
                    ? "h-[10.5px] leading-none"
                    : "border-b border-black h-[10.5px] leading-none"
                }
                style={isLast ? {} : { borderBottomWidth: "1px" }}
              >
                <td
                  className="p-0 border-r border-black w-[15%]"
                  style={{ borderRightWidth: "1px" }}
                >
                  <input
                    className="w-full h-full border-none outline-none text-center bg-transparent text-[7.5px]"
                    defaultValue={r.lact_days || ""}
                  />
                </td>
                <td
                  className="p-0 border-r border-black w-[35%]"
                  style={{ borderRightWidth: "1px" }}
                >
                  <input
                    className="w-full h-full border-none outline-none text-center bg-transparent font-black text-[7.5px]"
                    defaultValue={r.milk || ""}
                  />
                </td>
                <td
                  className="p-0 border-r border-black w-[15%]"
                  style={{ borderRightWidth: "1px" }}
                >
                  <input
                    className="w-full h-full border-none outline-none text-center bg-transparent text-[7.5px]"
                    defaultValue={r.fat || ""}
                  />
                </td>
                <td
                  className="p-0 border-r border-black w-[15%]"
                  style={{ borderRightWidth: "1px" }}
                >
                  <input
                    className="w-full h-full border-none outline-none text-center bg-transparent text-[7.5px]"
                    defaultValue={r.protein || ""}
                  />
                </td>
                <td className="p-0 w-[20%]">
                  <input
                    className="w-full h-full border-none outline-none text-center bg-transparent text-[7.5px]"
                    defaultValue={rows[i] ? "Elite" : ""}
                  />
                </td>
              </tr>
            );
          })}
        </>
      );
    };

    const renderAncBlock = async (p: string, symbol: string) => {
      const d = detailsMap[p] || {};

      const labels: Record<string, Record<string, string>> = {
        ru: {
          nickname: "Кличка",
          idAbg: "ID ABG",
          stdb: "Племкн.",
          idUa: "ID UA",
          dob: "д.н.",
          purity: "Породн.",
          expAss: "Оц.екс.бал",
          breed: "Порода",
          class: "Класс",
          bloodline: "Кровность %",
        },
        uk: {
          nickname: "Кличка",
          idAbg: "ID ABG",
          stdb: "Племкн.",
          idUa: "ID UA",
          dob: "д.н.",
          purity: "Породн.",
          expAss: "Оц.екс.бал",
          breed: "Порода",
          class: "Клас",
          bloodline: "Кровність %",
        },
        en: {
          nickname: "Name",
          idAbg: "ID ABG",
          stdb: "Stdb.",
          idUa: "ID UA",
          dob: "D.O.B.",
          purity: "Purity",
          expAss: "Exp.Ass.",
          breed: "Breed",
          class: "Class",
          bloodline: "Bloodline %",
        },
      };

      const lbl = labels[locale] || labels["ru"];

      // Owner label per locale
      const ownerLabel =
        locale === "en" ? "Owner:" : locale === "uk" ? "Власник:" : "Влад.";
      const bloodLabel =
        locale === "en" ? "Blood:" : locale === "uk" ? "Кровність:" : "Кровн.";
      const chipLabel =
        locale === "en" ? "Chip:" : locale === "uk" ? "Чіп:" : "Чип:";

      if (p.length > 1) {
        return (
          <table
            className="w-full border-collapse text-[7.5px] font-bold bg-white h-full select-text text-black border-t border-black"
            style={{ borderTopWidth: "1px", tableLayout: "fixed" }}
          >
            <colgroup>
              <col style={{ width: "15%" }} />
              <col style={{ width: "35%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>
            <tbody>
              {/* Row 1: Symbol & Name */}
              <tr
                className="border-b border-black h-[11px]"
                style={{ borderBottomWidth: "1px" }}
              >
                <td className="w-[15%] p-0 text-black">
                  <input
                    className="w-full h-full border-none outline-none font-black text-[11px] text-center bg-transparent py-0 text-black"
                    defaultValue={symbol}
                  />
                </td>
                <td className="p-0" colSpan={4}>
                  <input
                    className="w-full h-full border-none outline-none text-left pl-0 bg-transparent font-bold text-[8px] uppercase py-0 text-black"
                    defaultValue={d.name || ""}
                  />
                </td>
              </tr>

              {/* Row 2: ID ABG | value | ID UA | value */}
              <tr
                className="border-b border-black h-[11px]"
                style={{ borderBottomWidth: "1px" }}
              >
                <td
                  className="w-[15%] border-r border-black p-0 text-black"
                  style={{ borderRightWidth: "1px" }}
                >
                  <input
                    className="w-full h-full border-none outline-none font-bold text-black text-center px-0.5 text-[7px] bg-transparent py-0"
                    defaultValue={lbl.idAbg}
                  />
                </td>
                <td
                  className="border-r border-black p-0 w-[35%]"
                  style={{ borderRightWidth: "1px" }}
                >
                  <input
                    className="w-full h-full border-none outline-none text-center bg-transparent font-bold text-[8px] py-0 text-black"
                    defaultValue={d.code_abg || ""}
                  />
                </td>
                <td
                  className="border-r border-black p-0 w-[15%]"
                  style={{ borderRightWidth: "1px" }}
                >
                  <input
                    className="w-full h-full border-none outline-none font-bold text-black text-center px-0.5 text-[7px] bg-transparent py-0"
                    defaultValue={lbl.idUa}
                  />
                </td>
                <td className="p-0 w-[35%]" colSpan={2}>
                  <input
                    className="w-full h-full border-none outline-none text-center bg-transparent font-bold text-[8px] py-0 text-black"
                    defaultValue={
                      d.code_ua || (d.id ? "R" + (10000 + Number(d.id)) : "")
                    }
                  />
                </td>
              </tr>

              {/* Row 3: Племкн. (Stdb) | value | Bloodline % | value */}
              <tr
                className="border-b border-black h-[11px]"
                style={{ borderBottomWidth: "1px" }}
              >
                <td
                  className="w-[15%] border-r border-black p-0 text-black"
                  style={{ borderRightWidth: "1px" }}
                >
                  <input
                    className="w-full h-full border-none outline-none font-bold text-black text-center px-0.5 text-[7px] bg-transparent py-0"
                    defaultValue={lbl.stdb}
                  />
                </td>
                <td
                  className="border-r border-black p-0 w-[35%]"
                  style={{ borderRightWidth: "1px" }}
                >
                  <input
                    className="w-full h-full border-none outline-none text-center bg-transparent font-bold text-[8px] py-0 text-black"
                    defaultValue={getStdb(d.studbook_alias)}
                  />
                </td>
                <td
                  className="border-r border-black p-0 w-[15%]"
                  style={{ borderRightWidth: "1px" }}
                >
                  <input
                    className="w-full h-full border-none outline-none font-bold text-black text-center px-0.5 text-[7px] bg-transparent py-0"
                    defaultValue=""
                  />
                </td>
                <td className="p-0 w-[35%]" colSpan={2}>
                  <input
                    className="w-full h-full border-none outline-none text-center bg-transparent font-bold text-[8px] py-0 text-black"
                    defaultValue=""
                  />
                </td>
              </tr>

              {/* Row 4: д.н. (D.O.B.) | value | (blank) | (blank) */}
              <tr
                className="border-b border-black h-[11px]"
                style={{ borderBottomWidth: "1px" }}
              >
                <td
                  className="w-[15%] border-r border-black p-0 text-black"
                  style={{ borderRightWidth: "1px" }}
                >
                  <input
                    className="w-full h-full border-none outline-none font-bold text-black text-center px-0.5 text-[7px] bg-transparent py-0"
                    defaultValue={lbl.dob}
                  />
                </td>
                <td
                  className="border-r border-black p-0 w-[35%]"
                  style={{ borderRightWidth: "1px" }}
                >
                  <input
                    className="w-full h-full border-none outline-none text-center bg-transparent font-bold text-[8px] py-0 text-black"
                    defaultValue={
                      d.date_born
                        ? new Date(d.date_born).toLocaleDateString(
                            locale === "en" ? "en-US" : "uk-UA",
                          )
                        : ""
                    }
                  />
                </td>
                <td
                  className="border-r border-black p-0 w-[15%]"
                  style={{ borderRightWidth: "1px" }}
                >
                  <input
                    className="w-full h-full border-none outline-none text-center bg-transparent"
                    defaultValue=""
                  />
                </td>
                <td className="p-0 w-[35%]" colSpan={2}>
                  <input
                    className="w-full h-full border-none outline-none text-center bg-transparent"
                    defaultValue=""
                  />
                </td>
              </tr>

              {/* Row 5: Порода | value | Оц.екс.бал | value */}
              <tr
                className="border-b border-black h-[11px]"
                style={{ borderBottomWidth: "1px" }}
              >
                <td
                  className="w-[15%] border-r border-black p-0 text-black"
                  style={{ borderRightWidth: "1px" }}
                >
                  <input
                    className="w-full h-full border-none outline-none font-bold text-black text-center px-0.5 text-[7px] bg-transparent py-0"
                    defaultValue={lbl.breed}
                  />
                </td>
                <td
                  className="border-r border-black p-0 w-[35%]"
                  style={{ borderRightWidth: "1px" }}
                >
                  <input
                    className="w-full h-full border-none outline-none text-center bg-transparent font-bold text-[8px] py-0 text-black"
                    defaultValue={d.breed_alias || d.breed_name || ""}
                  />
                </td>
                <td
                  className="border-r border-black p-0 w-[15%]"
                  style={{ borderRightWidth: "1px" }}
                >
                  <input
                    className="w-full h-full border-none outline-none font-bold text-black text-center px-0.5 text-[7px] bg-transparent py-0"
                    defaultValue={lbl.expAss}
                  />
                </td>
                <td className="p-0 w-[35%]" colSpan={2}>
                  <input
                    className="w-full h-full border-none outline-none text-center bg-transparent font-bold text-[8px] py-0 text-black"
                    defaultValue={d.test_score || ""}
                  />
                </td>
              </tr>

              {/* Row 6: Породн | value | Клас | value */}
              <tr className="h-[11px]">
                <td
                  className="w-[15%] border-r border-black p-0 text-black"
                  style={{ borderRightWidth: "1px" }}
                >
                  <input
                    className="w-full h-full border-none outline-none font-bold text-black text-center px-0.5 text-[7px] bg-transparent py-0"
                    defaultValue={lbl.purity}
                  />
                </td>
                <td
                  className="border-r border-black p-0 w-[35%]"
                  style={{ borderRightWidth: "1px" }}
                >
                  <input
                    className="w-full h-full border-none outline-none text-center bg-transparent font-bold text-[8px] py-0 text-black"
                    defaultValue={
                      d.blood_percent !== null && d.blood_percent !== undefined
                        ? `${d.blood_percent}`
                        : ""
                    }
                  />
                </td>
                <td
                  className="border-r border-black p-0 w-[15%]"
                  style={{ borderRightWidth: "1px" }}
                >
                  <input
                    className="w-full h-full border-none outline-none font-bold text-black text-center px-0.5 text-[7px] bg-transparent py-0"
                    defaultValue={lbl.class}
                  />
                </td>
                <td className="p-0 w-[35%]" colSpan={2}>
                  <input
                    className="w-full h-full border-none outline-none text-center bg-transparent font-bold text-[8px] py-0 text-black"
                    defaultValue={d.test_class || "Elite"}
                  />
                </td>
              </tr>

              {/* Lactation table rows (directly sibling inside the same table for perfect grid alignment) */}
              {await renderMiniLactTableRows(p, d)}
            </tbody>
          </table>
        );
      }

      return (
        <table
          className="w-full border-collapse text-[7.5px] font-bold bg-white h-full select-text text-black border-t border-black"
          style={{ borderTopWidth: "1px" }}
        >
          <tbody>
            {/* Row 1: Symbol & Name */}
            <tr
              className="border-b border-black h-[17px]"
              style={{ borderBottomWidth: "1px" }}
            >
              <td className="w-[10%] p-0 text-black">
                <input
                  className="w-full h-full border-none outline-none font-black text-[11px] text-center bg-transparent py-0 text-black"
                  defaultValue={symbol}
                />
              </td>
              <td className="p-0" colSpan={4}>
                <div className="flex items-center h-full px-1">
                  <input
                    className="flex-1 h-full border-none outline-none bg-transparent font-bold text-[8px] uppercase py-0 text-black text-left pl-0"
                    defaultValue={(
                      (d.name || "") +
                      "   " +
                      (d.id ? "R" + (10000 + Number(d.id)) : "")
                    ).trim()}
                  />
                </div>
              </td>
            </tr>

            {/* Row 2: ID ABG | value | Племкнига value | ID UA | value */}
            <tr className="h-[17px]">
              <td className="w-[10%] p-0 text-black">
                <input
                  className="w-full h-full border-none outline-none font-bold text-black text-center px-0.5 text-[7px] bg-transparent py-0"
                  defaultValue={lbl.idAbg}
                />
              </td>
              <td className="p-0 w-[20%]">
                <input
                  className="w-full h-full border-none outline-none text-center bg-transparent font-bold text-[8px] py-0 text-black"
                  defaultValue={d.code_abg || ""}
                />
              </td>
              <td className="p-0 w-[30%]">
                <div className="flex items-center px-1 h-full gap-2">
                  <span className="font-bold text-[7.5px] text-black select-none whitespace-nowrap">
                    {lbl.stdb}
                  </span>
                  <input
                    className="flex-1 h-full border-none outline-none bg-transparent font-bold text-[8px] py-0 text-black"
                    defaultValue={getStdb(d.studbook_alias) || ""}
                  />
                </div>
              </td>
              <td className="p-0 w-[15%]">
                <input
                  className="w-full h-full border-none outline-none font-bold text-black text-center px-0.5 text-[7px] bg-transparent py-0"
                  defaultValue={lbl.idUa}
                />
              </td>
              <td className="p-0 w-[25%]">
                <input
                  className="w-full h-full border-none outline-none text-center bg-transparent font-bold text-[8px] py-0 text-black"
                  defaultValue={
                    d.code_ua || (d.id ? "R" + (10000 + Number(d.id)) : "")
                  }
                />
              </td>
            </tr>

            {/* Row 3: д.н. | value | Породність value | Оц.екс.,бал. | value */}
            <tr className="h-[17px]">
              <td className="w-[10%] p-0 text-black">
                <input
                  className="w-full h-full border-none outline-none font-bold text-black text-center px-0.5 text-[7px] bg-transparent py-0"
                  defaultValue={lbl.dob}
                />
              </td>
              <td className="p-0 w-[20%]">
                <input
                  className="w-full h-full border-none outline-none text-center bg-transparent font-bold text-[8px] py-0 text-black"
                  defaultValue={
                    d.date_born
                      ? new Date(d.date_born).toLocaleDateString(
                          locale === "en" ? "en-US" : "uk-UA",
                        )
                      : ""
                  }
                />
              </td>
              <td className="p-0 w-[30%]">
                <input
                  className="w-full h-full border-none outline-none font-bold text-[8px] py-0 text-black px-1"
                  defaultValue={(
                    lbl.purity +
                    " " +
                    (d.blood_percent !== null && d.blood_percent !== undefined
                      ? `${d.blood_percent}`
                      : "")
                  ).trim()}
                />
              </td>
              <td className="p-0 w-[15%]">
                <input
                  className="w-full h-full border-none outline-none font-bold text-black text-center px-0.5 text-[7px] bg-transparent py-0"
                  defaultValue={lbl.expAss}
                />
              </td>
              <td className="p-0 w-[25%]">
                <input
                  className="w-full h-full border-none outline-none text-center bg-transparent font-bold text-[8px] py-0 text-black"
                  defaultValue={d.test_score || ""}
                />
              </td>
            </tr>

            {/* Row 4: Порода | value | Кровність value | Клас | value */}
            <tr className="h-[17px]">
              <td className="w-[10%] p-0 text-black">
                <input
                  className="w-full h-full border-none outline-none font-bold text-black text-center px-0.5 text-[7px] bg-transparent py-0"
                  defaultValue={lbl.breed}
                />
              </td>
              <td className="p-0 w-[20%]">
                <input
                  className="w-full h-full border-none outline-none text-center bg-transparent font-bold text-[8px] py-0 text-black"
                  defaultValue={d.breed_alias || d.breed_name || ""}
                />
              </td>
              <td className="p-0 w-[30%]">
                <input
                  className="w-full h-full border-none outline-none font-bold text-[8px] py-0 text-black px-1"
                  defaultValue={(
                    bloodLabel +
                    " " +
                    (d.blood_percent !== null && d.blood_percent !== undefined
                      ? `${d.blood_percent}`
                      : "")
                  ).trim()}
                />
              </td>
              <td className="p-0 w-[15%]">
                <input
                  className="w-full h-full border-none outline-none font-bold text-black text-center px-0.5 text-[7px] bg-transparent py-0"
                  defaultValue={lbl.class}
                />
              </td>
              <td className="p-0 w-[25%]">
                <input
                  className="w-full h-full border-none outline-none text-center bg-transparent font-bold text-[8px] py-0 text-black"
                  defaultValue={d.test_class || "Elite"}
                />
              </td>
            </tr>

            {/* Row 5: Власник | value */}
            <tr className="h-[17px]">
              <td className="w-[10%] p-0 text-black">
                <input
                  className="w-full h-full border-none outline-none font-bold text-black text-center px-0.5 text-[7px] bg-transparent py-0"
                  defaultValue={ownerLabel}
                />
              </td>
              <td className="p-0 w-[20%]">
                <input
                  className="w-full h-full border-none outline-none bg-transparent font-bold text-[8px] py-0 px-1 text-black"
                  defaultValue={d.owner || ""}
                />
              </td>
              <td className="p-0 w-[30%]">
                <div className="flex items-center px-1 h-full gap-2">
                  <span className="font-bold text-[7.5px] text-black select-none whitespace-nowrap">
                    {chipLabel}
                  </span>
                  <input
                    className="flex-1 h-full border-none outline-none bg-transparent font-bold text-[8px] py-0 text-black"
                    defaultValue={d.code_chip || ""}
                  />
                </div>
              </td>
              <td className="p-0 w-[15%]">
                <input
                  className="w-full h-full border-none outline-none text-center bg-transparent py-0 text-black"
                  defaultValue=""
                />
              </td>
              <td className="p-0 w-[25%]">
                <input
                  className="w-full h-full border-none outline-none text-center bg-transparent py-0 text-black"
                  defaultValue=""
                />
              </td>
            </tr>

            {/* Lactation table */}
            <tr>
              <td colSpan={5} className="p-0">
                {await renderLactTable(p, d)}
              </td>
            </tr>
          </tbody>
        </table>
      );
    };

    const renderSmallAnc = (p: string, symbol: string) => {
      const d = detailsMap[p] || {};
      let lactFormat = "";

      const isThirdGen = [
        "mmm",
        "fmm",
        "mfm",
        "ffm",
        "mmf",
        "fmf",
        "mff",
        "fff",
      ].includes(p);
      if (isThirdGen) {
        // Map CTE path to the profile page input field prefix
        const dbFieldMap: Record<string, string> = {
          mmm: "mmm",
          fmm: "mmf",
          mfm: "mfm",
          ffm: "mff",
          mmf: "fmm",
          fmf: "fmf",
          mff: "ffm",
          fff: "fff",
        };
        const dbPrefix = dbFieldMap[p] || p;
        const rawVal = selections[`id_${dbPrefix}_row1`];

        if (rawVal && typeof rawVal === "string" && rawVal.trim() !== "") {
          lactFormat = rawVal;
        } else {
          const pathMap: Record<string, string> = {
            mmm: "MEMMM",
            fmm: "MEFMM",
            mfm: "MEMFM",
            ffm: "MEFFM",
            mmf: "MEMMF",
            fmf: "MEFMF",
            mff: "MEMFF",
            fff: "MEFFF",
          };
          const path = pathMap[p];
          if (path) {
            const node = ancestorLacts[path];
            const lactations = [
              ...(node?.ownLactations || []),
              ...(node?.daughtersLactations || []),
            ];
            const bestLact = lactations[0];
            if (bestLact) {
              lactFormat = `${bestLact.lact_no}\\\\${bestLact.lact_days}\\\\${bestLact.milk}\\\\${bestLact.fat}\\\\${bestLact.protein}`;
            } else {
              const motherPath = path + "M";
              const motherNode = ancestorLacts[motherPath];
              const motherLacts = [
                ...(motherNode?.ownLactations || []),
                ...(motherNode?.daughtersLactations || []),
              ];
              const mBestLact = motherLacts[0];
              if (mBestLact) {
                lactFormat = `M\\\\${mBestLact.lact_no}\\\\${mBestLact.lact_days}\\\\${mBestLact.milk}\\\\${mBestLact.fat}\\\\${mBestLact.protein}`;
              }
            }
          }
        }
      } else {
        const rows = [1]
          .map((j) => lactMap[selections[`id_${p}_row${j}`]])
          .filter((v) => v);
        const l = rows[0];
        lactFormat = l
          ? `${l.lact_no}\\\\${l.lact_days}\\\\${l.milk}\\\\${l.fat}\\\\${l.protein}`
          : "";
      }

      // Parse/split productivity across two rows - now combined to a single row
      const displayLact = lactFormat ? lactFormat.replace(/\\\\/g, "\\") : "";

      // Dynamic local translations for labels matching the certificate locale
      const labelAbg = "ID ABG";
      const labelUa = "ID UA";
      const labelBreed = locale === "en" ? "Breed" : "Порода";
      const labelPurity = locale === "en" ? "Purity" : "Породн.";
      const labelClass =
        locale === "en" ? "Class" : locale === "ru" ? "Класс" : "Клас";
      const labelProd = locale === "en" ? "Prod." : "Прод.";

      return (
        <table
          className="w-full border-collapse text-center text-[7.5px] font-bold bg-white h-full select-text border-t border-black text-black"
          style={{ borderTopWidth: "1px" }}
        >
          <tbody>
            {/* Row 1: Symbol & Name */}
            <tr
              className="border-b border-black h-[11px]"
              style={{ borderBottomWidth: "1px" }}
            >
              <td className="w-[30%] p-0">
                <input
                  className="w-full h-full border-none outline-none font-black text-[8px] py-0.5 text-black text-center bg-transparent"
                  defaultValue={symbol}
                />
              </td>
              <td className="p-0">
                <input
                  className="w-full h-full border-none outline-none text-left pl-0 bg-transparent font-bold text-[8px] uppercase py-0.5 text-black"
                  defaultValue={d.name || ""}
                />
              </td>
            </tr>

            {/* Row 2: ID ABG */}
            <tr
              className="border-b border-black h-[11px]"
              style={{ borderBottomWidth: "1px" }}
            >
              <td
                className="border-r border-black p-0 w-[30%]"
                style={{ borderRightWidth: "1px" }}
              >
                <input
                  className="w-full h-full border-none outline-none font-bold text-black text-center py-0.5 text-[7.5px] bg-transparent"
                  defaultValue={labelAbg}
                />
              </td>
              <td className="p-0">
                <input
                  className="w-full h-full border-none outline-none text-center bg-transparent py-0.5 text-[7.5px] font-bold text-black"
                  defaultValue={d.code_abg || ""}
                />
              </td>
            </tr>

            {/* Row 3: ID UA */}
            <tr
              className="border-b border-black h-[11px]"
              style={{ borderBottomWidth: "1px" }}
            >
              <td
                className="border-r border-black p-0 w-[30%]"
                style={{ borderRightWidth: "1px" }}
              >
                <input
                  className="w-full h-full border-none outline-none font-bold text-black text-center py-0.5 text-[7.5px] bg-transparent"
                  defaultValue={labelUa}
                />
              </td>
              <td className="p-0">
                <input
                  className="w-full h-full border-none outline-none text-center bg-transparent py-0.5 text-[7.5px] font-bold text-black"
                  defaultValue={d.code_ua || ""}
                />
              </td>
            </tr>

            {/* Row 4: Порода */}
            <tr
              className="border-b border-black h-[11px]"
              style={{ borderBottomWidth: "1px" }}
            >
              <td
                className="border-r border-black p-0 w-[30%]"
                style={{ borderRightWidth: "1px" }}
              >
                <input
                  className="w-full h-full border-none outline-none font-bold text-black text-center py-0.5 text-[7.5px] bg-transparent"
                  defaultValue={labelBreed}
                />
              </td>
              <td className="p-0">
                <input
                  className="w-full h-full border-none outline-none text-center bg-transparent py-0.5 text-[7.5px] font-bold text-black"
                  defaultValue={d.breed_alias || d.breed_name || ""}
                />
              </td>
            </tr>

            {/* Row 5: Породн. */}
            <tr
              className="border-b border-black h-[11px]"
              style={{ borderBottomWidth: "1px" }}
            >
              <td
                className="border-r border-black p-0 w-[30%]"
                style={{ borderRightWidth: "1px" }}
              >
                <input
                  className="w-full h-full border-none outline-none font-bold text-black text-center py-0.5 text-[7.5px] bg-transparent"
                  defaultValue={labelPurity}
                />
              </td>
              <td className="p-0">
                <input
                  className="w-full h-full border-none outline-none text-center bg-transparent py-0.5 text-[7.5px] font-bold text-black"
                  defaultValue={
                    d.blood_percent !== null && d.blood_percent !== undefined
                      ? `${d.blood_percent}`
                      : ""
                  }
                />
              </td>
            </tr>

            {/* Row 6: Клас */}
            <tr
              className="border-b border-black h-[11px]"
              style={{ borderBottomWidth: "1px" }}
            >
              <td
                className="border-r border-black p-0 w-[30%]"
                style={{ borderRightWidth: "1px" }}
              >
                <input
                  className="w-full h-full border-none outline-none font-bold text-black text-center py-0.5 text-[7.5px] bg-transparent"
                  defaultValue={labelClass}
                />
              </td>
              <td className="p-0">
                <input
                  className="w-full h-full border-none outline-none text-center bg-transparent py-0.5 text-[7.5px] font-bold text-black"
                  defaultValue={[d.test_class || "Elite", d.test_score]
                    .filter(Boolean)
                    .join(" ")}
                />
              </td>
            </tr>

            {/* Row 7: Прод. */}
            <tr className="h-[11px]">
              <td
                className="border-r border-black p-0 w-[30%]"
                style={{ borderRightWidth: "1px" }}
              >
                <input
                  className="w-full h-full border-none outline-none font-bold text-black text-center py-0.5 text-[7.5px] bg-transparent"
                  defaultValue={labelProd}
                />
              </td>
              <td className="p-0">
                <input
                  className="w-full h-full border-none outline-none text-center bg-transparent py-0.5 text-[7px] font-bold text-black"
                  defaultValue={displayLact}
                />
              </td>
            </tr>
          </tbody>
        </table>
      );
    };

    return (
      <div className="min-h-screen bg-white p-4 pb-20 font-sans text-black print:p-0">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          input {
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            height: auto !important;
            line-height: inherit !important;
            box-shadow: none !important;
            outline: none !important;
            min-width: 0 !important;
            width: 100% !important;
          }

          /* Font size adjustments (10-15% bigger) */
          .ped-wrapper [class*="text-[6px]"] { font-size: 7px !important; }
          .ped-wrapper [class*="text-[6.5px]"] { font-size: 7.5px !important; }
          .ped-wrapper [class*="text-[7px]"] { font-size: 8px !important; }
          .ped-wrapper [class*="text-[7.5px]"] { font-size: 8.5px !important; }
          .ped-wrapper [class*="text-[8px]"] { font-size: 9.2px !important; }
          .ped-wrapper [class*="text-[11px]"] { font-size: 12.5px !important; }

          /* ══════════════════════════════════════════════
             PEDIGREE BORDER SYSTEM
             2.5px = outer wrapper + section separators + dividers
             ALL BLACK — zero gray
          ══════════════════════════════════════════════ */

          /* 1 ─ OUTER WRAPPER: thick on all 4 sides */
          .ped-wrapper {
            border: 3.5px solid #000;
            background: #fff;
            box-sizing: border-box;
          }
          .ped-wrapper,
          .ped-wrapper * {
            color: #000 !important;
          }

          /* 2 ─ Thick horizontal separators between the 3 section rows */
          .ped-section-mid { border-top: 3.5px solid #000 !important; }
          .ped-bot-section { border-top: 3.5px solid #000 !important; }

          /* 3 ─ TOP SECTION: M|Б centre divider via border-left on the second table.
                 This ensures perfect alignment with the middle and bottom section dividers. */
          .ped-section-top > table:nth-child(2) {
            border-left: 3.5px solid #000 !important;
          }

          /* 4 ─ MIDDLE & BOTTOM column dividers */
          .ped-mid-col + .ped-mid-col > table { border-left: 3.5px solid #000 !important; }
          .ped-bot-col + .ped-bot-col > table { border-left: 3.5px solid #000 !important; }

          /* 5 ─ All inner tables: clean border-collapse and thin internal lines */
          .ped-wrapper table {
            border-collapse: collapse;
            border-spacing: 0;
          }
          .ped-wrapper .border-r { border-right-width: 0.6px !important; }
          .ped-wrapper .border-b { border-bottom-width: 0.6px !important; }
          .ped-wrapper .border-t { border-top-width: 0.6px !important; }

          /* 6 ─ Suppress double top-border (section separator already provides it) */
          .ped-section-top > table,
          .ped-mid-col > table,
          .ped-bot-col > table { border-top: none !important; }

          /* 7 ─ Suppress border-right on the rightmost edge to prevent double border with wrapper */
          .ped-section-top > table:nth-child(2),
          .ped-mid-col:nth-child(4) > table,
          .ped-bot-col:nth-child(8) > table {
            border-right: none !important;
          }

          /* ═══════════════ PRINT STYLES ═══════════════ */
          @media print {
            @page { size: A4 landscape; margin: 0.5cm; }
            body  { background: white !important; margin: 0 !important; padding: 0 !important; }
            header, footer, nav { display: none !important; }
            .no-print, .print-hidden { display: none !important; }

            /* Screen wrapper: remove width/height caps */
            .printable-area {
              display: block !important;
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              height: auto !important;
            }

            /* PEDIGREE WRAPPER: fills A4 landscape, leaving room at the bottom for stamp */
            .ped-wrapper {
              border: 3.5px solid #000 !important;
              max-width: 100% !important;
              width: 100% !important;
              height: 165mm !important;
              display: flex !important;
              flex-direction: column !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
              page-break-inside: avoid !important;
              position: relative !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            /* SECTION ROWS: proportional height */
            .ped-section-top {
              flex: 1.6 1 0% !important;
              overflow: hidden !important;
              position: relative !important;
            }
            .ped-section-mid {
              flex: 1.5 1 0% !important;
              overflow: hidden !important;
            }
            .ped-bot-section {
              flex: 1.3 1 0% !important;
              overflow: hidden !important;
            }

            .ped-section-mid { border-top: 3.5px solid #000 !important; }
            .ped-bot-section { border-top: 3.5px solid #000 !important; }

            /* TOP SECTION: repeat centre divider rule explicitly for print */
            .ped-section-top > table:nth-child(2) {
              border-left: 3.5px solid #000 !important;
            }

            /* MIDDLE & BOTTOM: repeat divider rules explicitly for print */
            .ped-mid-col + .ped-mid-col > table { border-left: 3.5px solid #000 !important; }
            .ped-bot-col + .ped-bot-col > table { border-left: 3.5px solid #000 !important; }

            /* Suppress border-right on the rightmost edge to prevent double border with wrapper on print */
            .ped-section-top > table:nth-child(2),
            .ped-mid-col:nth-child(4) > table,
            .ped-bot-col:nth-child(8) > table {
              border-right: none !important;
            }

            /* Thin internal lines explicitly for print */
            .ped-wrapper .border-r { border-right-width: 0.6px !important; }
            .ped-wrapper .border-b { border-bottom-width: 0.6px !important; }
            .ped-wrapper .border-t { border-top-width: 0.6px !important; }

            /* Tables fill their container height */
            .ped-section-top > table { height: 100% !important; }

            .ped-mid-col,
            .ped-bot-col {
              height: 100% !important;
              display: flex !important;
              flex-direction: column !important;
              overflow: hidden !important;
            }
            .ped-mid-col > *,
            .ped-bot-col > * {
              flex: 1 !important;
              height: 100% !important;
              overflow: hidden !important;
            }

            .ped-wrapper table {
              width: 100% !important;
              height: 100% !important;
              border-collapse: collapse !important;
            }

            /* Lock top section card table details rows height on print */
            .ped-section-top > table > tbody > tr:nth-child(-n+5) {
              height: 17px !important;
            }
            /* Lock nested lactation table rows to ensure identical height distribution */
            .ped-section-top table table thead tr:nth-child(1) {
              height: 14px !important;
            }
            .ped-section-top table table thead tr:nth-child(2) {
              height: 11px !important;
            }
            .ped-section-top table table tbody tr {
              height: 11px !important;
            }
            .ped-section-top table table tfoot tr {
              height: 11px !important;
            }



            /* Force all children: black colour, exact colour rendering */
            .ped-wrapper * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color: #000 !important;
            }
          }
        `,
          }}
        />

        <div className="print-hidden no-print mb-4 max-w-[1200px] mx-auto flex justify-between items-center bg-[#FDFDFD] border border-gray-200 rounded-lg p-3 shadow-sm text-black">
          <Link
            href={`/goats/${id}`}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black border border-gray-300 rounded font-black text-xs uppercase transition-all flex items-center gap-2"
          >
            {locale === "en"
              ? "← Back to Profile"
              : locale === "uk"
                ? "← Назад до профілю"
                : "← Назад к козе"}
          </Link>
          <div className="text-xs font-bold text-gray-500">
            {locale === "en"
              ? "Pedigree Certificate Preview Mode"
              : locale === "uk"
                ? "Режим попереднього перегляду родоводу"
                : "Режим предварительного просмотра родословной"}
          </div>
          <PrintButton
            label={
              locale === "en" ? "Print" : locale === "uk" ? "Друк" : "Печать"
            }
            className="bg-[#522513] text-white px-6 py-2 rounded font-black text-xs uppercase hover:bg-[#3b1a0d] transition-all shadow-md"
          />
        </div>

        <div
          className="ped-wrapper w-[96%] max-w-[1200px] mx-auto shadow-xl relative overflow-hidden printable-area"
          style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
        >
          {/* ── TOP SECTION: M | Б ── thick outer border, thick centre divider */}
          <div className="ped-section-top ped-top-divider grid grid-cols-2 gap-0 bg-white print:flex-1">
            {await renderAncBlock("m", getSymbol("m"))}
            {await renderAncBlock("f", getSymbol("f"))}
          </div>

          {/* ── MIDDLE SECTION: ММ | БМ | МБ | ББ ── thin internal dividers, thick centre */}
          <div className="ped-section-mid grid grid-cols-4 gap-0 bg-white print:flex-1">
            <div className="ped-mid-col">
              {await renderAncBlock("mm", getSymbol("mm"))}
            </div>
            <div className="ped-mid-col ped-mid-female-divider">
              {await renderAncBlock("mf", getSymbol("mf"))}
            </div>
            <div className="ped-mid-col ped-mid-half-divider">
              {await renderAncBlock("fm", getSymbol("fm"))}
            </div>
            <div className="ped-mid-col ped-mid-female-divider">
              {await renderAncBlock("ff", getSymbol("ff"))}
            </div>
          </div>

          {/* ── BOTTOM SECTION: 8 grandparent cells ── thin internal dividers, thick centre */}
          <div className="ped-bot-section grid grid-cols-8 gap-0 bg-white print:flex-1">
            <div className="ped-bot-col">
              {renderSmallAnc("mmm", getSymbol("mmm"))}
            </div>
            <div className="ped-bot-col ped-bot-female-divider">
              {renderSmallAnc("fmm", getSymbol("fmm"))}
            </div>
            <div className="ped-bot-col ped-bot-quarter-divider">
              {renderSmallAnc("mfm", getSymbol("mfm"))}
            </div>
            <div className="ped-bot-col ped-bot-female-divider">
              {renderSmallAnc("ffm", getSymbol("ffm"))}
            </div>
            <div className="ped-bot-col ped-bot-half-divider">
              {renderSmallAnc("mmf", getSymbol("mmf"))}
            </div>
            <div className="ped-bot-col ped-bot-female-divider">
              {renderSmallAnc("fmf", getSymbol("fmf"))}
            </div>
            <div className="ped-bot-col ped-bot-quarter-divider">
              {renderSmallAnc("mff", getSymbol("mff"))}
            </div>
            <div className="ped-bot-col ped-bot-female-divider">
              {renderSmallAnc("fff", getSymbol("fff"))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return notFound();
}
