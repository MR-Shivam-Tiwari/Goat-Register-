import { query } from "@/lib/db";
import { 
  getGoatData, 
  getOffspringDetailed,
  getGallery, 
  getAncestors, 
  getOwnMilkProductivity, 
  getExpertAssessment, 
  getCertData, 
  getAncestorLactations 
} from "@/lib/goats-data";
import { getTranslation, Locale } from "@/lib/translations";
import { cookies } from "next/headers";
import PedigreeNode from "@/components/PedigreeNode";
import ClassicGoatTable from "@/components/ClassicGoatTable";
import Breadcrumbs from "@/components/Breadcrumbs";

export const dynamic = "force-dynamic";

export default async function GuestGoatPage({
  params: paramsPromise,
}: {
  params: Promise<{ code: string }>;
}) {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("nxt-lang")?.value as Locale) || "ru";
  const t = getTranslation(lang);

  const { code } = await paramsPromise;

  const now = Math.floor(Date.now() / 1000);
  const inviteRes = await query(
    "SELECT id_animal, gens, valid_to FROM invites WHERE code = $1",
    [code]
  );
  
  const invite = inviteRes.rows[0];
  if (!invite || invite.valid_to < now) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F0F4F0] p-10">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔒</div>
          <h1 className="text-4xl font-black text-red-600 uppercase tracking-tighter">
            {t.guest.expiredTitle}
          </h1>
          <p className="text-[#491907]/60 font-bold uppercase text-[10px] tracking-widest">
            {t.guest.expiredDesc}
          </p>
        </div>
      </div>
    );
  }

  const id = invite.id_animal.toString();
  const maxGens = invite.gens || 2;

  const goat = await getGoatData(id);
  if (!goat) return (
    <div className="p-40 text-center uppercase font-black text-2xl text-gray-400">
      {t.guest.notFound}
    </div>
  );

  const [
    descendants,
    gallery,
    ancestry,
    ownMilk,
    expertTests,
    certData,
    ancestorLacts,
  ] = await Promise.all([
    getOffspringDetailed(id),
    getGallery(id),
    getAncestors(parseInt(id), maxGens),
    getOwnMilkProductivity(id),
    getExpertAssessment(id),
    getCertData(id),
    getAncestorLactations(id, maxGens),
  ]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-sans tracking-tight">
      <div className="max-w-8xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
        <Breadcrumbs
          isGuest
          items={[
            { label: t.guest.accessLabel },
            { label: goat.name },
          ]}
        />

        {/* HEADER SECTION */}
        <div className="bg-white rounded-lg shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-[#491907] to-[#713117]">
             <div className="absolute top-4 right-4 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-[7px] font-black text-white/70 uppercase tracking-[0.2em] border border-white/10">
                {t.guest.expiresLabel} {new Date(invite.valid_to * 1000).toLocaleString()}
             </div>
            <div className="absolute -bottom-1 left-8 flex items-end gap-6">
              <div className="w-24 h-24 bg-white rounded-xl shadow-lg border-4 border-white overflow-hidden">
                {goat.ava ? (
                  <img src={goat.ava} className="w-full h-full object-cover" alt={goat.name} />
                ) : (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300 font-black text-2xl lowercase">
                    {goat.name[0]}
                  </div>
                )}
              </div>
              <div className="pb-2">
                <h1 className="text-3xl font-black text-white drop-shadow-sm tracking-tight">
                  {goat.name}
                </h1>
                <p className="text-white/80 font-bold text-[10px] uppercase tracking-[0.2em]">
                  {goat.breed_name} • {goat.sex === 1 ? t.goats.male : t.goats.female}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-14 pb-8 px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex gap-8 items-center text-[10px] font-black uppercase">
               <div className="flex flex-col gap-0.5">
                  <span className="text-gray-400 font-bold text-[8px] tracking-widest">{t.goats.registryCode}</span>
                  <span className="text-[#491907] font-black text-xs">{goat.code_ua || goat.id}</span>
               </div>
            </div>
            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
               {t.guest.verifiedBadge}
            </div>
          </div>
        </div>

        {/* BASIC INFO */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-[#491907] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.basicInfo}
            </h3>
          </div>
          <div className="p-0 overflow-hidden">
            <ClassicGoatTable goats={[goat]} t={t} isMain isGuest />
          </div>
        </section>

        {/* GALLERY */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-[#491907] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.gallery}
            </h2>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              {gallery.length > 0 ? (
                gallery.map((p: any, idx: number) => (
                  <div key={idx} className="w-32 aspect-[4/3] bg-white border border-gray-100 p-1 rounded-xl shadow-sm overflow-hidden group">
                    <img src={`/img/${p.file}`} className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ))
              ) : (
                <div className="w-full py-12 flex items-center justify-center opacity-40 text-xs uppercase tracking-widest">
                   {t.guest.noPhotos}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* PEDIGREE */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-[#491907] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.pedigree}: {goat.name} ({maxGens} gens)
            </h2>
          </div>
          <div className="p-6 md:p-10">
            <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
               <PedigreeChart ancestry={ancestry} maxGens={maxGens} t={t} />
            </div>
          </div>
        </section>

        {/* OFFSPRING & DESCENDANTS */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-[#491907] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.offspring}:
            </h2>
          </div>
          <div className="p-6 space-y-8">
            <div className="overflow-x-auto rounded-lg border border-gray-100 shadow-sm">
              <table className="w-full text-center text-[9px] border-collapse font-black uppercase whitespace-nowrap">
                <thead className="bg-[#00FF00] border-b border-gray-100 text-[#491907]">
                  <tr className="divide-x divide-gray-100">
                    <th className="p-3">{t.goats.sons}</th>
                    <th className="p-3">{t.goats.daughters}</th>
                    <th className="p-3">{t.goats.grandsons}</th>
                    <th className="p-3">{t.goats.granddaughters}</th>
                    <th className="p-3">{t.goats.grgrandsons}</th>
                    <th className="p-3">{t.goats.grgranddaughters}</th>
                    <th className="p-3">{t.goats.grgrgrandsons}</th>
                    <th className="p-3">{t.goats.grgrgranddaughters}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-x divide-gray-100">
                  <tr className="divide-x divide-gray-100">
                    <td className="p-3 min-h-[40px]">
                      <div className="flex flex-col gap-1">
                        {descendants.filter(d => d.sex === 1).length > 0 ? descendants.filter(d => d.sex === 1).map(d => (
                          <span key={d.id} className="text-[#491907] font-bold">
                            {d.nickname || d.name}
                          </span>
                        )) : <span className="opacity-20">-</span>}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        {descendants.filter(d => d.sex === 0).length > 0 ? descendants.filter(d => d.sex === 0).map(d => (
                          <span key={d.id} className="text-[#491907] font-bold">
                            {d.nickname || d.name}
                          </span>
                        )) : <span className="opacity-20">-</span>}
                      </div>
                    </td>
                    <td className="p-3 opacity-20">-</td>
                    <td className="p-3 opacity-20">-</td>
                    <td className="p-3 opacity-20">-</td>
                    <td className="p-3 opacity-20">-</td>
                    <td className="p-3 opacity-20">-</td>
                    <td className="p-3 opacity-20">-</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-0">
              <h3 className="text-[#491907] text-[10px] font-black uppercase tracking-widest bg-[#00FF00] px-4 py-2 border border-gray-100 border-b-0 w-fit">
                {t.goats.directDescendantsTitle}
              </h3>
              <div className="border border-gray-100 shadow-sm overflow-hidden bg-white">
                <ClassicGoatTable goats={descendants} t={t} isGuest />
              </div>
            </div>
          </div>
        </section>

        {/* LACTATION DATA */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-[#491907] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.lactDataTitle}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-center text-[9px] border-collapse font-black uppercase whitespace-nowrap">
              <thead className="bg-[#00FF00] border-b border-gray-100 text-[#491907]">
                <tr className="divide-x divide-green-200">
                  <th className="p-3 text-start">{t.guest.descendantAncestor}</th>
                  <th className="p-3">{t.goats.lactNo}</th>
                  <th className="p-3">{t.goats.lactDays}</th>
                  <th className="p-3">{t.goats.lactMilk}</th>
                  <th className="p-3">{t.goats.lactFat}</th>
                  <th className="p-3">{t.goats.lactProtein}</th>
                  <th className="p-3">{t.guest.avgYield}</th>
                  <th className="p-3">{t.goats.lactGraph}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.entries(ancestorLacts).map(([path, node]: [string, any]) => 
                  node.lactations.map((l: any, i: number) => {
                    const level = path.length - 2;
                    const label = path === 'ME' ? 'ME' : `Pr: (${level})`;
                    return (
                      <tr key={`${path}-${i}`} className="divide-x divide-gray-100 hover:bg-green-50 transition-colors">
                        <td className="p-2 px-4 text-start font-black text-[#491907] bg-green-50/30">
                           <span className="text-[#491907]/60 mr-2">{label}</span> {node.name}
                        </td>
                        <td className="p-2">{l.lact_no}</td>
                        <td className="p-2">{l.lact_days}</td>
                        <td className="p-2 text-emerald-700 font-bold">{l.milk}</td>
                        <td className="p-2">{l.fat}</td>
                        <td className="p-2">{l.protein}</td>
                        <td className="p-2">{l.avg_yield || "-"}</td>
                        <td className="p-2">{l.have_graph ? 'YES' : '-'}</td>
                      </tr>
                    );
                  })
                )}
                {Object.keys(ancestorLacts).length === 0 && (
                   <tr>
                     <td colSpan={8} className="py-20 text-gray-300 flex items-center justify-center gap-2">
                       {t.catalog.empty}
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* OWN MILK */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[#491907] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.ownProductivityTitle}:
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-center text-[9px] border-collapse font-black uppercase whitespace-nowrap">
              <thead className="bg-[#00FF00] border-b border-gray-100 text-[#491907]">
                <tr className="divide-x divide-green-200">
                  <th className="p-3">№</th>
                  <th className="p-3">{t.goats.lactNo}</th>
                  <th className="p-3">{t.goats.lactDays}</th>
                  <th className="p-3">{t.goats.lactMilk}</th>
                  <th className="p-3">{t.goats.lactFat}</th>
                  <th className="p-3">{t.goats.lactProtein}</th>
                  <th className="p-3">{t.goats.lactose}</th>
                  <th className="p-3">{t.goats.peakMilk}</th>
                  <th className="p-3">{t.goats.lactMilkDay}</th>
                  <th className="p-3">{t.goats.density}</th>
                  <th className="p-3">{t.goats.flowRate}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ownMilk.map((m: any, idx: number) => (
                  <tr key={idx} className="divide-x divide-gray-100 hover:bg-emerald-50/10 transition-colors">
                    <td className="p-3 text-gray-400">{idx + 1}</td>
                    <td className="p-3">{m.lact_no}</td>
                    <td className="p-3">{m.lact_days}</td>
                    <td className="p-3 text-emerald-700 text-[11px] scale-105">{m.milk}</td>
                    <td className="p-3">{m.fat}</td>
                    <td className="p-3">{m.protein}</td>
                    <td className="p-3">{m.lactose || "-"}</td>
                    <td className="p-3">{m.peak_yield || "-"}</td>
                    <td className="p-3">{m.avg_yield || "-"}</td>
                    <td className="p-3">{m.density || "-"}</td>
                    <td className="p-3">{m.flow_rate || "-"}</td>
                  </tr>
                ))}
                {ownMilk.length === 0 && (
                  <tr>
                    <td colSpan={11} className="py-20 text-gray-300 flex items-center justify-center gap-2">
                      <span className="text-xl">🥛</span>
                      {t.catalog.empty}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* EXPERT ASSESSMENT */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-[#491907] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.expertAssessment}:
            </h2>
          </div>
          <div className="overflow-x-auto">
            {expertTests.length > 0 ? (
              <table className="w-full text-[9px] border-collapse text-center uppercase font-black whitespace-nowrap">
                <thead className="bg-[#00FF00] border-b border-gray-100 text-[#491907]">
                  <tr className="divide-x divide-green-200">
                    <th className="p-3">{t.goats.breeder}</th>
                    <th className="p-3">{t.goats.added}</th>
                    <th className="p-3">{t.goats.certType}</th>
                    <th className="p-3">{t.goats.certHeightWithers}</th>
                    <th className="p-3">{t.goats.certHeightSacrum}</th>
                    <th className="p-3">{t.goats.certChestCirc}</th>
                    <th className="p-3">{t.goats.certBodyLength}</th>
                    <th className="p-3">{t.guest.weightKg}</th>
                    <th className="p-3">{t.goats.certFinalScore}</th>
                    <th className="p-3">{t.goats.certClass}</th>
                    <th className="p-3">{t.goats.certCategory}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {expertTests.map((test: any, i: number) => {
                      const get = (key: string) => {
                        const val = test[key] ?? test[key.charAt(0).toUpperCase() + key.slice(1)];
                        return (val !== null && val !== undefined && val !== "") ? val : "-";
                      };
                      return (
                        <tr key={i} className="divide-x divide-gray-100 hover:bg-blue-50/10 transition-colors">
                          <td className="p-3 truncate max-w-[150px] font-bold">{get('who_expert')}</td>
                          <td className="p-3 text-gray-400">
                            {test.date_test || test.Date_test ? new Date(test.date_test || test.Date_test).toLocaleDateString() : "-"}
                          </td>
                          <td className="p-3 opacity-60">
                            {test.test_type === 1 || test.Test_type === 1 ? t.goats.classical : t.goats.young}
                          </td>
                          <td className="p-3">{get('par_1')}</td>
                          <td className="p-3">{get('par_2')}</td>
                          <td className="p-3">{get('par_3')}</td>
                          <td className="p-3">{get('par_4')}</td>
                          <td className="p-3">{get('weight')}</td>
                          <td className="p-3 text-red-600 font-black">{get('score_total')}</td>
                          <td className="p-3"><span className="px-2 py-0.5 bg-gray-100 rounded-lg">{get('class')}</span></td>
                          <td className="p-3">{get('category')}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            ) : (
              <div className="py-20 text-gray-300 flex flex-col items-center justify-center gap-1 uppercase tracking-widest text-[10px]">
                 📋 {t.catalog.empty}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function PedigreeChart({ ancestry, maxGens, t }: { ancestry: any, maxGens: number, t: any }) {
  if (!ancestry) return null;
  return (
    <div className="flex flex-col w-full text-[9px] uppercase font-black bg-white">
      <div className="bg-[#491907] flex h-8 items-center border-b border-white/10 px-4">
         <span className="text-white/40 text-[7px] tracking-widest font-black uppercase">
           {t.guest.verifiedPedigree} ({maxGens} {t.goats.generations})
         </span>
      </div>
      <div className="flex divide-x divide-gray-400">
        {/* Tier 1 */}
        <div className="flex-1 flex-col flex">
          <PedigreeNode node={ancestry.father} prefix="O:" color="bg-[#C5E0B4]" border isGuest t={t} />
          <PedigreeNode node={ancestry.mother} prefix="M:" color="bg-[#F8CBAD]" isGuest t={t} />
        </div>

        {/* Tier 2 */}
        {maxGens >= 2 && (
          <div className="flex-1 flex flex-col">
            {[ancestry.father, ancestry.mother].map((p, i) => (
              <div key={i} className="flex-1 flex flex-col border-b last:border-0 border-gray-400">
                <PedigreeNode node={p?.father} prefix="O:" color="bg-[#E2F0D9]" border isGuest t={t} />
                <PedigreeNode node={p?.mother} prefix="M:" color="bg-[#F6B8EB]/50" isGuest t={t} />
              </div>
            ))}
          </div>
        )}

        {/* Tier 3 */}
        {maxGens >= 3 && (
          <div className="flex-1 flex flex-col">
            {[ancestry.father, ancestry.mother].map((p, i) =>
              [p?.father, p?.mother].map((gp, j) => (
                <div key={`${i}-${j}`} className="flex-1 flex flex-col border-b last:border-0 border-gray-400">
                  <PedigreeNode node={gp?.father} prefix="O:" color="bg-[#E2F0D9]/40" border isGuest t={t} />
                  <PedigreeNode node={gp?.mother} prefix="M:" color="bg-[#F6B8EB]/30" isGuest t={t} />
                </div>
              ))
            )}
          </div>
        )}

        {/* Tier 4 */}
        {maxGens >= 4 && (
          <div className="flex-1 flex flex-col">
            {[ancestry.father, ancestry.mother].map((p, i) =>
              [p?.father, p?.mother].map((gp, j) =>
                [gp?.father, gp?.mother].map((ggp, k) => (
                  <div key={`${i}-${j}-${k}`} className="flex-1 flex flex-col border-b last:border-0 border-gray-300">
                    <PedigreeNode node={ggp?.father} prefix="O:" color="bg-gray-100" border isGuest t={t} />
                    <PedigreeNode node={ggp?.mother} prefix="M:" color="bg-gray-50" isGuest t={t} />
                  </div>
                ))
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
