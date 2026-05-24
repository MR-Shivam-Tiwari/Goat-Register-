import { query } from "@/lib/db";
import { getTranslation, Locale } from "@/lib/translations";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PrintButton from "@/components/PrintButton";
import { getSessionUser } from "@/lib/access-control";
import CertificateLactationTable from "@/components/CertificateLactationTable";

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
    [id]
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
    [id]
  );
  return res.rows;
}


async function getCertSelections(id: string) {
  const res = await query("SELECT * FROM goats_cert WHERE id_goat = $1", [id]);
  return res.rows[0] || {};
}

async function getAncestorLactations(ids: any[]) {
    if (ids.length === 0) return [];
    const validIds = ids.filter(id => id && !isNaN(Number(id))).map(id => Number(id));
    if (validIds.length === 0) return [];
    
    const res = await query(
      `SELECT gl.*, a.name as offspring_name 
       FROM goats_lact gl 
       JOIN animals a ON gl.id_goat = a.id 
       WHERE gl.id IN (SELECT unnest($1::int[]))`, 
      [validIds]
    );
    return res.rows;
}

async function getOffspringLactations(buckId: number) {
    // Find best lactations of daughters for this buck
    const res = await query(`
        SELECT gl.*, a.name as offspring_name
        FROM goats_lact gl
        JOIN animals a ON gl.id_goat = a.id
        WHERE a.id_father = $1
        ORDER BY gl.milk DESC
        LIMIT 3
    `, [buckId]);
    return res.rows;
}

async function getAncestorDetails(ids: number[]) {
  if (ids.length === 0) return [];
  const res = await query(`
    SELECT 
      A.id, A.name, A.sex, A.id_mother, A.id_father,
      Di.date_born, Di.born_weight, Di.born_qty, Di.score as goat_score,
      Di.horns_type, Di.code_ua, Di.code_abg, Di.code_chip, Di.manuf, Di.owner,
      B.name as breed_name,
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
  `, [ids]);
  return res.rows;
}

