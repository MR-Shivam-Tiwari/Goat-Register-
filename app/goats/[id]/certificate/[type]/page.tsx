import { query } from "@/lib/db";
import { getTranslation, Locale } from "@/lib/translations";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

async function getGoatCertData(id: string) {
  const result = await query(
    `
      SELECT 
        A.name, A.sex, A.id AS id, A.id_mother, A.id_father, A.id_user,
        Di.date_born, Di.born_weight, Di.born_qty, Di.score as goat_score,
        Di.horns_type, Di.code_ua, Di.code_abg, Di.code_chip, Di.manuf, Di.owner,
        B.name as breed_name,
        S.name as studbook_name, S.alias as studbook_alias,
        T.score_total as test_score, T.class as test_class, T.category,
        U.name as breeder_name, U.phone as breeder_phone, U.email as breeder_email
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
  const res = await query("SELECT * FROM goats_lact WHERE id_goat = $1 ORDER BY lact_no ASC", [id]);
  return res.rows;
}

async function getCertSelections(id: string) {
  const res = await query("SELECT * FROM goats_cert WHERE id_goat = $1", [id]);
  return res.rows[0] || {};
}

async function getAncestorLactations(ids: any[]) {
    if (ids.length === 0) return [];
    const res = await query("SELECT * FROM goats_lact WHERE id IN (SELECT unnest($1::int[]))", [ids]);
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
  const goat = await getGoatCertData(id);
  if (!goat) notFound();

  const cookieStore = await cookies();
  const locale = (cookieStore.get("nxt-lang")?.value || "ru") as Locale;
  const t = getTranslation(locale);

  const getHornType = (type: number) => {
    const horns = ["", "Комолий", "Обезрожен", "Рогатий"];
    return horns[type] || "";
  };

  const getStdb = (alias: string) => {
    if (alias === 'ex') return 'RExB';
    if (alias === 'tg') return 'RHB';
    if (alias === 'ft') return 'RFB';
    return 'RCB';
  };

  if (type === "1") {
    // ... (rest of type 1 logic remains the same)
    const lactations = await getLactations(id);
    const selections = await getCertSelections(id);
    const selectIds = [1,2,3,4,5].map(i => selections[`id_i_row${i}`]).filter(v => v);
    const selectedLacts = await getAncestorLactations(selectIds);
    const stdb = getStdb(goat.studbook_alias);

    return (
      <div className="min-h-screen bg-white p-10 font-sans text-black">
        <div className="max-w-[1000px] mx-auto border-2 border-black p-10 bg-white shadow-2xl">
           <header className="text-center mb-12 border-b-2 border-black pb-6">
              <h1 className="text-3xl font-black uppercase tracking-widest">
                 {stdb === 'RHB' ? 'ПЛЕМІННИЙ СЕРТИФІКАТ' : 'СЕРТИФІКАТ ВІДПОВІДНОСТІ'}
              </h1>
           </header>

           <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-[12px] mb-12">
              <div className="flex border-b border-black/20 py-2">
                 <span className="w-48 font-bold uppercase opacity-60">Nickname:</span>
                 <span className="font-black text-sm">{goat.name}</span>
              </div>
              <div className="flex border-b border-black/20 py-2">
                 <span className="w-48 font-bold uppercase opacity-60">Breed:</span>
                 <span className="font-black text-sm">{goat.breed_name}</span>
              </div>
              <div className="flex border-b border-black/20 py-2">
                 <span className="w-48 font-bold uppercase opacity-60">Horniness:</span>
                 <span className="font-bold">{getHornType(goat.horns_type)}</span>
              </div>
              <div className="flex border-b border-black/20 py-2">
                 <span className="w-48 font-bold uppercase opacity-60">D.nar.:</span>
                 <span className="font-bold">{goat.date_born ? new Date(goat.date_born).toLocaleDateString() : '-'}</span>
              </div>
              <div className="flex border-b border-black/20 py-2">
                 <span className="w-48 font-bold uppercase opacity-60">Relationship:</span>
                 <span className="font-bold">-</span>
              </div>
              <div className="flex border-b border-black/20 py-2">
                 <span className="w-48 font-bold uppercase opacity-60">Ball p/n:</span>
                 <span className="font-bold">{goat.goat_score || '-'}</span>
              </div>
              <div className="flex border-b border-black/20 py-2">
                 <span className="w-48 font-bold uppercase opacity-60">Become:</span>
                 <span className="font-bold">{goat.sex === 1 ? 'Чоловіча' : 'Жиноча'}</span>
              </div>
              <div className="flex border-b border-black/20 py-2">
                 <span className="w-48 font-bold uppercase opacity-60">Blood:</span>
                 <span className="font-bold">-</span>
              </div>
              <div className="flex border-b border-black/20 py-2">
                 <span className="w-48 font-bold uppercase opacity-60">ABG ID:</span>
                 <span className="font-bold">{goat.code_abg || '-'}</span>
              </div>
              <div className="flex border-b border-black/20 py-2">
                 <span className="w-48 font-bold uppercase opacity-60">Нар. в числі:</span>
                 <span className="font-bold">{goat.born_qty || '-'}</span>
              </div>
              <div className="flex border-b border-black/20 py-2">
                 <span className="w-48 font-bold uppercase opacity-60">Ex. assessment, score:</span>
                 <span className="font-bold text-red-600">{goat.test_score || '-'}</span>
              </div>
              <div className="flex border-b border-black/20 py-2">
                 <span className="w-48 font-bold uppercase opacity-60">ID UA:</span>
                 <span className="font-bold">{goat.code_ua || '-'}</span>
              </div>
              <div className="flex border-b border-black/20 py-2">
                 <span className="w-48 font-bold uppercase opacity-60">Vaga p/n:</span>
                 <span className="font-bold">{goat.born_weight || '-'}</span>
              </div>
              <div className="flex border-b border-black/20 py-2">
                 <span className="w-48 font-bold uppercase opacity-60">Class:</span>
                 <span className="font-bold">{goat.test_class || '-'}</span>
              </div>
              <div className="flex border-b border-black/20 py-2">
                 <span className="w-48 font-bold uppercase opacity-60">Чіп:</span>
                 <span className="font-black">{goat.code_chip || '-'}</span>
              </div>
              <div className="flex border-b border-black/20 py-2">
                 <span className="w-48 font-bold uppercase opacity-60">Tribal Prince:</span>
                 <span className="font-bold">{stdb}</span>
              </div>
              <div className="flex border-b border-black/20 py-2 col-span-2">
                 <span className="w-48 font-bold uppercase opacity-60">Breeder:</span>
                 <span className="font-bold">{goat.manuf || '-'}</span>
              </div>
           </div>

           <div className="mb-12">
              <div className="bg-[#491907] text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest mb-1 italic">
                 Tribal value and powerful productivity of the creature
              </div>
              <table className="w-full border-collapse text-[10px] text-center" style={{ border: '3px double black' }}>
                 <thead className="bg-gray-50 uppercase font-bold text-black border-b-2 border-black">
                    <tr className="divide-x divide-black border-b border-black">
                       <th className="p-1 px-2 border-r border-black" colSpan={2}>Lactation</th>
                       <th className="p-1 px-2 border-r border-black" colSpan={2}>Надій</th>
                       <th className="p-1 px-2 border-r border-black" colSpan={2}>Milk<br/>fat</th>
                       <th className="p-1 px-2" colSpan={2}>Моочний<br/>білок</th>
                    </tr>
                    <tr className="divide-x divide-black text-[9px]">
                       <th className="p-1 border-r border-black">No.</th>
                       <th className="p-1 border-r border-black">Днів</th>
                       <th className="p-1 border-r border-black">kg</th>
                       <th className="p-1 border-r border-black">Class</th>
                       <th className="p-1 border-r border-black">%</th>
                       <th className="p-1 border-r border-black">Class</th>
                       <th className="p-1 border-r border-black">%</th>
                       <th className="p-1 font-bold">Class</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-black/40">
                    {lactations.length > 0 ? (
                       lactations.map((l: any, i: number) => (
                          <tr key={i} className="divide-x divide-black">
                             <td className="p-1.5 font-bold border-r border-black">{l.lact_no}</td>
                             <td className="p-1.5 border-r border-black">{l.lact_days}</td>
                             <td className="p-1.5 font-black text-sm border-r border-black">{l.milk}</td>
                             <td className="p-1.5 border-r border-black">-</td>
                             <td className="p-1.5 border-r border-black">{l.fat}</td>
                             <td className="p-1.5 border-r border-black">-</td>
                             <td className="p-1.5 border-r border-black">{l.protein}</td>
                             <td className="p-1.5 font-bold">-</td>
                          </tr>
                       ))
                    ) : (
                       [...Array(5)].map((_, i) => (
                          <tr key={i} className="divide-x divide-black h-8">
                             <td className="p-1.5 border-r border-black"></td>
                             <td className="p-1.5 border-r border-black"></td>
                             <td className="p-1.5 border-r border-black"></td>
                             <td className="p-1.5 border-r border-black"></td>
                             <td className="p-1.5 border-r border-black"></td>
                             <td className="p-1.5 border-r border-black"></td>
                             <td className="p-1.5 border-r border-black"></td>
                             <td className="p-1.5"></td>
                          </tr>
                       ))
                    )}
                 </tbody>
              </table>
           </div>

           <div className="mb-12">
              <div className="bg-[#491907] text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest mb-1 italic text-end">
                 Naschadki (Selection Summary)
              </div>
              <table className="w-full border-collapse text-[10px] text-center" style={{ border: '3px double black' }}>
                 <thead className="bg-gray-50 uppercase font-bold text-black border-b-2 border-black">
                    <tr className="divide-x divide-black border-b border-black">
                       <th className="p-1 px-2 border-r border-black w-24" rowSpan={2}>Naschadki</th>
                       <th className="p-1 px-2 border-r border-black w-24" rowSpan={2}>Днів лактації</th>
                       <th className="p-1 px-2 border-r border-black" colSpan={2}>Надій</th>
                       <th className="p-1 px-2 border-r border-black" colSpan={2}>Milk<br/>Fat</th>
                       <th className="p-1 px-2" colSpan={2}>Моочний<br/>білок</th>
                    </tr>
                    <tr className="divide-x divide-black text-[9px]">
                       <th className="p-1 border-r border-black">kg</th>
                       <th className="p-1 border-r border-black">Class</th>
                       <th className="p-1 border-r border-black">kg</th>
                       <th className="p-1 border-r border-black">Class</th>
                       <th className="p-1 border-r border-black">kg</th>
                       <th className="p-1 font-bold">Class</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-black/40">
                    {selectedLacts.length > 0 ? (
                       selectedLacts.map((l: any, i: number) => (
                          <tr key={i} className="divide-x divide-black">
                             <td className="p-1.5 font-bold border-r border-black opacity-30 italic">{i + 1}</td>
                             <td className="p-1.5 border-r border-black">{l.lact_days}</td>
                             <td className="p-1.5 font-black text-sm border-r border-black">{l.milk}</td>
                             <td className="p-1.5 border-r border-black">-</td>
                             <td className="p-1.5 border-r border-black">{l.fat}</td>
                             <td className="p-1.5 border-r border-black">-</td>
                             <td className="p-1.5 border-r border-black">{l.protein}</td>
                             <td className="p-1.5 font-bold">-</td>
                          </tr>
                       ))
                    ) : (
                       [...Array(5)].map((_, i) => (
                          <tr key={i} className="divide-x divide-black h-8">
                             <td className="p-1.5 border-r border-black"></td>
                             <td className="p-1.5 border-r border-black"></td>
                             <td className="p-1.5 border-r border-black"></td>
                             <td className="p-1.5 border-r border-black"></td>
                             <td className="p-1.5 border-r border-black"></td>
                             <td className="p-1.5 border-r border-black"></td>
                             <td className="p-1.5 border-r border-black"></td>
                             <td className="p-1.5"></td>
                          </tr>
                       ))
                    )}
                 </tbody>
              </table>
           </div>

           <div className="grid grid-cols-2 gap-12 text-[10px] mb-12">
              <div className="space-y-4">
                 <div className="border-b border-black/20 pb-1">
                    <span className="font-bold opacity-60 uppercase block text-[9px]">Vidane (to whom), addresses, telephone:</span>
                    <div className="font-black text-sm mt-1">
                       {goat.owner || '-'}<br/>
                    </div>
                 </div>
                 <div className="border-b border-black/20 pb-1">
                    <span className="font-bold opacity-60 uppercase block text-[9px]">Breeder, address, phone number:</span>
                    <div className="font-black text-sm mt-1">
                       {goat.breeder_name || goat.manuf || '-'}<br/>
                       {goat.breeder_phone && <span>Tel: {goat.breeder_phone}</span>}
                    </div>
                 </div>
              </div>
              <div className="flex flex-col justify-end">
                  <div className="text-center font-black uppercase mb-4 border-b-2 border-black inline-block self-center px-4">
                      Recorded correctly
                  </div>
              </div>
           </div>

           <footer className="mt-12 flex justify-between items-end border-t-2 border-black pt-8">
              <div className="text-[10px] font-black uppercase opacity-60 flex flex-col gap-1">
                 <span>Date of publication:</span>
                 <span className="text-sm text-black">{new Date().toLocaleDateString('uk-UA')}</span>
              </div>
              <div className="text-center font-black uppercase flex flex-col items-center">
                 <span className="text-xs">Official Stamp & Signature</span>
                 <div className="h-28 w-56 border-2 border-black border-dashed mt-4 rounded-xl flex items-center justify-center opacity-10 rotate-[-5deg]">
                    <span className="text-[8px]">ASSOCIATION SEAL PLACEHOLDER</span>
                 </div>
              </div>
           </footer>
        </div>
        <div className="mt-12 text-center print:hidden flex justify-center gap-6">
           <PrintButton label="PRINT CERTIFICATE 1" className="bg-[#491907] text-white px-10 py-3 rounded-xl font-black uppercase hover:bg-black transition-all shadow-xl" />
           <Link href={`/goats/${id}`} className="px-10 py-3 border-2 border-gray-200 rounded-xl font-black uppercase hover:bg-gray-50 transition-all">Back to Profile</Link>
        </div>
      </div>
    );
  }

  if (type === "2") {
    const selections = await getCertSelections(id);
    const prefixes = ['m','f','mm','fm','mf','ff','mmm','fmm','mfm','ffm','mmf','fmf','mff','fff'];
    
    // Fetch all ancestor IDs first using recursive CTE to get the basic tree
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
        // Find which path this goat belongs to (could be multiple if inbred, but usually one in a certificate context)
        const path = Object.keys(pathIdMap).find(p => pathIdMap[p] === d.id);
        if (path) detailsMap[path] = d;
    });

    // Get all lactation IDs to fetch in one go
    const allSelectedLactIds: number[] = [];
    prefixes.forEach(p => {
        for(let j=1; j<=3; j++) {
            const lid = selections[`id_${p}_row${j}`];
            if(lid) allSelectedLactIds.push(lid);
        }
    });

    const lacts = await getAncestorLactations(allSelectedLactIds);
    const lactMap: any = {};
    lacts.forEach((l: any) => lactMap[l.id] = l);

    const renderLactTable = (p: string, isSmall = false) => {
        const rows = [1,2,3].map(j => lactMap[selections[`id_${p}_row${j}`]]).filter(v => v);
        
        // Calculate averages
        let avgMilk = 0, avgFat = 0, avgProt = 0;
        if (rows.length > 0) {
            avgMilk = rows.reduce((acc, r) => acc + (parseFloat(r.milk) || 0), 0) / rows.length;
            avgFat = rows.reduce((acc, r) => acc + (parseFloat(r.fat) || 0), 0) / rows.length;
            avgProt = rows.reduce((acc, r) => acc + (parseFloat(r.protein) || 0), 0) / rows.length;
        }

        if (isSmall) {
            return (
                <table className="w-full text-[7px] border-collapse text-center mt-1 border border-black/40">
                    <thead className="bg-gray-50 border-b border-black/40 font-bold opacity-60">
                        <tr className="divide-x divide-black/40">
                           <th>Днів</th><th>Надій</th><th>Жир%</th><th>Білок%</th><th>Клас</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10">
                        {rows.map((r, i) => (
                           <tr key={i} className="divide-x divide-black/10">
                              <td>{r.lact_days}</td><td>{r.milk}</td><td>{r.fat}</td><td>{r.protein}</td><td>-</td>
                           </tr>
                        ))}
                        {[...Array(Math.max(0, 3 - rows.length))].map((_, i) => (
                           <tr key={`e-${i}`} className="h-3 divide-x divide-black/10"><td></td><td></td><td></td><td></td><td></td></tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        return (
            <div className="mt-2">
                <table className="w-full text-[8px] border-collapse text-center border-2 border-black/60">
                    <thead className="bg-[#fcfcfc] border-b-2 border-black/60 font-bold italic">
                        <tr className="divide-x divide-black/60 border-b border-black/20">
                           <th rowSpan={2} className="w-6">№</th>
                           <th rowSpan={2} className="w-10 text-[7px]">Днів лактації</th>
                           <th colSpan={2}>Надій</th>
                           <th colSpan={2}>Молочний жир</th>
                           <th colSpan={2}>Молочний білок</th>
                        </tr>
                        <tr className="divide-x divide-black/60 text-[7px]">
                           <th>кг</th><th>Клас</th><th>%</th><th>Клас</th><th>%</th><th>Клас</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/20 italic">
                        {rows.map((r, i) => (
                           <tr key={i} className="divide-x divide-black/20">
                              <td>{r.lact_no}</td><td>{r.lact_days}</td><td className="font-bold">{r.milk}</td><td>-</td><td>{r.fat}</td><td>-</td><td>{r.protein}</td><td>-</td>
                           </tr>
                        ))}
                        {[...Array(Math.max(0, 2 - rows.length))].map((_, i) => (
                           <tr key={`e-${i}`} className="h-4 divide-x divide-black/20"><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                        ))}
                    </tbody>
                    <tfoot className="border-t-2 border-black/60 font-bold bg-gray-50 text-[7px]">
                       <tr className="divide-x divide-black/60">
                          <td colSpan={2}>Середні показники</td>
                          <td className="font-black underline">{rows.length > 0 ? avgMilk.toFixed(1) : ''}</td>
                          <td></td>
                          <td>{rows.length > 0 ? avgFat.toFixed(2) : ''}</td>
                          <td></td>
                          <td>{rows.length > 0 ? avgProt.toFixed(2) : ''}</td>
                          <td></td>
                       </tr>
                    </tfoot>
                </table>
            </div>
        );
    };

    const renderAncBlock = (p: string, symbol: string) => {
        const d = detailsMap[p] || {};
        return (
            <div className={`p-1.5 border-2 border-black/80 bg-white shadow-[2px_2px_0px_rgba(0,0,0,0.1)]`}>
                <div className="flex border-b-2 border-black font-black text-[10px] mb-1">
                    <span className="bg-black text-white w-10 text-center mr-2 py-0.5">{symbol}</span>
                    <span className="opacity-40 uppercase mr-2 text-[8px] self-center">Кличка</span>
                    <span className="self-center truncate uppercase tracking-tighter">{d.name || '-'}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 text-[7px] font-bold uppercase leading-tight">
                    <div className="flex justify-between border-b border-black/10 py-0.5"><span>ID ABG</span><span>{d.code_abg || '-'}</span></div>
                    <div className="flex justify-between border-b border-black/10 py-0.5"><span>Племкнига</span><span>{getStdb(d.studbook_alias)}</span></div>
                    <div className="flex justify-between border-b border-black/10 py-0.5"><span>д.н.</span><span>{d.date_born ? new Date(d.date_born).toLocaleDateString() : '-'}</span></div>
                    <div className="flex justify-between border-b border-black/10 py-0.5"><span>Оц.екс.,бал.:</span><span className="text-red-700">{d.test_score || '-'}</span></div>
                    <div className="flex justify-between border-b border-black/10 py-0.5"><span>Порода</span><span>{d.breed_name || '-'}</span></div>
                    <div className="flex justify-between border-b border-black/10 py-0.5"><span>Клас</span><span>{d.test_class || '-'}</span></div>
                    <div className="flex justify-between border-b border-black/10 py-0.5 col-span-2"><span>Власник</span><span className="ml-4 truncate">{d.owner || d.manuf || '-'}</span></div>
                </div>
                {renderLactTable(p, p.length > 1)}
            </div>
        );
    };

    const renderSmallAnc = (p: string, symbol: string) => {
        const d = detailsMap[p] || {};
        return (
            <div className="border border-black p-1 text-[6px] font-bold h-full">
                <div className="flex border-b border-black mb-1">
                   <span className="bg-black/5 min-w-[20px] text-center mr-1">{symbol}</span>
                   <span className="truncate italic">{d.name || '-'}</span>
                </div>
                <div className="space-y-0.5">
                   <div className="flex justify-between border-b border-black/5"><span>ID ABG</span><span>{d.code_abg}</span></div>
                   <div className="flex justify-between border-b border-black/5"><span>ID UA</span><span>{d.code_ua}</span></div>
                   <div className="flex justify-between border-b border-black/5"><span>Порода</span><span>{d.breed_name}</span></div>
                   <div className="flex justify-between border-b border-black/5"><span>Породн.</span><span>-</span></div>
                   <div className="flex justify-between border-b border-black/5"><span>Клас</span><span>{d.test_class}</span></div>
                   <div className="flex justify-between border-b border-black/5"><span>Прод.</span><span>-</span></div>
                   <div className="flex justify-between"><span>Прод.</span><span>-</span></div>
                </div>
            </div>
        );
    };

    return (
      <div className="min-h-screen bg-gray-100 p-8 font-sans text-black print:p-0">
        <div className="max-w-[1240px] mx-auto bg-white border-[3px] border-black p-4 print:border-none shadow-[20px_20px_0px_rgba(0,0,0,0.05)]">
           <header className="text-center mb-6 border-b-4 border-black pb-4 relative">
              <h1 className="text-2xl font-black uppercase tracking-widest italic drop-shadow-sm">ПЛЕМІННИЙ СЕРТИФІКАТ (Pedigree Summary)</h1>
              <div className="absolute right-0 top-0 text-[8px] opacity-40 font-black">REGISTRY OFFICIAL DOCUMENT</div>
           </header>

           {/* GENERATION 1: M & B */}
           <div className="grid grid-cols-2 gap-4 mb-4">
               {renderAncBlock('m', 'M')}
               {renderAncBlock('f', 'Б')}
           </div>

           {/* GENERATION 2: MM, BM, MB, BB */}
           <div className="grid grid-cols-4 gap-2 mb-4">
               {renderAncBlock('mm', 'ММ')}
               {renderAncBlock('fm', 'БМ')}
               {renderAncBlock('mf', 'МБ')}
               {renderAncBlock('ff', 'ББ')}
           </div>

           {/* GENERATION 3: SMALL BLOCKS (MMM etc.) */}
           <div className="grid grid-cols-8 gap-1 mb-8">
               {renderSmallAnc('mmm', 'МММ')}
               {renderSmallAnc('fmm', 'БММ')}
               {renderSmallAnc('mfm', 'МБМ')}
               {renderSmallAnc('ffm', 'ББМ')}
               {renderSmallAnc('mmf', 'ММБ')}
               {renderSmallAnc('fmf', 'БМБ')}
               {renderSmallAnc('mff', 'МББ')}
               {renderSmallAnc('fff', 'БББ')}
           </div>

           <footer className="mt-8 border-t-4 border-black pt-6 flex justify-between items-start italic font-bold text-[9px]">
               <div className="space-y-4">
                  <div className="flex gap-12">
                     <div>Recorded Correctly: <span className="border-b border-black/40 px-8 ml-2"></span></div>
                     <div>Date: <span className="font-black text-xs ml-2">{new Date().toLocaleDateString('uk-UA')}</span></div>
                  </div>
                  <p className="opacity-40 uppercase max-w-lg leading-tight">Цей сертифікат є офіційним документом, що підтверджує племінну цінність та походження тварини відповідно до вимог Асоціації.</p>
               </div>
               <div className="text-center mr-12">
                  <div className="font-black uppercase mb-1">Official Seal & Signature</div>
                  <div className="h-24 w-48 border-2 border-dashed border-black/20 rounded-2xl flex items-center justify-center opacity-10">
                     <span className="text-[6px] not-italic">ASSOCIATION REGISTERED STAMP</span>
                  </div>
               </div>
           </footer>
        </div>

        <div className="mt-12 text-center print:hidden flex justify-center gap-6">
            <PrintButton label="PRINT PEDIGREE CERTIFICATE 2" className="bg-[#491907] text-white px-10 py-3 rounded-xl font-black uppercase hover:bg-black transition-all shadow-xl" />
            <Link href={`/goats/${id}`} className="px-10 py-3 border-2 border-gray-200 rounded-xl font-black uppercase hover:bg-gray-50 transition-all text-sm">Back to Profile</Link>
        </div>
      </div>
    );
  }

  return notFound();
}
