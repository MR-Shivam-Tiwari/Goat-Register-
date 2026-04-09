import { query } from "@/lib/db";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { cookies } from "next/headers";
import { getTranslation, Locale } from "@/lib/translations";
import { getSessionUser } from "@/lib/access-control";
import { redirect } from "next/navigation";
import GoatTable from "@/components/GoatTable";
import InviteSection from "@/components/InviteSection";
import PedigreeNode from "@/components/PedigreeNode";
import AddPhotoGallery from "@/components/AddPhotoGallery";
import GalleryItem from "@/components/GalleryItem";

import { 
  getGoatData, 
  getOffspringDetailed, 
  getGallery, 
  getLactation, 
  getAncestors, 
  getOwnMilkProductivity, 
  getExpertAssessment, 
  getCertData, 
  getAncestorLactations 
} from "@/lib/goats-data";

export const dynamic = "force-dynamic";

export default async function GoatDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  const cookieStore = await cookies();
  const lang = (cookieStore.get("nxt-lang")?.value as Locale) || "ru";
  const t = getTranslation(lang);

  const goat = await getGoatData(id);
  const user = await getSessionUser();

  if (!goat)
    return (
      <div className="p-40 text-center text-4xl font-black text-primary uppercase bg-[#F0F4F0] min-h-screen">
        {t.goats.animalNotFound}
      </div>
    );

  // ACCESS CONTROL: Allow Admin (role >= 10) or Owner (by id_user)
  const isOwner = user && (
    user.role >= 10 || 
    user.id === goat.id_user
  );

  if (!isOwner) {
    redirect('/goats');
  }

  const [
    descendants,
    gallery,
    lactation,
    ancestry,
    ownMilk,
    expertTests,
    certData,
    ancestorLacts,
  ] = await Promise.all([
    getOffspringDetailed(id),
    getGallery(id),
    getLactation(id),
    getAncestors(parseInt(id)),
    getOwnMilkProductivity(id),
    getExpertAssessment(id),
    getCertData(id),
    getAncestorLactations(id),
  ]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-sans tracking-tight">
      <div className="max-w-8xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Breadcrumbs
          items={[
            { label: t.nav.registry, href: "/goats" },
            { label: goat.name },
          ]}
        />

        {/* HEADER SECTION - PREMIUM CARD */}
        <div className="bg-white rounded-lg shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-[#491907] to-[#713117]">
            <div className="absolute -bottom-1 left-8 flex items-end gap-6">
              <div className="w-24 h-24 bg-white rounded-xl shadow-lg border-4 border-white overflow-hidden">
                {goat.ava ? (
                  <img 
                    src={goat.ava.startsWith('http') || goat.ava.startsWith('/') ? goat.ava : `/uploads/${goat.ava}`} 
                    className="w-full h-full object-cover" 
                    alt={goat.name} 
                  />
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
                  {(goat.is_abg ? 'R' : 'X') + goat.id} • {goat.breed_name} • {goat.sex === 1 ? t.goats.male : t.goats.female}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-14 pb-8 px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex gap-8 items-center text-sm font-black uppercase">
               <div className="flex flex-col gap-0.5">
                   <span className="text-gray-400 font-bold text-sm tracking-widest">{t.goats.registryCode}</span>
                   <span className="text-[#491907] font-black text-xs">{(goat.is_abg ? 'R' : 'X') + goat.id}</span>
               </div>
                {goat.f_id && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400 font-bold text-sm tracking-widest">{t.goats.fatherData}</span>
                    <a href={`/goats/${goat.f_id}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 font-bold text-xs hover:text-blue-900 underline decoration-blue-200">
                      {goat.f_name} (ID: {goat.f_id})
                    </a>
                  </div>
                )}
                {goat.m_id && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400 font-bold text-sm tracking-widest">{t.goats.motherData}</span>
                    <a href={`/goats/${goat.m_id}`} target="_blank" rel="noopener noreferrer" className="text-pink-600 font-bold text-xs hover:text-pink-800 underline decoration-pink-200">
                      {goat.m_name} (ID: {goat.m_id})
                    </a>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* BASIC INFO TABLE SECTION */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-[#491907] text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.basicInfo}
            </h3>
          </div>
          <div className="p-0 overflow-hidden">
            <GoatTable goats={[goat]} t={t} isMain currentUser={user} />
          </div>
        </section>

        {/* GALLERY SECTION */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[#491907] text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.gallery}
            </h2>
            <AddPhotoGallery goatId={id} t={t} />
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              {gallery.length > 0 ? (
                gallery.map((p: any, idx: number) => (
                  <GalleryItem key={p.id || idx} file={p.file} goatId={id} t={t} />
                ))
              ) : (
                <div className="w-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl">
                   <span className="text-[10px] italic opacity-40 uppercase tracking-widest">
                     {t.goats.noPhotos}
                   </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* PEDIGREE SECTION */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-[#491907] text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.pedigree}: {goat.name}
            </h2>
          </div>
          <div className="p-3 md:p-5">
            <div className="rounded-lg border border-gray-200 shadow-xl shadow-gray-100/50 overflow-hidden ring-1 ring-black/5">
              <PedigreeChart ancestry={ancestry} t={t} />
            </div>
          </div>
        </section>

        {/* OFFSPRING & DESCENDANTS */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[#491907] text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.offspring}
            </h2>
          </div>
          <div className="p-6 space-y-8">
            <div className="overflow-x-auto rounded-lg border border-gray-100 shadow-sm">
              <table className="w-full text-center text-sm border-collapse font-black uppercase whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-100 text-[#491907]">
                  <tr className="divide-x bg-red-200 divide-gray-100">
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
                  <tr>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        {descendants.filter(d => d.sex === 1).length > 0 ? descendants.filter(d => d.sex === 1).map(d => (
                          <Link key={d.id} href={`/goats/${d.id}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                            {d.nickname || d.name}
                          </Link>
                        )) : <span className="opacity-20">-</span>}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        {descendants.filter(d => d.sex === 0).length > 0 ? descendants.filter(d => d.sex === 0).map(d => (
                          <Link key={d.id} href={`/goats/${d.id}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                            {d.nickname || d.name}
                          </Link>
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

            <div className="space-y-2">
              <h3 className="text-[#491907] text-sm font-black uppercase tracking-widest opacity-60">
                {t.goats.directDescendantsTitle}
              </h3>
              <div className="rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <GoatTable goats={descendants} t={t} currentUser={user} />
              </div>
            </div>
          </div>
        </section>

        {/* OWN MILK PRODUCTIVITY */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[#491907] text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.ownProductivityTitle}
            </h2>
            <Link
              href={`/goats/${goat.id}/milk`}
              className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-black transition-all shadow-sm"
            >
              {t.goats.add} {t.goats.recordShort}
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-center text-sm border-collapse font-black uppercase whitespace-nowrap">
              <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100/50 text-emerald-800">
                <tr className="divide-x divide-emerald-100">
                  <th className="p-3">№</th>
                  <th className="p-3">{t.goats.lactNo}</th>
                  <th className="p-3">{t.goats.lactDays}</th>
                  <th className="p-3">{t.goats.lactMilk}</th>
                  <th className="p-3">{t.goats.lactFat}</th>
                  <th className="p-3">{t.goats.lactProtein}</th>
                  <th className="p-3">{t.goats.lactose}</th>
                  <th className="p-3">{t.goats.peakMilk}</th>
                  <th className="p-3">{t.goats.density}</th>
                  <th className="p-3">{t.goats.flowRate}</th>
                  <th className="p-3">{t.goats.lactGraph}</th>
                  <th className="p-3">{t.goats.source}</th>
                  <th className="p-3">{t.goats.editShort}</th>
                  <th className="p-3">{t.goats.added}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ownMilk.map((m: any, idx: number) => (
                  <tr
                    key={idx}
                    className="divide-x divide-gray-100 hover:bg-emerald-50/20 transition-colors"
                  >
                    <td className="p-3 text-gray-400">{idx + 1}</td>
                    <td className="p-3">{m.lact_no}</td>
                    <td className="p-3">{m.lact_days}</td>
                    <td className="p-3 text-emerald-700 text-[11px] scale-110">{m.milk}</td>
                    <td className="p-3">{m.fat}</td>
                    <td className="p-3">{m.protein}</td>
                    <td className="p-3">{m.lactose || "-"}</td>
                    <td className="p-3">{m.peak_yield || "-"}</td>
                    <td className="p-3">{m.density || "-"}</td>
                    <td className="p-3">{m.flow_rate || "-"}</td>
                    <td className="p-3">
                        {m.have_graph ? (
                           <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-sm">{t.goats.yesBig}</span>
                        ) : "-"}
                    </td>
                    <td className="p-3 truncate max-w-[120px] opacity-60">
                      {m.source || "-"}
                    </td>
                    <td className="p-3">
                        <Link
                          href={`/goats/${goat.id}/milk?row=${m.id}`}
                          className="text-blue-600 hover:text-blue-900 font-bold italic"
                        >
                          {t.goats.editShort}
                        </Link>
                    </td>
                    <td className="p-3 text-gray-400">
                      {m.added ? new Date(m.added).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))}
                {ownMilk.length === 0 && (
                  <tr>
                    <td colSpan={15} className="py-20 text-gray-300 italic flex items-center justify-center gap-2">
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
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[#491907] text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.expertAssessment}
            </h2>
            {(goat.cert_no || goat.cert_serial || certData.id) ? (
              <div className="flex items-center gap-4">
                <Link
                  href={`/goats/${goat.id}/assessment`}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-black transition-all shadow-sm"
                >
                  {expertTests.length > 0 ? t.goats.editShort : t.goats.add} {t.goats.expertAssessment.replace(':', '')}
                </Link>
                <div className="h-6 w-[1px] bg-gray-200"></div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#491907]/50">
                   <a href={`/goats/${goat.id}/certificate/1`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">{t.goats.cert1}</a>
                   <span className="opacity-30">|</span>
                   <a href={`/goats/${goat.id}/certificate/2`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">{t.goats.cert2}</a>
                </div>
              </div>
            ) : (
              <div className="text-[10px] font-black uppercase text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 border-dashed">
                {t.goats.certNo || 'Certificate'} {t.goats.certRequired}
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            {expertTests.length > 0 ? (
              <table className="w-full text-sm border-collapse text-center uppercase font-black whitespace-nowrap">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 text-blue-800">
                  <tr className="divide-x divide-blue-100">
                    <th className="p-3">{t.goats.breeder}</th>
                    <th className="p-3">{t.goats.added}</th>
                    <th className="p-3">{t.goats.certType}</th>
                    <th className="p-3">{t.goats.certHeightWithers}</th>
                    <th className="p-3">{t.goats.certHeightSacrum}</th>
                    <th className="p-3">{t.goats.certChestCirc}</th>
                    <th className="p-3">{t.goats.certBodyLength}</th>
                    <th className="p-3">{t.goats.weightKg}</th>
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
                        <tr
                          key={i}
                          className="divide-x divide-gray-100 hover:bg-blue-50/20 transition-colors"
                        >
                          <td className="p-3 truncate max-w-[150px] font-bold">
                            {get('who_expert')}
                          </td>
                          <td className="p-3 text-gray-400">
                            {test.date_test || test.Date_test
                              ? new Date(test.date_test || test.Date_test).toLocaleDateString()
                              : "-"}
                          </td>
                           <td className="p-3 opacity-60">
                            { (test.test_type === 1 || test.Test_type === 1) ? t.goats.classical : t.goats.young }
                          </td>
                          <td className="p-3">{get('par_1')}</td>
                          <td className="p-3">{get('par_2')}</td>
                          <td className="p-3">{get('par_3')}</td>
                          <td className="p-3">{get('par_4')}</td>
                          <td className="p-3">{get('weight')}</td>
                          <td className="p-3 text-red-600 text-[11px] scale-105">
                            {get('score_total')}
                          </td>
                          <td className="p-3">
                             <span className="px-2 py-0.5 bg-gray-100 rounded-lg">{get('class')}</span>
                          </td>
                          <td className="p-3">{get('category')}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            ) : (
              <div className="py-20 text-gray-300 italic flex flex-col items-center justify-center gap-1">
                 <span className="text-xl">📋</span>
                 {t.catalog.empty}
              </div>
            )}
          </div>
        </section>

        {/* CERT DATA SELECTOR (BLUE OVALS AREA) */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[#491907] text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.certLactDataTitle} (Official Selectors)
            </h2>
            <button className="bg-white border border-gray-200 px-3 py-1 rounded-lg text-[10px] font-black uppercase hover:bg-gray-50 transition-all shadow-sm">
              {t.goats.refresh}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse font-black text-center uppercase whitespace-nowrap">
              <thead className="bg-[#491907] text-white">
                <tr className="divide-x divide-white/10">
                  <th className="p-3 w-16">{t.goats.lactViewer}</th>
                  <th className="p-3 w-[40%] text-start uppercase">{t.goats.certChoice}</th>
                  <th className="p-3">{t.goats.lactNo}</th>
                  <th className="p-3">{t.goats.lactDays}</th>
                  <th className="p-3">{t.goats.lactMilk}</th>
                  <th className="p-3">{t.goats.lactFat}</th>
                  <th className="p-3">{t.goats.lactProtein}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {[
                   { label: "M", p: "m", path: "MEM", color: "bg-pink-100/10" },
                   { label: "F", p: "f", path: "MEF", color: "bg-blue-100/10" },
                   { label: "MM", p: "mm", path: "MEMM", color: "bg-pink-50/20" },
                   { label: "FM", p: "fm", path: "MEMF", color: "bg-blue-50/20" },
                   { label: "MF", p: "mf", path: "MEFM", color: "bg-pink-50/20" },
                   { label: "FF", p: "ff", path: "MEFF", color: "bg-blue-50/20" },
                 ].map((row, idx) => (
                    <CertRows
                      key={idx}
                      label={row.label}
                      count={3}
                      bgColor={row.color}
                      certData={certData}
                      ancestorLacts={ancestorLacts}
                      pathPrefix={row.p}
                      pathKey={row.path}
                      t={t}
                    />
                 ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3RD GEN PRODUCTIVITY (COMPACT) */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-900 px-6 py-4 border-b border-gray-100 flex justify-between items-center group">
            <h2 className="text-white text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-white rounded-full"></span>
              {t.goats.thirdGenProductivity} (Automated)
            </h2>
            <span className="text-[10px] text-white/40 font-bold uppercase italic group-hover:text-emerald-400 transition-colors">Auto-formatted: L/Days/Milk/Fat/Protein</span>
          </div>
          <div className="p-4 bg-gray-50/30">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
               {[
                 { l: "MMM", p: "mmm", path: "MEMMM" },
                 { l: "BMM", p: "fmm", path: "MEMFM" },
                 { l: "MBM", p: "mfm", path: "MEFMM" },
                 { l: "BBM", p: "ffm", path: "MEFFM" },
                 { l: "MMB", p: "mmf", path: "MEMMF" },
                 { l: "BMB", p: "fmf", path: "MEMFF" },
                 { l: "MBB", p: "mff", path: "MEFMF" },
                 { l: "BBB", p: "fff", path: "MEFFF" },
               ].map((item, i) => {
                 const node = ancestorLacts[item.path];
                 const bestLact = node?.lactations?.[0];
                 
                 let displayVal = "";
                 
                 if (bestLact) {
                    displayVal = `${bestLact.lact_no}\\${bestLact.lact_days}\\${bestLact.milk}\\${bestLact.fat}\\${bestLact.protein}`;
                 } else {
                    // Fallback to mother
                    const motherPath = item.path + "M";
                    const motherNode = ancestorLacts[motherPath];
                    const mBestLact = motherNode?.lactations?.[0];
                    if (mBestLact) {
                       displayVal = `M\\${mBestLact.lact_no}\\${mBestLact.lact_days}\\${mBestLact.milk}\\${mBestLact.fat}\\${mBestLact.protein}`;
                    }
                 }
                 
                 return (
                   <div key={i} className="bg-white p-3 border border-gray-200 rounded-lg flex flex-col gap-2 hover:shadow-md transition-all">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{item.l}</span>
                        <span className="text-[9px] font-bold text-gray-300 italic truncate ml-2">{node?.name || "???"}</span>
                      </div>
                      <input
                        type="text"
                        defaultValue={certData[`id_${item.p}_row1`] || displayVal}
                        className={`w-full text-[11px] font-black text-center p-2 rounded-md border outline-none ${displayVal ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                        placeholder="---"
                      />
                   </div>
                 );
               })}
            </div>
          </div>
        </section>

        {/* MOVEMENT DATA SECTION */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-[#491907] text-sm font-black uppercase tracking-widest flex items-center gap-2">
               <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.animalMovement}
            </h2>
          </div>
          <div className="p-6 space-y-6">
             <div className="flex items-center gap-4 text-sm font-black uppercase">
                <a
                  href={`/goats/${goat.id}/move?mode=view`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-blue-100 transition-all font-black text-[10px] uppercase"
                >
                  {t.goats.viewMovement}
                </a>
                <a
                  href={`/goats/${goat.id}/move?mode=add`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-blue-100 transition-all font-black text-[10px] uppercase"
                >
                  {t.goats.moveAnimal}
                </a>
             </div>

            <InviteSection goatId={goat.id} t={t} />
          </div>
        </section>
      </div>
    </div>
  );
}

function CertRows({
  label,
  count,
  bgColor,
  certData,
  ancestorLacts,
  pathPrefix,
  pathKey,
  t,
}: any) {
  const rows = [];
  const node = ancestorLacts[pathKey] || { name: "?", lactations: [] };

  for (let i = 1; i <= count; i++) {
    const fieldName = `id_${pathPrefix}_row${i}`;
    const selectedId = certData[fieldName];
    const selectedLact = node.lactations.find((l: any) => l.id === selectedId);

    rows.push(
      <tr
        key={i}
        className={`${bgColor} divide-x divide-gray-100 border-b border-gray-100 last:border-0 hover:brightness-95 transition-all h-10`}
      >
        <td className="p-1 px-3 font-black text-[#491907] w-12 text-center text-[10px]">{label}{i}</td>
        <td className="p-1.5 px-4 text-start min-w-[200px]">
          <select
            className="w-full text-[11px] bg-white border border-gray-200 rounded-md p-1 outline-none font-bold shadow-sm focus:ring-1 focus:ring-[#491907]/20 transition-all"
            defaultValue={selectedId || ""}
          >
            <option value="">-- {t.goats.select} --</option>
            {node.lactations.map((l: any) => (
              <option key={l.id} value={l.id}>
                L{l.lact_no} • {l.lact_days}d • {l.milk}kg • {l.fat}% • {l.protein}%
              </option>
            ))}
          </select>
        </td>
        <td className="p-1.5 font-bold text-gray-700 text-[11px]">{selectedLact?.lact_no || "-"}</td>
        <td className="p-1.5 font-bold text-gray-700 text-[11px]">{selectedLact?.lact_days || "-"}</td>
        <td className="p-1.5 font-black text-emerald-600 text-[11px]">
          {selectedLact?.milk || "-"}
        </td>
        <td className="p-1.5 font-bold text-gray-700 text-[11px]">{selectedLact?.fat || "-"}</td>
        <td className="p-1.5 font-bold text-gray-700 text-[11px]">{selectedLact?.protein || "-"}</td>
      </tr>,
    );
  }
  return <>{rows}</>;
}

function PedigreeChart({ ancestry, t }: { ancestry: any, t: any }) {
  if (!ancestry) return null;

  return (
    <div className="flex flex-col w-full text-xs uppercase font-black bg-white">
      {/* HEADER STRIPE */}
      <div className="bg-[#491907] flex h-8 items-center border-b border-white/10 px-4">
         <span className="text-white/40 text-xs tracking-widest font-black uppercase">{t.goats.ancestralLineage}</span>
      </div>

      <div className="flex divide-x divide-gray-400">
        <div className="flex-1 flex-col flex">
          <PedigreeNode
            node={ancestry.father}
            prefix={t.common.pedigreePrefix.father}
            color="bg-[#C5E0B4]"
            border
            t={t}
          />
          <PedigreeNode
            node={ancestry.mother}
            prefix={t.common.pedigreePrefix.mother}
            color="bg-[#F8CBAD]"
            t={t}
          />
        </div>

        <div className="flex-1 flex flex-col">
          {[ancestry.father, ancestry.mother].map((p, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col border-b last:border-0 border-gray-400"
            >
              <PedigreeNode
                node={p?.father}
                prefix={t.common.pedigreePrefix.father}
                color="bg-[#E2F0D9]"
                border
                t={t}
              />
              <PedigreeNode
                node={p?.mother}
                prefix={t.common.pedigreePrefix.mother}
                color="bg-[#F6B8EB]/50"
                t={t}
              />
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col">
          {[ancestry.father, ancestry.mother].map((p, i) =>
            [p?.father, p?.mother].map((gp, j) => (
              <div
                key={`${i}-${j}`}
                className="flex-1 flex flex-col border-b last:border-0 border-gray-400"
              >
                <PedigreeNode
                  node={gp?.father}
                  prefix={t.common.pedigreePrefix.father}
                  color="bg-[#E2F0D9]/40"
                  border
                  t={t}
                />
                <PedigreeNode
                  node={gp?.mother}
                  prefix={t.common.pedigreePrefix.mother}
                  color="bg-[#F6B8EB]/30"
                  t={t}
                />
              </div>
            )),
          )}
        </div>

        <div className="flex-1 flex flex-col">
          {[ancestry.father, ancestry.mother].map((p, i) =>
            [p?.father, p?.mother].map((gp, j) =>
              [gp?.father, gp?.mother].map((ggp, k) => (
                <div
                  key={`${i}-${j}-${k}`}
                  className="flex-1 flex flex-col border-b last:border-0 border-gray-300"
                >
                  <PedigreeNode
                    node={ggp?.father}
                    prefix={t.common.pedigreePrefix.father}
                    color="bg-gray-100"
                    border
                    t={t}
                  />
                  <PedigreeNode
                    node={ggp?.mother}
                    prefix={t.common.pedigreePrefix.mother}
                    color="bg-gray-50"
                    t={t}
                  />
                </div>
              )),
            ),
          )}
        </div>
      </div>
    </div>
  );
}
