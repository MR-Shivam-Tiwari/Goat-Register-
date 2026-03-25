import { query } from "@/lib/db";
import { getTranslation, Locale } from "@/lib/translations";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getGoatCertData(id: string) {
  const result = await query(
    `
      SELECT 
        A.name, A.sex, A.id AS id, A.id_mother, A.id_father,
        Di.date_born, Di.born_weight, Di.born_qty,
        Di.horns_type, Di.code_ua, Di.code_abg, Di.code_chip, Di.manuf, Di.owner,
        B.name as breed_name,
        S.name as studbook_name,
        T.score_total, T.class, T.category
      FROM animals A
      LEFT JOIN goats_data Di ON A.id = Di.id_goat
      LEFT JOIN breeds B      ON Di.id_breed = B.id
      LEFT JOIN stoodbook S   ON Di.id_stoodbook = S.id
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

export default async function CertificatePage({ 
  params 
}: { 
  params: { id: string, type: string } 
}) {
  const { id, type } = params;
  const goat = await getGoatCertData(id);
  if (!goat) notFound();

  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value || "ru") as Locale;
  const t = getTranslation(locale);

  if (type === "1") {
    const lactations = await getLactations(id);
    const selections = await getCertSelections(id);
    
    // Get IDs from selections for descending rows (id_i_row1..5)
    const selectIds = [1,2,3,4,5].map(i => selections[`id_i_row${i}`]).filter(v => v);
    const selectedLacts = await getAncestorLactations(selectIds);

    return (
      <div className="min-h-screen bg-white p-10 font-sans text-black">
        <div className="max-w-[1000px] mx-auto border-2 border-black p-8">
           <header className="text-center mb-10 border-b-2 border-black pb-4 uppercase">
              <h1 className="text-2xl font-black">
                 {goat.studbook_name === 'tg' ? 'ПЛЕМІННИЙ СЕРТИФІКАТ' : 'СЕРТИФІКАТ ВІДПОВІДНОСТІ'}
              </h1>
           </header>

           <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[11px] mb-10">
              <div className="flex border-b border-black/10 py-1">
                 <span className="w-40 font-bold uppercase">Goat Name:</span>
                 <span>{goat.name}</span>
              </div>
              <div className="flex border-b border-black/10 py-1">
                 <span className="w-40 font-bold uppercase">Breed:</span>
                 <span>{goat.breed_name}</span>
              </div>
              <div className="flex border-b border-black/10 py-1">
                 <span className="w-40 font-bold uppercase">DOB:</span>
                 <span>{goat.date_born ? new Date(goat.date_born).toLocaleDateString() : '-'}</span>
              </div>
              <div className="flex border-b border-black/10 py-1">
                 <span className="w-40 font-bold uppercase">Sex:</span>
                 <span>{goat.sex === 1 ? 'Male' : 'Female'}</span>
              </div>
              <div className="flex border-b border-black/10 py-1">
                 <span className="w-40 font-bold uppercase">ID ABG:</span>
                 <span>{goat.code_abg || '-'}</span>
              </div>
              <div className="flex border-b border-black/10 py-1">
                 <span className="w-40 font-bold uppercase">ID UA:</span>
                 <span>{goat.code_ua || '-'}</span>
              </div>
           </div>

           {/* PRODUCTIVITY OWN */}
           <div className="mb-10">
              <h2 className="text-sm font-black uppercase mb-2">Own Productivity:</h2>
              <table className="w-full border-collapse text-[10px] text-center border border-black">
                 <thead className="bg-gray-100 uppercase border-b border-black">
                    <tr className="divide-x divide-black">
                       <th className="p-1">No</th>
                       <th className="p-1">Days</th>
                       <th className="p-1">Milk (kg)</th>
                       <th className="p-1">Fat %</th>
                       <th className="p-1">Protein %</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-black/20">
                    {lactations.map((l: any, i: number) => (
                       <tr key={i} className="divide-x divide-black/20">
                          <td className="p-1">{l.lact_no}</td>
                          <td className="p-1">{l.lact_days}</td>
                          <td className="p-1 font-bold">{l.milk}</td>
                          <td className="p-1">{l.fat}</td>
                          <td className="p-1">{l.protein}</td>
                       </tr>
                    ))}
                    {lactations.length === 0 && <tr><td colSpan={5} className="p-4 opacity-30 italic">No records</td></tr>}
                 </tbody>
              </table>
           </div>

           {/* DESCENDANTS / ANCESTORS SUMMARY from SELECTIONS */}
           <div>
              <h2 className="text-sm font-black uppercase mb-2">Offspring / Ancestors:</h2>
              <table className="w-full border-collapse text-[10px] text-center border border-black">
                 <thead className="bg-gray-100 uppercase border-b border-black">
                    <tr className="divide-x divide-black">
                       <th className="p-1">Days</th>
                       <th className="p-1">Milk (kg)</th>
                       <th className="p-1">Fat %</th>
                       <th className="p-1">Protein %</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-black/20">
                    {selectedLacts.map((l: any, i: number) => (
                       <tr key={i} className="divide-x divide-black/20">
                          <td className="p-1">{l.lact_days}</td>
                          <td className="p-1 font-bold">{l.milk}</td>
                          <td className="p-1">{l.fat}</td>
                          <td className="p-1">{l.protein}</td>
                       </tr>
                    ))}
                    {selectedLacts.length === 0 && <tr><td colSpan={4} className="p-4 opacity-30 italic">No selections</td></tr>}
                 </tbody>
              </table>
           </div>

           <footer className="mt-20 flex justify-between items-end border-t border-black pt-4">
              <div className="text-[10px] opacity-60">Generated: {new Date().toLocaleDateString()}</div>
              <div className="text-center font-bold">
                 Official Stamp & Signature
                 <div className="h-20 w-40 border-b border-black/20 mt-2 mx-auto"></div>
              </div>
           </footer>
        </div>
        <div className="mt-8 text-center print:hidden">
           <button onClick={() => window.print()} className="bg-black text-white px-8 py-2 rounded-lg font-bold hover:bg-gray-800">PRINT CERTIFICATE</button>
           <Link href={`/goats/${id}`} className="ml-4 text-blue-600 hover:underline">Back to Profile</Link>
        </div>
      </div>
    );
  }

  if (type === "2") {
    const selections = await getCertSelections(id);
    const prefixes = ['m','f','mm','fm','mf','ff','mmm','fmm','mfm','ffm','mmf','fmf','mff','fff'];
    
    // Fetch all ancestor IDs first
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
        SELECT id, name, path FROM ancestry WHERE path != ''
    `, [id]);

    const ancestorMap: any = {};
    treeRes.rows.forEach((r: any) => ancestorMap[r.path] = r);

    // Get all lactation IDs to fetch in one go
    const allLactIds: number[] = [];
    prefixes.forEach(p => {
        for(let j=1; j<=3; j++) {
            const lid = selections[`id_${p}_row${j}`];
            if(lid) allLactIds.push(lid);
        }
    });

    const lacts = await getAncestorLactations(allLactIds);
    const lactMap: any = {};
    lacts.forEach((l: any) => lactMap[l.id] = l);

    return (
      <div className="min-h-screen bg-white p-6 font-sans text-black">
        <div className="max-w-[1200px] mx-auto border border-black p-4">
           <header className="text-center mb-6 uppercase">
              <h1 className="text-xl font-black underline">ПЛЕМІННИЙ СЕРТИФІКАТ (Pedigree)</h1>
           </header>

           {/* GOAT INFO GRID */}
           <div className="grid grid-cols-4 border border-black text-[9px] mb-6">
              {[
                { l: 'Goat Name', v: goat.name },
                { l: 'Breed', v: goat.breed_name },
                { l: 'Sex', v: goat.sex === 1 ? 'Male' : 'Female' },
                { l: 'ID ABG', v: goat.code_abg },
                { l: 'ID UA', v: goat.code_ua },
                { l: 'DOB', v: goat.date_born ? new Date(goat.date_born).toLocaleDateString() : '-' },
                { l: 'Mother', v: goat.id_mother },
                { l: 'Father', v: goat.id_father }
              ].map((item, i) => (
                <div key={i} className="border-r border-b border-black p-1 flex justify-between">
                   <span className="font-bold uppercase opacity-60">{item.l}:</span>
                   <span className="font-bold">{item.v || '-'}</span>
                </div>
              ))}
           </div>

           {/* ANCESTRY TABLES */}
           <div className="space-y-4">
              <h2 className="text-xs font-black uppercase text-center border-y border-black py-1">Ancestral Performance</h2>
              <div className="grid grid-cols-2 gap-4">
                 {prefixes.map((p) => {
                    const anc = ancestorMap[p];
                    if(!anc) return null;
                    const rows = [1,2,3].map(j => lactMap[selections[`id_${p}_row${j}`]]).filter(v => v);
                    
                    return (
                        <div key={p} className="border border-black">
                           <div className="bg-gray-50 p-1 text-[9px] font-black uppercase border-b border-black flex justify-between">
                              <span>{p.toUpperCase()}: {anc.name}</span>
                           </div>
                           <table className="w-full text-[8px] text-center border-collapse">
                              <thead className="border-b border-black">
                                 <tr className="divide-x divide-black opacity-60">
                                    <th>Lact</th>
                                    <th>Days</th>
                                    <th>Milk</th>
                                    <th>Fat%</th>
                                    <th>Prot%</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-black/20">
                                 {rows.length > 0 ? rows.map((r, idx) => (
                                    <tr key={idx} className="divide-x divide-black/10">
                                       <td>{r.lact_no}</td>
                                       <td>{r.lact_days}</td>
                                       <td className="font-black">{r.milk}</td>
                                       <td>{r.fat}</td>
                                       <td>{r.protein}</td>
                                    </tr>
                                 )) : (
                                    <tr><td colSpan={5} className="py-2 opacity-20 italic">No data selected</td></tr>
                                 )}
                              </tbody>
                           </table>
                        </div>
                    );
                 })}
              </div>
           </div>
        </div>
        <div className="mt-8 text-center print:hidden">
            <button 
                onClick={() => window.print()} 
                className="bg-[#491907] text-white px-8 py-2 rounded-lg font-bold hover:bg-black transition-all"
            >
                PRINT PEDIGREE CERTIFICATE
            </button>
            <Link href={`/goats/${id}`} className="ml-4 text-blue-600 hover:underline">Back to Profile</Link>
        </div>
      </div>
    );
  }

  return notFound();
}