export default async function CertificatePage({ 
  params 
}: { 
  params: Promise<{ id: string, type: string }> 
}) {
  const { id, type } = await params;
  const user = await getSessionUser();
  const goat = await getGoatCertData(id);
  if (!goat) notFound();

  // ACCESS CONTROL: Allow Admin (role >= 10) or Owner (by id_user)
  const isOwner = user && (
    user.role >= 10 || 
    user.id === goat.id_user
  );

  if (!isOwner) {
    redirect('/goats');
  }

  const cookieStore = await cookies();
  const locale = (cookieStore.get("nxt-lang")?.value || "ru") as Locale;
  const t = getTranslation(locale);

  const formatDate = (dateStr: string | Date | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
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
      ru: { m: 'М', f: 'О', mm: 'ММ', fm: 'ОМ', mf: 'МО', ff: 'ОО', mmm: 'МММ', fmm: 'ОММ', mfm: 'МОМ', ffm: 'ООМ', mmf: 'ММО', fmf: 'ОМО', mff: 'МОО', fff: 'ООО' },
      en: { m: 'M', f: 'F', mm: 'MM', fm: 'OM', mf: 'FM', ff: 'FF', mmm: 'MMM', fmm: 'FMM', mfm: 'MFM', ffm: 'FFM', mmf: 'MMF', fmf: 'FMF', mff: 'MFF', fff: 'FFF' },
      uk: { m: 'М', f: 'Б', mm: 'ММ', fm: 'БМ', mf: 'МО', ff: 'ББ', mmm: 'МММ', fmm: 'БММ', mfm: 'МБМ', ffm: 'ББМ', mmf: 'ММБ', fmf: 'БМБ', mff: 'МББ', fff: 'БББ' },
    };
    const set = symbols[locale] || symbols['ru'];
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
    }
  };

  const getStdb = (alias: string) => {
    if (alias === 'ex') return 'RExB';
    if (alias === 'tg') return 'RHB';
    if (alias === 'ft') return 'RFB';
    return 'RHB'; 
  };

  const cl1 = cert1Labels[locale] || cert1Labels['ru'];

  if (type === "1") {
    const lactations = await getLactations(id);
    const stdb = getStdb(goat.studbook_alias);

    return (
      <div className="min-h-screen bg-gray-100 p-4 pb-20 font-sans text-black print:p-0 print:bg-white">
        <style dangerouslySetInnerHTML={{ __html: `
            /* Hide global UI on this page */
            header, nav, footer, .global-nav, .global-footer { display: none !important; }
            body { background: #f3f4f6 !important; }

            @media print {
              /* Print on top of pre-printed blank:
                 Blank already has: UKRAINE header, Association Of Breeding Goats,
                 goat watermark, decorative border, holographic sticker (~6-7cm top).
                 Our content fills the remaining ~22cm below that area. */
              @page { size: A4 portrait; margin-top: 6.8cm; margin-left: 0.8cm; margin-right: 0.8cm; margin-bottom: 0.5cm; }
              body { 
                background: transparent !important; 
                margin: 0 !important; 
                padding: 0 !important; 
              }
              .printable-area { 
                border: none !important; 
                box-shadow: none !important; 
                padding: 0px !important; 
                margin: 0 !important; 
                width: 100% !important; 
                max-width: 100% !important; 
                box-sizing: border-box !important;
                overflow: hidden !important;
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
            .grid-label { font-weight: bold; width: 115px; background: #fff; text-align: left; font-size: 10px; }
            .productive-table { border-collapse: collapse; width: 100%; border: 1.5px solid #000; text-align: center; }
            .productive-table th, .productive-table td { border: 1px solid #000; padding: 0px; font-size: 10px; }
            .productive-table th { background: transparent; color: #000; font-weight: bold; padding: 1px; }
            .productive-table input { width: 100%; height: 100%; border: none; outline: none; text-align: center; background: transparent; font-size: 10.5px; font-weight: bold; }
            .print-only { display: none; }
        `}} />
        
        <div className="print-hidden no-print mb-4 max-w-[950px] mx-auto flex justify-between items-center bg-[#FDFDFD] border border-gray-200 rounded-lg p-3 shadow-sm text-black">
           <Link href={`/goats/${id}`} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black border border-gray-300 rounded font-black text-xs uppercase transition-all flex items-center gap-2">
             {cl1.backToProfile}
           </Link>
           <div className="text-xs font-bold text-gray-500">
             {cl1.certPreviewMode}
           </div>
           <PrintButton label={cl1.printLabel} className="bg-[#522513] text-white px-6 py-2 rounded font-black text-xs uppercase hover:bg-[#3b1a0d] transition-all shadow-md" />
        </div>

        <div className="w-full max-w-[950px] mx-auto bg-white p-4 shadow-md relative printable-area border-2 border-black overflow-hidden rounded-sm print:shadow-none print:border-none print:p-0 print:bg-transparent">
          
          <main className="space-y-2 print:space-y-1">
            {/* Certificate header — 3 lines printed on blank (unique per animal) */}
            <div className="flex flex-col gap-0.5 mx-auto w-full text-center mb-2">
               <input 
                  className="w-full text-center font-black uppercase text-[15px] bg-transparent border-b border-black/20 pb-0.5 outline-none text-black focus:border-black/60 print:border-none print:pb-0 print:text-[14px]" 
                  defaultValue={
                     locale === 'en'
                        ? (stdb === 'RHB' ? 'BREEDING CERTIFICATE' : 'CERTIFICATE OF CONFORMITY')
                        : (stdb === 'RHB' 
                           ? (locale === 'uk' ? 'ПЛЕМІННЕ СВІДОЦТВО' : 'ПЛЕМЕННОЕ СВИДЕТЕЛЬСТВО') 
                           : (locale === 'uk' ? 'СЕРТИФІКАТ ВІДПОВІДНОСТІ' : 'СЕРТИФИКАТ СООТВЕТСТВИЯ'))
                  } 
               />
               <input 
                  className="w-full text-center font-black uppercase text-[15px] bg-transparent border-b border-black/20 pb-0.5 outline-none text-black focus:border-black/60 print:border-none print:pb-0 print:text-[14px]" 
                  defaultValue={`${stdb} R${10000 + Number(goat.id)}`} 
               />
               <input 
                  className="w-full text-center font-bold uppercase text-[11px] bg-transparent outline-none text-black/60 focus:text-black print:text-black print:text-[10px]" 
                  defaultValue={locale === 'en' ? 'OFFICIAL REGISTRATION DOCUMENT' : (locale === 'uk' ? 'ОФІЦІЙНИЙ РЕЄСТРАЦІЙНИЙ ДОКУМЕНТ' : 'ОФИЦИАЛЬНЫЙ РЕГИСТРАЦИОННЫЙ ДОКУМЕНТ')} 
               />
            </div>

            <table className="grid-table border-[1.5px] border-black">
              <tbody>
                <tr>
                  <td className="grid-label">{cl1.nickname}</td>
                  <td><input className="w-full font-bold bg-transparent border-none outline-none text-black text-[12px]" defaultValue={goat.name} /></td>
                  <td className="grid-label">{cl1.breed}</td>
                  <td><input className="w-full font-bold bg-transparent border-none outline-none text-black text-[11px]" defaultValue={goat.breed_name || ''} /></td>
                  <td className="grid-label">{cl1.horns}</td>
                  <td><input className="w-full font-bold bg-transparent uppercase text-[10px] border-none outline-none text-black" defaultValue={getHornType(goat.horns_type)} /></td>
                </tr>
                <tr>
                  <td className="grid-label">{cl1.birthDate}</td>
                  <td><input className="w-full bg-transparent border-none outline-none text-black" defaultValue={formatDate(goat.date_born)} /></td>
                  <td className="grid-label">{cl1.purity}</td>
                  <td><input className="w-full bg-transparent border-none outline-none text-black" defaultValue={goat.blood_percent != null ? String(goat.blood_percent) : ''} /></td>
                  <td className="grid-label">{cl1.scoreBorn}</td>
                  <td><input className="w-full bg-transparent border-none outline-none text-black" defaultValue={goat.goat_score != null ? String(goat.goat_score) : ''} /></td>
                </tr>
                <tr>
                  <td className="grid-label">{cl1.sex}</td>
                  <td><input className="w-full font-bold bg-transparent uppercase text-[11px] border-none outline-none text-black" defaultValue={goat.sex === 1 ? cl1.male : cl1.female} /></td>
                  <td className="grid-label">{cl1.bloodPercent}</td>
                  <td><input className="w-full bg-transparent border-none outline-none text-black" defaultValue={goat.blood_percent !== null && goat.blood_percent !== undefined ? String(goat.blood_percent) : ''} /></td>
                  <td className="grid-label">{locale === 'en' ? 'Teats Qty:' : 'Кіл-ть сосків:'}</td>
                  <td><input className="w-full font-bold bg-transparent border-none outline-none text-black" defaultValue="" /></td>
                </tr>
                <tr>
                  <td className="grid-label">{cl1.idAbg}</td>
                  <td><input className="w-full font-bold bg-transparent border-none outline-none text-black" defaultValue={goat.code_abg || `ABG UA ${goat.id.toString().padStart(6,'0')}`} /></td>
                  <td className="grid-label">{cl1.qtyBorn}</td>
                  <td><input className="w-full bg-transparent border-none outline-none text-black" defaultValue={goat.born_qty != null ? String(goat.born_qty) : ''} /></td>
                  <td className="grid-label">{cl1.expertAssessment}</td>
                  <td><input className="w-full bg-transparent border-none outline-none font-bold text-red-600" defaultValue={goat.test_score || ''} /></td>
                </tr>
                <tr>
                  <td className="grid-label">{cl1.idUa}</td>
                  <td><input className="w-full bg-transparent border-none outline-none text-black" defaultValue={goat.code_ua || ''} /></td>
                  <td className="grid-label">{cl1.weightBorn}</td>
                  <td><input className="w-full bg-transparent border-none outline-none text-black" defaultValue={goat.born_weight != null ? String(goat.born_weight) : ''} /></td>
                  <td className="grid-label">{cl1.class}</td>
                  <td><input className="w-full font-bold bg-transparent border-none outline-none text-black" defaultValue={goat.test_class || ''} /></td>
                </tr>
                <tr>
                  <td className="grid-label">{cl1.chip}</td>
                  <td><input className="w-full font-bold bg-transparent border-none outline-none text-black" defaultValue={goat.code_chip || ''} /></td>
                  <td className="grid-label">{cl1.liveWeight}</td>
                  <td><input className="w-full bg-transparent border-none outline-none text-black" defaultValue="" /></td>
                  <td className="grid-label">{cl1.studbook}</td>
                  <td><input className="w-full font-bold bg-transparent border-none outline-none text-black" defaultValue={`${stdb} R${10000 + Number(goat.id)}`} /></td>
                </tr>
                <tr>
                  <td className="grid-label">{cl1.breeder}</td>
                  <td><input className="w-full font-bold bg-transparent text-[10px] border-none outline-none text-black" defaultValue={goat.breeder_manual || goat.user_farm_name || ''} /></td>
                  <td className="grid-label">{cl1.color}</td>
                  <td><input className="w-full bg-transparent border-none outline-none text-black" defaultValue={goat.special || ''} /></td>
                  <td colSpan={2}></td>
                </tr>
              </tbody>
            </table>

            {/* Lactation Table component */}
            <div className="w-full mt-6 print:mt-4">
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
                  defaultValue={`${goat.user_farm_name || goat.breeder_manual || ''}${goat.user_phone ? ', ' + goat.user_phone : ''}${goat.user_email ? ', ' + goat.user_email : ''}`}
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
                  defaultValue={`${goat.breeder_manual || goat.user_farm_name || ''}${goat.user_phone ? ', ' + goat.user_phone : ''}`}
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

                {/* Left Column: 3 lines stacked vertically */}
                <div className="flex flex-col gap-2.5 flex-1 min-w-0 pr-[40px] print:pr-[40px]">
                  
                  {/* Line 1: Date Value */}
                  <input
                    className="bg-transparent border-none outline-none text-[12px] font-bold text-black w-full"
                    defaultValue={formatDate(new Date())}
                  />
                  
                  {/* Line 2: Head of GS / Title */}
                  <input
                    className="bg-transparent border-none outline-none text-[11px] font-bold text-black w-full leading-tight"
                    defaultValue={
                      locale === 'en' 
                        ? 'Head of GS "Association of Breeding Goats"' 
                        : (locale === 'uk' ? 'Голова ГС "Асоціація Племінних Кіз"' : 'Председатель ГС "Асоціація Племінних Кіз"')
                    }
                  />
                  
                  {/* Line 3: Date Label */}
                  <input
                    className="bg-transparent border-none outline-none text-[10.5px] text-black/60 font-bold w-full"
                    defaultValue={cl1.dateIssued}
                  />
                </div>

                {/* Center-Right Column: Name, aligned vertically with Line 2 */}
                <div className="flex items-center justify-center self-center shrink-0 pr-12 print:pr-12">
                  <input
                    className="bg-transparent border-none outline-none text-[12.5px] font-bold text-black text-center w-48"
                    defaultValue={locale === 'en' ? 'Alekseeva M.V.' : 'Алексєєва М.В.'}
                  />
                </div>

                {/* Far Right Column: Empty space for holographic sticker (blank space) */}
                <div className="w-[120px] print:w-[120px] h-10 shrink-0 self-center flex items-center justify-center">
                  {/* Faint dashed boundary only on screen as a guide where the sticker goes */}
                  <div className="no-print w-10 h-10 rounded-full border border-dashed border-gray-300 opacity-40 shrink-0" title="Physical holographic sticker will be placed here after printing"></div>
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
    const prefixes = ['m','f','mm','fm','mf','ff','mmm','fmm','mfm','ffm','mmf','fmf','mff','fff'];
    
    const treeRes = await query(`
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
    `, [id]);

    const pathIdMap: any = {};
    treeRes.rows.forEach((r: any) => pathIdMap[r.path] = r.id);
    const allAncestorIds = treeRes.rows.map(r => r.id);

    const ancestorDetails = await getAncestorDetails(allAncestorIds);
    const detailsMap: any = {};
    ancestorDetails.forEach((d: any) => {
        const path = Object.keys(pathIdMap).find(p => pathIdMap[p] === d.id);
        if (path) detailsMap[path] = d;
    });

    const allSelectedLactIds: number[] = [];
    prefixes.forEach(p => {
        const lid = selections[`id_${p}_row1`]; // Row 1 is usually the main selection
        if(lid && !isNaN(Number(lid))) allSelectedLactIds.push(Number(lid));
    });

    const lacts = await getAncestorLactations(allSelectedLactIds);
    const lactMap: any = {};
    lacts.forEach((l: any) => lactMap[l.id] = l);

    const cert2Labels: any = {
      ru: {
        average: "Среднее:",
        days: "Дней",
        milk: "Надой",
        fat: "Жир",
        protein: "Белок",
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
        certStatement: "Этот сертификат является официальным документом, подтверждающим племенную ценность животного.",
        headOfGs: "HEAD OF GS: Alekseeva M.V. / _______________",
        date: "DATE:",
      },
      en: {
        average: "Average:",
        days: "Days",
        milk: "Milk",
        fat: "Fat",
        protein: "Protein",
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
        certStatement: "This certificate is an official document confirming the breeding value of the animal.",
        headOfGs: "HEAD OF GS: Alekseeva M.V. / _______________",
        date: "DATE:",
      },
      uk: {
        average: "Середнє:",
        days: "Днів",
        milk: "Надій",
        fat: "Жир",
        protein: "Білок",
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
        certStatement: "Цей сертифікат є офіційним документом, що підтверджує племінну цінність тварини.",
        headOfGs: "HEAD OF GS: Alekseeva M.V. / _______________",
        date: "DATE:",
      }
    };

    const cl2 = cert2Labels[locale] || cert2Labels['ru'];

    const renderLactTable = async (p: string, anc: any) => {
        const isMale = anc.sex === 1;
        let rows = [];
        let subHeaderText = isMale ? cl2.offspringId : "№";
        
        if (isMale) {
            // For males, we fetch daughters data
            const daughters = await getOffspringLactations(anc.id);
            rows = daughters;
        } else {
            rows = [1,2,3].map(j => {
                const lid = selections[`id_${p}_row${j}`];
                return lactMap[lid];
            }).filter(v => v);
        }

        let avgMilk = 0, avgFat = 0, avgProt = 0;
        if (rows.length > 0) {
            avgMilk = rows.reduce((acc:any, r:any) => acc + (parseFloat(r.milk) || 0), 0) / rows.length;
            avgFat = rows.reduce((acc:any, r:any) => acc + (parseFloat(r.fat) || 0), 0) / rows.length;
            avgProt = rows.reduce((acc:any, r:any) => acc + (parseFloat(r.protein) || 0), 0) / rows.length;
        }

        return (
            <div className="mt-1">
                <table className="w-full text-[8.5px] border-collapse text-center border border-black/80">
                    <thead className="bg-[#f0f0f0] border-b border-black font-bold uppercase text-[7px]">
                        <tr className="divide-x divide-black border-b border-black">
                           <th rowSpan={2} className="w-8 border-r border-black">{subHeaderText}</th>
                           <th rowSpan={2} className="w-10 border-r border-black">{isMale ? cl2.breed : cl2.days}</th>
                           <th colSpan={2} className="border-r border-black">{cl2.milk}</th>
                           <th colSpan={2} className="border-r border-black">{cl2.fat}</th>
                           <th colSpan={2}>{cl2.protein}</th>
                        </tr>
                        <tr className="divide-x divide-black text-[6.5px]">
                           <th className="border-r border-black">{cl2.kg}</th><th className="border-r border-black">{cl2.class}</th>
                           <th className="border-r border-black">%</th><th className="border-r border-black">{cl2.class}</th>
                           <th className="border-r border-black">%</th><th>{cl2.class}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/40 font-bold text-[8px]">
                        {[...Array(3)].map((_, i) => {
                           const r = rows[i] || {};
                           return (
                             <tr key={i} className="divide-x divide-black/40 h-4 leading-none">
                                <td className="p-0 border-r border-black/30"><input className="w-full h-full border-none outline-none text-center bg-transparent" defaultValue={isMale ? (r.offspring_name || '') : (r.lact_no || '')} /></td>
                                <td className="p-0 border-r border-black/30"><input className="w-full h-full border-none outline-none text-center bg-transparent" defaultValue={isMale ? 'TFG' : (r.lact_days || '')} /></td>
                                <td className="p-0 border-r border-black/30"><input className="w-full h-full border-none outline-none text-center bg-transparent font-black" defaultValue={r.milk || ''} /></td>
                                <td className="p-0 border-r border-black/30"><input className="w-full h-full border-none outline-none text-center bg-transparent" defaultValue="Elite" /></td>
                                <td className="p-0 border-r border-black/30"><input className="w-full h-full border-none outline-none text-center bg-transparent" defaultValue={r.fat || ''} /></td>
                                <td className="p-0 border-r border-black/30"><input className="w-full h-full border-none outline-none text-center bg-transparent" defaultValue="Elite" /></td>
                                <td className="p-0 border-r border-black/30"><input className="w-full h-full border-none outline-none text-center bg-transparent" defaultValue={r.protein || ''} /></td>
                                <td className="p-0"><input className="w-full h-full border-none outline-none text-center bg-transparent" defaultValue="Elite" /></td>
                             </tr>
                           )
                        })}
                    </tbody>
                    {!isMale && (
                    <tfoot className="border-t border-black font-bold bg-[#f9f9f9] text-[7.5px] uppercase">
                       <tr className="divide-x divide-black h-4 leading-none">
                          <td colSpan={2} className="border-r border-black text-center pr-2">{cl2.average}</td>
                          <td className="font-black bg-yellow-50/10 border-r border-black"><input className="w-full h-full border-none outline-none text-center" defaultValue={rows.length > 0 ? avgMilk.toFixed(1) : ''} /></td>
                          <td className="border-r border-black">Elite</td>
                          <td className="border-r border-black"><input className="w-full h-full border-none outline-none text-center" defaultValue={rows.length > 0 ? avgFat.toFixed(2) : ''} /></td>
                          <td className="border-r border-black">Elite</td>
                          <td className="border-r border-black"><input className="w-full h-full border-none outline-none text-center" defaultValue={rows.length > 0 ? avgProt.toFixed(2) : ''} /></td>
                          <td>Elite</td>
                       </tr>
                    </tfoot>
                    )}
                </table>
            </div>
        );
    };

    const renderAncBlock = async (p: string, symbol: string) => {
        const d = detailsMap[p] || {};
        return (
            <div className="p-1 border-[1.5px] border-black bg-white shadow-sm flex flex-col">
                <div className="flex border-b-2 border-black font-black text-[12px] mb-1 leading-none pb-1 items-end gap-1 w-full">
                    <span className="mr-2 text-2xl leading-none text-blue-900/80 shrink-0">{symbol}</span>
                    <input className="flex-1 min-w-0 border-none outline-none uppercase text-sm tracking-tight bg-transparent" defaultValue={d.name || ''} />
                    <input className="w-20 shrink-0 border-none outline-none text-right font-bold text-[10px] self-end text-black/60 bg-transparent" defaultValue={`R${10000 + Number(d.id || 0)}`} />
                </div>
                
                <div className="grid grid-cols-4 gap-x-2 text-[7px] font-bold uppercase leading-[1.1] mt-1 mb-1">
                    <div className="flex flex-col border-r border-black/10 pr-1">
                        <span className="opacity-40 text-[5px]">A:</span>
                        <input className="w-full border-none outline-none font-bold text-[8.5px] bg-transparent" defaultValue={d.code_abg || ''} />
                    </div>
                    <div className="flex flex-col border-r border-black/10 pr-1">
                        <span className="opacity-40 text-[5px]">U:</span>
                        <input className="w-full border-none outline-none font-bold text-[8.5px] bg-transparent" defaultValue={d.code_ua || ''} />
                    </div>
                    <div className="flex flex-col border-r border-black/10 pr-1">
                        <span className="opacity-40 text-[5px]">C:</span>
                        <input className="w-full border-none outline-none font-bold text-[8.5px] bg-transparent" defaultValue={d.code_chip || ''} />
                    </div>
                    <div className="flex flex-col">
                        <span className="opacity-40 text-[5px]">S:</span>
                        <input className="w-full border-none outline-none font-bold text-[8.5px] bg-transparent" defaultValue={getStdb(d.studbook_alias)} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 text-[8px] font-bold uppercase border-t border-black/20 pt-1 leading-tight text-left">
                    <div className="flex justify-between items-center gap-1"><span>{cl2.breed}:</span><input className="flex-1 min-w-0 border-none outline-none text-right bg-transparent text-[9px]" defaultValue={d.breed_name || ''} /></div>
                    <div className="flex justify-between items-center gap-1"><span>{cl2.born}</span><input className="flex-1 min-w-0 border-none outline-none text-right bg-transparent text-[9px]" defaultValue={d.date_born ? new Date(d.date_born).toLocaleDateString(locale === 'en' ? 'en-US' : 'uk-UA') : ''} /></div>
                    <div className="flex justify-between items-center gap-1"><span>{cl2.blood}</span><input className="flex-1 min-w-0 border-none outline-none text-right bg-transparent text-[9px]" defaultValue={d.blood_percent !== null && d.blood_percent !== undefined ? `${d.blood_percent}%` : ''} /></div>
                    <div className="flex justify-between items-center gap-1"><span>{cl2.classLabel}</span><input className="flex-1 min-w-0 border-none outline-none text-right bg-transparent text-[9px]" defaultValue={d.test_class || 'Elite'} /></div>
                    <div className="flex justify-between items-center gap-1"><span>{cl2.score}</span><input className="flex-1 min-w-0 border-none outline-none text-right bg-transparent text-red-700 font-black text-[9px]" defaultValue={d.test_score || ''} /></div>
                    <div className="flex justify-between items-center gap-1"><span>{cl2.owner}</span><input className="flex-1 min-w-0 border-none outline-none text-right bg-transparent text-[9px] truncate" defaultValue={d.owner || d.manuf || ''} /></div>
                </div>

                <div className="border-t border-black mt-1">
                   {await renderLactTable(p, d)}
                </div>
            </div>
        );
    };

    const renderSmallAnc = (p: string, symbol: string) => {
        const d = detailsMap[p] || {};
        const rows = [1].map(j => lactMap[selections[`id_${p}_row${j}`]]).filter(v => v);
        const l = rows[0]; 
        const lactFormat = l ? `${l.lact_no}\\\\${l.lact_days}\\\\${l.milk}\\\\${l.fat}\\\\${l.protein}` : "";

        return (
            <div className="border border-black p-0.5 text-[6.5px] font-bold h-full flex flex-col justify-between bg-white/40">
                <div className="flex border-b border-black/60 mb-0.5 items-center justify-between px-0.5 gap-1 w-full">
                    <span className="font-black text-[9px] text-blue-900/60 leading-none shrink-0">{symbol}</span>
                    <input className="flex-1 min-w-0 border-none outline-none truncate bg-transparent leading-none text-[8px] uppercase font-bold" defaultValue={d.name || ''} />
                    <input className="w-10 shrink-0 border-none outline-none text-right text-[6px] opacity-40 bg-transparent" defaultValue={`R${10000 + Number(d.id || 0)}`} />
                </div>
                <div className="grid grid-cols-1 gap-x-0 leading-[1] uppercase px-0.5">
                   <div className="flex justify-between"><span className="opacity-40">A:</span><input className="w-20 border-none outline-none text-right bg-transparent" defaultValue={d.code_abg || ''} /></div>
                   <div className="flex justify-between"><span className="opacity-40">U:</span><input className="w-20 border-none outline-none text-right bg-transparent truncate" defaultValue={d.code_ua || ''} /></div>
                   <div className="flex justify-between"><span className="opacity-40">C:</span><input className="w-20 border-none outline-none text-right bg-transparent truncate" defaultValue={d.code_chip || ''} /></div>
                   <div className="flex justify-between"><span className="opacity-40">S:</span><input className="w-20 border-none outline-none text-right bg-transparent" defaultValue={getStdb(d.studbook_alias)} /></div>
                   <div className="mt-0.5 border-t border-black/20 pt-0.5">
                      <input className="w-full border-none outline-none text-center bg-transparent text-[#491907] font-black text-[7px]" defaultValue={lactFormat} />
                   </div>
                </div>
            </div>
        );
    };

    return (
      <div className="min-h-screen bg-gray-50/20 p-4 pb-20 font-sans text-black print:p-0">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page { size: landscape; margin: 0.3cm; }
            body { background: white; }
            .printable-area { border: 2px solid #000 !important; box-shadow: none !important; padding: 10px !important; margin: 0 !important; width: 100% !important; }
            .no-print, .print-hidden { display: none !important; }
            header, footer, nav { display: none !important; }
            input { 
              border: none !important; 
              background: transparent !important; 
              padding: 0 !important; 
              margin: 0 !important; 
              height: auto !important; 
              line-height: inherit !important;
              box-shadow: none !important;
            }
          }
        `}} />
        
        <div className="print-hidden no-print mb-4 max-w-[1700px] mx-auto flex justify-between items-center bg-[#FDFDFD] border border-gray-200 rounded-lg p-3 shadow-sm text-black">
           <Link href={`/goats/${id}`} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black border border-gray-300 rounded font-black text-xs uppercase transition-all flex items-center gap-2">
             {locale === 'en' ? '← Back to Profile' : locale === 'uk' ? '← Назад до профілю' : '← Назад к козе'}
           </Link>
           <div className="text-xs font-bold text-gray-500">
             {locale === 'en' ? 'Pedigree Certificate Preview Mode' : locale === 'uk' ? 'Режим попереднього перегляду родоводу' : 'Режим предварительного просмотра родословной'}
           </div>
           <PrintButton label={locale === 'en' ? 'Print' : locale === 'uk' ? 'Друк' : 'Печать'} className="bg-[#522513] text-white px-6 py-2 rounded font-black text-xs uppercase hover:bg-[#3b1a0d] transition-all shadow-md" />
        </div>

        <div className="w-[96%] max-w-[1700px] mx-auto bg-white border-[2px] border-black p-6 print:border-solid shadow-xl printable-area relative overflow-hidden">
           
           <div className="grid grid-cols-2 gap-3 mb-3">
               {await renderAncBlock('m', getSymbol('m'))}
               {await renderAncBlock('f', getSymbol('f'))}
           </div>

           <div className="grid grid-cols-4 gap-2 mb-3">
               {await renderAncBlock('mm', getSymbol('mm'))}
               {await renderAncBlock('fm', getSymbol('fm'))}
               {await renderAncBlock('mf', getSymbol('mf'))}
               {await renderAncBlock('ff', getSymbol('ff'))}
           </div>

           <div className="grid grid-cols-8 gap-0.5 mb-8">
               {renderSmallAnc('mmm', getSymbol('mmm'))}
               {renderSmallAnc('fmm', getSymbol('fmm'))}
               {renderSmallAnc('mfm', getSymbol('mfm'))}
               {renderSmallAnc('ffm', getSymbol('ffm'))}
               {renderSmallAnc('mmf', getSymbol('mmf'))}
               {renderSmallAnc('fmf', getSymbol('fmf'))}
               {renderSmallAnc('mff', getSymbol('mff'))}
               {renderSmallAnc('fff', getSymbol('fff'))}
           </div>

           {/* Printing specific signature area bottom of tree page */}
            <div className="mt-8 border-t-2 border-black pt-4 flex justify-between items-start text-[10px] font-bold uppercase h-20 text-black">
               <div className="flex flex-col gap-2">
                  <div className="flex gap-1 text-left items-center">
                     <span>{cl2.recordedCorrectly}</span>
                     <input className="border-none outline-none bg-transparent font-bold text-[10px] w-64 text-left" defaultValue="_________________________" />
                  </div>
                  <input className="normal-case opacity-40 text-[9px] w-[500px] leading-tight border-none outline-none bg-transparent text-left" defaultValue={cl2.certStatement} />
               </div>
               <div className="text-right flex flex-col items-end gap-1">
                  <div className="flex gap-1 justify-end items-center">
                     <span>HEAD OF GS:</span>
                     <input className="border-none outline-none bg-transparent font-bold text-[10px] text-right w-64" defaultValue={locale === 'en' ? "Alekseeva M.V. / _______________" : "Алєксєєва М.В. / _______________"} />
                  </div>
                  <div className="flex gap-1 justify-end items-center">
                     <span>{cl2.date}</span>
                     <input className="border-none outline-none bg-transparent font-bold text-[10px] text-right w-24" defaultValue={new Date().toLocaleDateString(locale === 'en' ? 'en-US' : 'uk-UA')} />
                  </div>
               </div>
            </div>

        </div>
      </div>
    );
  }

  return notFound();
}
