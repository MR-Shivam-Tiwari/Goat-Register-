import { query } from "@/lib/db";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { cookies } from "next/headers";
import { getTranslation, Locale } from "@/lib/translations";
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

  if (!goat)
    return (
      <div className="p-40 text-center text-4xl font-black text-primary uppercase bg-[#F0F4F0] min-h-screen">
        {t.goats.animalNotFound}
      </div>
    );

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
                  {goat.breed_name} • {goat.sex === 1 ? t.goats.male : t.goats.female}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-14 pb-8 px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex gap-8 items-center text-sm font-black uppercase">
               <div className="flex flex-col gap-0.5">
                  <span className="text-gray-400 font-bold text-sm tracking-widest">{t.goats.registryCode}</span>
                  <span className="text-[#491907] font-black text-xs">{goat.code_ua || goat.id}</span>
               </div>
               {goat.f_id && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400 font-bold text-sm tracking-widest">{t.goats.fatherData}</span>
                    <Link href={`/goats/${goat.f_id}`} className="text-blue-700 hover:text-blue-900 underline decoration-blue-200">
                      {goat.f_name}
                    </Link>
                  </div>
                )}
                {goat.m_id && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400 font-bold text-sm tracking-widest">{t.goats.motherData}</span>
                    <Link href={`/goats/${goat.m_id}`} className="text-blue-700 hover:text-blue-900 underline decoration-pink-200">
                      {goat.m_name}
                    </Link>
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
            <GoatTable goats={[goat]} t={t} isMain />
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
                <GoatTable goats={descendants} t={t} />
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
                  <th className="p-3">{t.goats.lactMilkDay}</th>
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
                    <td className="p-3">{m.avg_yield || "-"}</td>
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
                   <Link href={`/goats/${goat.id}/certificate/1`} target="_blank" className="hover:text-blue-600 hover:underline">{t.goats.cert1}</Link>
                   <span className="opacity-30">|</span>
                   <Link href={`/goats/${goat.id}/certificate/2`} target="_blank" className="hover:text-blue-600 hover:underline">{t.goats.cert2}</Link>
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

        {/* CERT DATA SELECTOR */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[#491907] text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.certLactDataTitle}
            </h2>
            <button className="bg-white border border-gray-200 px-3 py-1 rounded-lg text-sm font-black uppercase hover:bg-gray-50 transition-all shadow-sm">
              {t.goats.refresh}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse font-black text-center uppercase whitespace-nowrap">
              <thead className="bg-gray-100 border-b border-gray-200 text-[#491907]">
                <tr className="divide-x divide-gray-200">
                  <th className="p-3">{t.goats.lactViewer}</th>
                  <th className="p-3 w-[25%] uppercase">{t.goats.certChoice}</th>
                  <th className="p-3">{t.goats.lactNo}</th>
                  <th className="p-3">{t.goats.lactDays}</th>
                  <th className="p-3">{t.goats.lactMilk}</th>
                  <th className="p-3">{t.goats.lactFat}</th>
                  <th className="p-3">{t.goats.lactProtein}</th>
                  <th className="p-3">{t.goats.lactMilkDay}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 <CertRows
                  label={t.common.ancestors.p}
                  count={5}
                  bgColor="bg-[#F6B8EB]/10"
                  certData={certData}
                  ancestorLacts={ancestorLacts}
                  pathPrefix="i"
                  pathKey="ME"
                  t={t}
                />
                <CertRows
                  label={t.common.ancestors.m}
                  count={3}
                  bgColor="bg-[#F8DAB8]/20"
                  certData={certData}
                  ancestorLacts={ancestorLacts}
                  pathPrefix="m"
                  pathKey="MEM"
                  t={t}
                />
                <CertRows
                  label={t.common.ancestors.f}
                  count={3}
                  bgColor="bg-[#F8CBAD]/15"
                  certData={certData}
                  ancestorLacts={ancestorLacts}
                  pathPrefix="f"
                  pathKey="MEF"
                  t={t}
                />
                <CertRows
                  label={t.common.ancestors.mm}
                  count={3}
                  bgColor="bg-gray-50"
                  certData={certData}
                  ancestorLacts={ancestorLacts}
                  pathPrefix="mm"
                  pathKey="MEMM"
                  t={t}
                />
                <CertRows
                  label={t.common.ancestors.mf}
                  count={3}
                  bgColor="bg-gray-50/50"
                  certData={certData}
                  ancestorLacts={ancestorLacts}
                  pathPrefix="fm"
                  pathKey="MEMF"
                  t={t}
                />
                <CertRows
                  label={t.common.ancestors.fm}
                  count={3}
                  bgColor="bg-gray-50"
                  certData={certData}
                  ancestorLacts={ancestorLacts}
                  pathPrefix="mf"
                  pathKey="MEFM"
                  t={t}
                />
                <CertRows
                  label={t.common.ancestors.ff}
                  count={3}
                  bgColor="bg-gray-50/50"
                  certData={certData}
                  ancestorLacts={ancestorLacts}
                  pathPrefix="ff"
                  pathKey="MEFF"
                  t={t}
                />
              </tbody>
            </table>
          </div>
        </section>

        {/* 3RD GEN PRODUCTIVITY */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-[#491907] text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.thirdGenProductivity}
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-300 border border-gray-100 rounded-lg overflow-hidden shadow-sm">
               {[
                 { l: "MMM", f: "id_mmm_row1" },
                 { l: "BMM", f: "id_fmm_row1" },
                 { l: "MBM", f: "id_mfm_row1" },
                 { l: "BBM", f: "id_ffm_row1" },
                 { l: "MMB", f: "id_mmf_row1" },
                 { l: "BMB", f: "id_fmf_row1" },
                 { l: "MBB", f: "id_mff_row1" },
                 { l: "BBB", f: "id_fff_row1" },
               ].map((item, i) => (
                 <div key={i} className="bg-gray-300 p-4 flex flex-col items-center gap-2 group hover:bg-red-50/10 transition-colors">
                    <span className="text-sm font-black text-[#491907] bg-red-300 px-3 py-1 rounded-full scale-95 shadow-sm">
                       {item.l}
                    </span>
                    <div className="w-full">
                       {certData[item.f] ? (
                         <div className="text-center bg-red-200 py-2 text-emerald-600 font-black text-xs">
                            {certData[item.f]}
                         </div>
                       ) : (
                         <input
                           type="text"
                           placeholder="---"
                           className="w-full text-sm font-black text-center bg-gray-50 border border-gray-100 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all shadow-inner"
                         />
                       )}
                    </div>
                 </div>
               ))}
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
                <Link
                  href={`/goats/${goat.id}/move?mode=view`}
                   className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-blue-100 transition-all font-black text-[10px] uppercase"
                >
                  {t.goats.viewMovement}
                </Link>
                <Link
                  href={`/goats/${goat.id}/move?mode=add`}
                   className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-blue-100 transition-all font-black text-[10px] uppercase"
                >
                  {t.goats.moveAnimal}
                </Link>
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
        <td className="p-1 px-3 font-black text-[#491907] w-12">{label}</td>
        <td className="p-1.5 px-4 text-start min-w-[200px]">
          <select
            className="w-full text-sm bg-white border border-gray-200 rounded-md p-1.5 outline-none font-bold shadow-sm focus:ring-2 focus:ring-[#491907]/20 transition-all"
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
        <td className="p-1.5 font-bold text-gray-700">{selectedLact?.lact_no || "-"}</td>
        <td className="p-1.5 font-bold text-gray-700">{selectedLact?.lact_days || "-"}</td>
        <td className="p-1.5 font-black text-emerald-600 scale-110">
          {selectedLact?.milk || "-"}
        </td>
        <td className="p-1.5 font-bold text-gray-700">{selectedLact?.fat || "-"}</td>
        <td className="p-1.5 font-bold text-gray-700">{selectedLact?.protein || "-"}</td>
        <td className="p-1.5 font-bold text-gray-600">{selectedLact?.milk_day || "-"}</td>
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
