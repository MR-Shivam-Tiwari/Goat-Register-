import { query } from "@/lib/db";
import { getTranslation, Locale } from "@/lib/translations";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PrintButton from "@/components/PrintButton";
import { getSessionUser } from "@/lib/access-control";

export const dynamic = "force-dynamic";

async function getGoatCertData(id: string) {
  const result = await query(
    `
      SELECT 
        A.name, A.sex, A.id AS id, A.id_mother, A.id_father, A.id_user,
        Di.date_born, Di.born_weight, Di.born_qty, Di.score as goat_score,
        Di.horns_type, Di.code_ua, Di.code_abg, Di.code_chip, Di.manuf as breeder_manual, Di.owner as owner_manual,
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
  const res = await query("SELECT * FROM goats_lact WHERE id_goat = $1 ORDER BY lact_no ASC LIMIT 10", [id]);
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
    
    const res = await query("SELECT * FROM goats_lact WHERE id IN (SELECT unnest($1::int[]))", [validIds]);
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

  const getHornTypeEN = (type: number) => {
    const horns = ["", "polled", "dehorned", "horned"];
    return horns[type] || "horned";
  };

  const getStdb = (alias: string) => {
    if (alias === 'ex') return 'RExB';
    if (alias === 'tg') return 'RHB';
    if (alias === 'ft') return 'RFB';
    return 'RHB'; 
  };

  if (type === "1") {
    const lactations = await getLactations(id);
    const stdb = getStdb(goat.studbook_alias);

    return (
      <div className="min-h-screen bg-white p-4 font-sans text-black">
        <style dangerouslySetInnerHTML={{ __html: `
            /* Hide global UI on this page */
            header, nav, footer, .global-nav, .global-footer { display: none !important; }
            body { background: #f3f4f6 !important; }

            @media print {
              @page { size: portrait; margin: 0.5cm; }
              body { background: white !important; }
              .printable-area { border: 2px solid #000 !important; box-shadow: none !important; padding: 10px !important; }
              .print-hidden { display: none !important; }
              
              /* Hide unselected lactation rows */
              .lactation-row:has(.lact-picker:not(:checked)) {
                display: none !important;
              }
            }
            .print-hidden { transition: opacity 0.2s; }
            .lactation-row:has(.lact-picker:not(:checked)) { opacity: 0.3; }
            .grid-table { border-collapse: collapse; width: 100%; border: 1.5px solid #000; }
            .grid-table td { border: 1px solid #000; padding: 2px 6px; font-size: 11px; vertical-align: middle; height: 26px; }
            .grid-label { font-weight: bold; width: 110px; background: #fff; }
            .productive-table { border-collapse: collapse; width: 100%; border: 1.5px solid #000; text-align: center; }
            .productive-table th, .productive-table td { border: 1px solid #000; padding: 0px; font-size: 11px; }
            .productive-table th { background: #5D2A18; color: white; font-weight: bold; padding: 4px; }
            .productive-table input { width: 100%; height: 100%; border: none; outline: none; text-align: center; background: transparent; font-size: 13px; font-weight: bold; }
        `}} />
        
        <div className="max-w-[950px] mx-auto bg-white p-6 shadow-none relative printable-area border-2 border-black overflow-hidden">
          
          {/* Certificate Header Hidden per user request */}

          <main>
            <div className="grid grid-cols-3 gap-0 border-[1.5px] border-black mb-6">
                {/* Column 1 */}
                <table className="grid-table border-none col-span-1">
                  <tbody>
                    <tr><td className="grid-label">Кличка:</td><td><input className="w-full font-bold bg-transparent border-none outline-none" defaultValue={goat.name} /></td></tr>
                    <tr><td className="grid-label">Д.нар.:</td><td><input className="w-full bg-transparent border-none outline-none" defaultValue={goat.date_born ? new Date(goat.date_born).toLocaleDateString('uk-UA') : ''} /></td></tr>
                    <tr><td className="grid-label">Стать:</td><td><input className="w-full font-bold bg-transparent uppercase text-[10px] border-none outline-none" defaultValue={goat.sex === 1 ? 'Male' : 'Female'} /></td></tr>
                    <tr><td className="grid-label">ID ABG:</td><td><input className="w-full font-bold bg-transparent border-none outline-none" defaultValue={goat.code_abg || `ABG UA ${goat.id.toString().padStart(6,'0')}`} /></td></tr>
                    <tr><td className="grid-label">ID UA:</td><td><input className="w-full bg-transparent border-none outline-none" defaultValue={goat.code_ua || ''} /></td></tr>
                    <tr><td className="grid-label">Чіп:</td><td><input className="w-full font-bold bg-transparent border-none outline-none" defaultValue={goat.code_chip || ''} /></td></tr>
                    <tr><td className="grid-label">Заводчик:</td><td><input className="w-full font-bold bg-transparent text-[9px] border-none outline-none" defaultValue={goat.breeder_manual || goat.user_farm_name || ''} /></td></tr>
                  </tbody>
                </table>
                {/* Column 2 */}
                <table className="grid-table border-none col-span-1 border-x border-black">
                  <tbody>
                    <tr><td className="grid-label">Порода:</td><td><input className="w-full font-bold bg-transparent border-none outline-none" defaultValue={goat.breed_name || 'TFG'} /></td></tr>
                    <tr><td className="grid-label">Породність:</td><td><input className="w-full bg-transparent border-none outline-none" defaultValue="100" /></td></tr>
                    <tr><td className="grid-label">Кровність:</td><td><input className="w-full bg-transparent border-none outline-none" defaultValue="199" /></td></tr>
                    <tr><td className="grid-label">Нар. в числі:</td><td><input className="w-full bg-transparent border-none outline-none" defaultValue={goat.born_qty || '2'} /></td></tr>
                    <tr><td className="grid-label">Вага п/н:</td><td><input className="w-full bg-transparent border-none outline-none" defaultValue={goat.born_weight || '4600'} /></td></tr>
                    <tr className="bg-gray-50/20">
                        <td className="grid-label italic opacity-40 leading-none">Жива вага:</td>
                        <td><input className="w-full bg-transparent border-none outline-none" defaultValue="" placeholder="..." /></td>
                    </tr>
                    <tr><td className="grid-label">Масть:</td><td><input className="w-full bg-transparent border-none outline-none" defaultValue="Brown" /></td></tr>
                  </tbody>
                </table>
                {/* Column 3 */}
                <table className="grid-table border-none col-span-1">
                  <tbody>
                    <tr><td className="grid-label">Рогатість:</td><td><input className="w-full font-bold bg-transparent uppercase text-[9px] border-none outline-none" defaultValue={getHornTypeEN(goat.horns_type)} /></td></tr>
                    <tr><td className="grid-label">Бал п/н:</td><td><input className="w-full bg-transparent border-none outline-none" defaultValue={goat.goat_score || '5'} /></td></tr>
                    <tr><td className="grid-label">Кіл-ть сосків:</td><td><input className="w-full font-bold bg-transparent border-none outline-none" defaultValue="2" /></td></tr>
                    <tr><td className="grid-label">Екс.оц.,к-ть бал.:</td><td><input className="w-full bg-transparent border-none outline-none font-black text-red-700" defaultValue={goat.test_score || ''} /></td></tr>
                    <tr><td className="grid-label">Клас:</td><td><input className="w-full font-bold bg-transparent border-none outline-none" defaultValue={goat.test_class || ''} /></td></tr>
                    <tr><td className="grid-label">Плем.кн.:</td><td><input className="w-full font-bold bg-transparent border-none outline-none" defaultValue={`${stdb} R${10000 + Number(goat.id)}`} /></td></tr>
                    <tr><td colSpan={2} className="bg-white"></td></tr>
                  </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mb-1">
                <h2 className="flex-1 text-center font-black text-[14px] uppercase tracking-tight italic bg-[#5D2A18] text-white py-1">TRIBAL VALUE AND POWERFUL PRODUCTIVITY OF THE CREATURE</h2>
                <div className="print-hidden ml-4 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded text-[10px] font-bold text-yellow-800 animate-pulse">
                   PICK 3 LACTATIONS TO PRINT ➔
                </div>
            </div>

            <table className="productive-table w-full mb-8">
                <thead>
                    <tr>
                        <th className="print-hidden w-8 bg-gray-200 !text-black border-black">V</th>
                        <th colSpan={2} className="w-[20%] uppercase">LACTATION</th>
                        <th colSpan={2} className="w-[25%] uppercase">НАДІЙ</th>
                        <th colSpan={2} className="w-[25%] uppercase">MILK FAT</th>
                        <th colSpan={2} className="w-[30%] uppercase">МОЛОЧНИЙ БІЛОК</th>
                    </tr>
                    <tr className="bg-white text-black text-[9px] uppercase font-black uppercase">
                        <th className="print-hidden !bg-white !text-black border-black border-collapse"></th>
                        <th className="!bg-white !text-black border-black border-collapse">№</th>
                        <th className="!bg-white !text-black border-black border-collapse">ДНІВ</th>
                        <th className="!bg-white !text-black border-black border-collapse">KG</th>
                        <th className="!bg-white !text-black border-black border-collapse">CLASS</th>
                        <th className="!bg-white !text-black border-black border-collapse">%</th>
                        <th className="!bg-white !text-black border-black border-collapse">CLASS</th>
                        <th className="!bg-white !text-black border-black border-collapse">%</th>
                        <th className="!bg-white !text-black border-black border-collapse">CLASS</th>
                    </tr>
                </thead>
                <tbody className="lactation-body">
                    {lactations.map((l: any, i: number) => {
                        return (
                            <tr key={i} className="h-10 transition-opacity lactation-row">
                                <td className="print-hidden border-black bg-gray-50">
                                    <input 
                                        type="checkbox" 
                                        className="lact-picker w-5 h-5 cursor-pointer accent-emerald-600" 
                                        defaultChecked={i < 3} 
                                    />
                                </td>
                                <td className="border-black w-[10%]"><input className="font-bold border-none outline-none bg-transparent text-center" defaultValue={l.lact_no || ''} /></td>
                                <td className="border-black w-[10%]"><input className="border-none outline-none bg-transparent text-center" defaultValue={l.lact_days || ''} /></td>
                                <td className="border-black w-[15%]"><input className="font-black text-lg border-none outline-none bg-transparent text-center" defaultValue={l.milk || ''} /></td>
                                <td className="border-black w-[10%]"><input className="border-none outline-none bg-transparent text-center" defaultValue="-" /></td>
                                <td className="border-black w-[12%]"><input className="border-none outline-none bg-transparent text-center" defaultValue={l.fat || ''} /></td>
                                <td className="border-black w-[13%]"><input className="border-none outline-none bg-transparent text-center" defaultValue="-" /></td>
                                <td className="border-black w-[12%]"><input className="border-none outline-none bg-transparent text-center" defaultValue={l.protein || ''} /></td>
                                <td className="border-black w-[13%]"><input className="border-none outline-none bg-transparent text-center" defaultValue="-" /></td>
                            </tr>
                        )
                    })}
                    {/* Filler rows if less than 3 */}
                    {lactations.length < 3 && [...Array(3 - lactations.length)].map((_, i) => (
                        <tr key={i + 10} className="h-10 lactation-row">
                             <td className="print-hidden border-black bg-gray-50"></td>
                            <td className="border-black"><input className="border-none outline-none bg-transparent text-center" /></td>
                            <td className="border-black"><input className="border-none outline-none bg-transparent text-center" /></td>
                            <td className="border-black"><input className="border-none outline-none bg-transparent text-center" /></td>
                            <td className="border-black"><input className="border-none outline-none bg-transparent text-center" /></td>
                            <td className="border-black"><input className="border-none outline-none bg-transparent text-center" /></td>
                            <td className="border-black"><input className="border-none outline-none bg-transparent text-center" /></td>
                            <td className="border-black"><input className="border-none outline-none bg-transparent text-center" /></td>
                            <td className="border-black"><input className="border-none outline-none bg-transparent text-center" /></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-6 space-y-4 text-[11px] relative mb-16">
               <div className="flex gap-4 border-b border-black/30 pb-1">
                  <span className="w-56 font-bold opacity-60 uppercase text-[9px] self-end">VIDANE (TO WHOM), ADDRESSES, TELEPHONE:</span>
                  <textarea className="flex-1 border-none outline-none resize-none h-10 font-bold p-0 leading-tight bg-transparent text-[13px]" defaultValue={`${goat.owner_manual || goat.user_farm_name || ''}, ${goat.user_phone || ''}`} />
               </div>
               <div className="flex gap-4 border-b border-black/30 pb-1">
                  <span className="w-56 font-bold opacity-60 uppercase text-[9px] self-end">BREEDER, ADDRESS, PHONE NUMBER:</span>
                  <textarea className="flex-1 border-none outline-none resize-none h-10 font-bold p-0 leading-tight bg-transparent text-[13px]" defaultValue={`${goat.breeder_manual || goat.user_farm_name || ''}, ${goat.user_phone || ''}`} />
               </div>
               
               <div className="absolute right-0 bottom-[-18px] text-[10px] font-black uppercase underline tracking-widest italic opacity-40">RECORDED CORRECTLY</div>
            </div>

            {/* FINAL OFFICIAL STRIPS */}
            <div className="mt-12 space-y-1">
                <div className="bg-[#C5E0B4] px-4 py-2 border border-black flex items-center justify-between text-[11px] font-bold">
                    <div className="flex items-center gap-6">
                        <span className="uppercase tracking-widest">Ukraine</span>
                        <div className="w-16 h-px bg-black opacity-20"></div>
                    </div>
                    <div className="flex gap-12 uppercase italic opacity-80">
                        <span>Head of GS "................" such and such</span>
                        <span>Signature and seal...</span>
                    </div>
                </div>

                <div className="bg-[#B4E0E0] px-6 py-4 border border-black flex items-center justify-between relative">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-black uppercase text-blue-900 leading-tight">Head of GS</span>
                        <span className="text-[12px] font-bold uppercase text-blue-900 leading-tight">"Association of Pedigree Goats"</span>
                    </div>
                    <div className="flex items-baseline gap-4">
                        <span className="opacity-40 text-[9px] uppercase font-black italic">Surname:</span>
                        <span className="text-[20px] font-black text-blue-950 tracking-tighter">Alekseeva M.V.</span>
                    </div>
                </div>
                
                <div className="flex justify-between items-center text-[10px] font-bold italic mt-1 px-2 opacity-60">
                    <span>Дата видачі: {new Date().toLocaleDateString('uk-UA')}</span>
                    <span>Official Registration Document</span>
                </div>
            </div>
          </main>
        </div>

        <div className="mt-10 text-center print:hidden flex justify-center gap-6 pb-20">
           <PrintButton label="PRINT FACADE (TYPE 1)" className="bg-blue-950 text-white px-10 py-4 rounded-xl font-black uppercase hover:bg-black transition-all shadow-xl active:scale-95 translate-y-0" />
           <Link href={`/goats/${id}`} className="px-10 py-4 border-2 border-gray-300 rounded-xl font-black uppercase hover:bg-gray-100 transition-all text-sm shadow-md">Back to Profile</Link>
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

    const renderLactTable = async (p: string, anc: any) => {
        const isMale = anc.sex === 1;
        let rows = [];
        let headerText = "Днів лактації";
        let subHeaderText = "№";
        let col1Text = "kg";
        
        if (isMale) {
            headerText = "Нащадки (Offspring)";
            subHeaderText = "ID Нащадка";
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
                           <th rowSpan={2} className="w-10 border-r border-black">{isMale ? "Breed" : "Днів"}</th>
                           <th colSpan={2} className="border-r border-black">Надій</th>
                           <th colSpan={2} className="border-r border-black">Жир</th>
                           <th colSpan={2}>Білок</th>
                        </tr>
                        <tr className="divide-x divide-black text-[6.5px]">
                           <th className="border-r border-black">кг</th><th className="border-r border-black">Клас</th>
                           <th className="border-r border-black">%</th><th className="border-r border-black">Клас</th>
                           <th className="border-r border-black">%</th><th>Клас</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/40 italic font-bold text-[8px]">
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
                          <td colSpan={2} className="border-r border-black text-center pr-2 italic">Середне:</td>
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
                <div className="flex border-b-2 border-black font-black text-[12px] mb-1 leading-none pb-1 items-end">
                    <span className="mr-2 text-2xl leading-none text-blue-900/80">{symbol}</span>
                    <input className="flex-1 w-full border-none outline-none italic uppercase text-sm tracking-tight bg-transparent" defaultValue={d.name || ''} />
                    <input className="w-20 border-none outline-none text-right font-bold text-[10px] self-end text-black/60 bg-transparent" defaultValue={`R${10000 + Number(d.id || 0)}`} />
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

                <div className="grid grid-cols-3 gap-x-4 text-[8px] font-bold uppercase border-t border-black/20 pt-1 leading-tight">
                    <div className="flex justify-between"><span>Breed:</span><input className="w-16 border-none outline-none text-right bg-transparent text-[9px]" defaultValue={d.breed_name || ''} /></div>
                    <div className="flex justify-between"><span>Born:</span><input className="w-16 border-none outline-none text-right bg-transparent text-[9px]" defaultValue={d.date_born ? new Date(d.date_born).toLocaleDateString() : ''} /></div>
                    <div className="flex justify-between"><span>Score:</span><input className="w-12 border-none outline-none text-right bg-transparent text-red-700 font-black text-[9px]" defaultValue={d.test_score || ''} /></div>
                    <div className="flex justify-between"><span>Blood:</span><input className="w-16 border-none outline-none text-right bg-transparent text-[9px]" defaultValue="100%" /></div>
                    <div className="flex justify-between"><span>Class:</span><input className="w-16 border-none outline-none text-right bg-transparent text-[9px]" defaultValue={d.test_class || 'Elite'} /></div>
                    <div className="flex justify-between"><span>Owner:</span><input className="w-16 border-none outline-none text-right bg-transparent text-[9px] truncate" defaultValue={d.owner || d.manuf || ''} /></div>
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
                <div className="flex border-b border-black/60 mb-0.5 items-end justify-between px-0.5">
                   <div className="flex items-end">
                      <span className="font-black mr-1 text-[9px] text-blue-900/60 leading-none">{symbol}</span>
                      <input className="w-20 border-none outline-none italic truncate bg-transparent leading-none text-[8px] uppercase" defaultValue={d.name || ''} />
                   </div>
                   <input className="w-12 border-none outline-none text-right text-[6px] opacity-40 bg-transparent" defaultValue={`R${10000 + Number(d.id || 0)}`} />
                </div>
                <div className="grid grid-cols-1 gap-x-0 leading-[1] uppercase px-0.5">
                   <div className="flex justify-between"><span className="opacity-40">A:</span><input className="w-20 border-none outline-none text-right bg-transparent" defaultValue={d.code_abg || ''} /></div>
                   <div className="flex justify-between"><span className="opacity-40">U:</span><input className="w-20 border-none outline-none text-right bg-transparent truncate" defaultValue={d.code_ua || ''} /></div>
                   <div className="flex justify-between"><span className="opacity-40">C:</span><input className="w-20 border-none outline-none text-right bg-transparent truncate" defaultValue={d.code_chip || ''} /></div>
                   <div className="flex justify-between"><span className="opacity-40">S:</span><input className="w-20 border-none outline-none text-right bg-transparent" defaultValue={getStdb(d.studbook_alias)} /></div>
                   <div className="mt-0.5 border-t border-black/20 pt-0.5">
                      <input className="w-full border-none outline-none text-center bg-transparent text-[#491907] font-black italic text-[7px]" defaultValue={lactFormat} />
                   </div>
                </div>
            </div>
        );
    };

    return (
      <div className="min-h-screen bg-gray-50/20 p-4 font-sans text-black print:p-0">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page { size: landscape; margin: 0.3cm; }
            body { background: white; zoom: 110%; }
            .printable-area { border: 2px solid #000 !important; box-shadow: none !important; padding: 10px !important; margin: 0 !important; width: 100% !important; }
            .no-print { display: none !important; }
            header, footer, nav { display: none !important; }
          }
        `}} />
        
        <div className="max-w-[1400px] mx-auto bg-white border-[2px] border-black p-4 print:border-solid shadow-xl printable-area relative overflow-hidden">
           
           <div className="grid grid-cols-2 gap-3 mb-3">
               {await renderAncBlock('m', 'M')}
               {await renderAncBlock('f', 'Б')}
           </div>

           <div className="grid grid-cols-4 gap-2 mb-3">
               {await renderAncBlock('mm', 'ММ')}
               {await renderAncBlock('fm', 'БМ')}
               {await renderAncBlock('mf', 'МБ')}
               {await renderAncBlock('ff', 'ББ')}
           </div>

           <div className="grid grid-cols-8 gap-0.5 mb-8">
               {renderSmallAnc('mmm', 'МММ')}
               {renderSmallAnc('fmm', 'БММ')}
               {renderSmallAnc('mfm', 'МБМ')}
               {renderSmallAnc('ffm', 'ББМ')}
               {renderSmallAnc('mmf', 'ММБ')}
               {renderSmallAnc('fmf', 'БМБ')}
               {renderSmallAnc('mff', 'МББ')}
               {renderSmallAnc('fff', 'БББ')}
           </div>

           {/* Printing specific signature area bottom of tree page */}
           <div className="mt-8 border-t-2 border-black pt-4 flex justify-between items-start text-[10px] font-bold italic uppercase h-20">
              <div className="flex flex-col gap-2">
                 <span>Recorded Correctly / ПІДТВЕРДЖЕНО: _________________________</span>
                 <p className="normal-case opacity-40 text-[9px] w-96 leading-tight">Цей сертифікат є офіційним документом, що підтверджує племінну цінність тварини.</p>
              </div>
              <div className="text-right flex flex-col items-end">
                 <span className="mb-8">HEAD OF GS: Alekseeva M.V. / _______________</span>
                 <span>DATE: {new Date().toLocaleDateString()}</span>
              </div>
           </div>

        </div>

        <div className="mt-16 text-center no-print flex justify-center gap-6 pb-20">
            <PrintButton label="PRINT 3-GEN TREE (LANDSCAPE)" className="bg-blue-950 text-white px-10 py-4 rounded-xl font-black uppercase hover:bg-black transition-all shadow-2xl active:scale-95" />
            <Link href={`/goats/${id}`} className="px-10 py-4 border-2 border-gray-300 rounded-xl font-black uppercase hover:bg-gray-100 transition-all text-sm shadow-md">Back to Profile</Link>
        </div>
      </div>
    );
  }

  return notFound();
}
