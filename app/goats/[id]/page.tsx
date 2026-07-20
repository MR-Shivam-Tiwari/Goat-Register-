import { query } from "@/lib/db";
import React from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { cookies } from "next/headers";
import { getTranslation, Locale } from "@/lib/translations";
import { getSessionUser } from "@/lib/access-control";
import { redirect } from "next/navigation";
import ClassicGoatTable from "@/components/ClassicGoatTable";
import InviteSection from "@/components/InviteSection";
import PedigreeNode from "@/components/PedigreeNode";
import AddPhotoGallery from "@/components/AddPhotoGallery";
import GalleryItem from "@/components/GalleryItem";
import GalleryHeader from "@/components/GalleryHeader";
import ParentBinder from "@/components/ParentBinder";
import LactationTable from "@/components/LactationTable";
import OwnMilkTable from "@/components/OwnMilkTable";
import CertLactSelect from "@/components/CertLactSelect";
import CertInput from "@/components/CertInput";

import {
  getGoatData,
  getOffspringDetailed,
  getDescendantsTree,
  getGallery,
  getLactation,
  getAncestors,
  getOwnMilkProductivity,
  getExpertAssessment,
  getCertData,
  getAncestorLactations,
  getDescendantLactations,
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
  const isOwner = user && (user.role >= 10 || user.id === goat.id_user);

  if (!isOwner) {
    redirect("/goats");
  }

  const [
    descendants,
    descendantTree,
    gallery,
    lactation,
    ancestry,
    ownMilk,
    expertTests,
    certData,
    ancestorLacts,
    descendantLacts,
  ] = await Promise.all([
    getOffspringDetailed(id),
    getDescendantsTree(id),
    getGallery(id),
    getLactation(id),
    getAncestors(parseInt(id)),
    getOwnMilkProductivity(id),
    getExpertAssessment(id),
    getCertData(id),
    getAncestorLactations(id),
    getDescendantLactations(id),
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
                    src={
                      goat.ava.startsWith("http") || goat.ava.startsWith("/")
                        ? goat.ava
                        : `/api/uploads/${goat.ava}`
                    }
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
                  {(goat.is_abg ? "R" : "X") + (10000 + Number(goat.id))} • {goat.breed_name} •{" "}
                  {goat.sex === 1 ? t.goats.male : t.goats.female}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-14 pb-8 px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex gap-8 items-center text-sm font-black uppercase">
              <div className="flex flex-col gap-0.5">
                <span className="text-gray-400 font-bold text-sm tracking-widest">
                  {t.goats.registryCode}
                </span>
                <span className="text-[#491907] font-black text-xs">
                  {(goat.is_abg ? "R" : "X") + (10000 + Number(goat.id))}
                </span>
              </div>
              {goat.f_id ? (
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-400 font-bold text-sm tracking-widest">
                    {t.goats.fatherData}
                  </span>
                  <a
                    href={`/goats/${goat.f_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 font-bold text-xs hover:text-blue-900 underline decoration-blue-200"
                  >
                    {goat.f_name} (ID: {goat.f_id})
                  </a>
                </div>
              ) : (
                <ParentBinder
                  goatId={id}
                  bindAs="f"
                  label={t.goats.fatherData}
                  lang={lang}
                  t={t}
                />
              )}
              {goat.m_id ? (
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-400 font-bold text-sm tracking-widest">
                    {t.goats.motherData}
                  </span>
                  <a
                    href={`/goats/${goat.m_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 font-bold text-xs hover:text-pink-800 underline decoration-pink-200"
                  >
                    {goat.m_name} (ID: {goat.m_id})
                  </a>
                </div>
              ) : (
                <ParentBinder
                  goatId={id}
                  bindAs="m"
                  label={t.goats.motherData}
                  lang={lang}
                  t={t}
                />
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
            <ClassicGoatTable goats={[goat]} t={t} isMain currentUser={user} />
          </div>
        </section>

        {/* GALLERY SECTION */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <GalleryHeader goatId={id} t={t} />
          <div className="p-6">
            <div className="flex flex-wrap border border-[#4D2C1A] bg-[#B5F4BB] w-fit">
              {gallery.length > 0 ? (
                gallery.map((p: any, idx: number) => (
                  <GalleryItem
                    key={p.id || idx}
                    file={p.file}
                    goatId={id}
                    t={t}
                  />
                ))
              ) : (
                <div className="w-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl bg-white">
                  <span className="text-[10px] opacity-40 uppercase tracking-widest">
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

        {/* OFFSPRING & DESCENDANTS GRID */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#FDF8F0] px-4 py-2 border-b border-gray-200">
            <h2 className="text-[#491907] text-[10px] font-black uppercase tracking-widest">
              {t.goats.offspring}
            </h2>
          </div>
          <div className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] border-collapse font-black uppercase whitespace-nowrap">
                <thead className="bg-[#FFD1DC] text-[#491907] border-b-2 border-[#4D2C1A]">
                  <tr className="divide-x-2 divide-[#4D2C1A]">
                    <th className="p-1.5 text-[12px] border-[#4D2C1A]">{t.goats.sons}</th>
                    <th className="p-1.5 text-[12px] border-[#4D2C1A]">
                      {t.goats.daughters}
                    </th>
                    <th className="p-1.5 text-[12px] border-[#4D2C1A]">
                      {t.goats.grandchildren}
                    </th>
                    <th className="p-1.5 text-[12px] border-[#4D2C1A]">
                      {t.goats.granddaughters}
                    </th>
                    <th className="p-1.5 text-[12px] border-[#4D2C1A]">
                      {t.goats.grgrandchildren}
                    </th>
                    <th className="p-1.5 text-[12px] border-[#4D2C1A]">
                      {t.goats.grgranddaughters}
                    </th>
                    <th className="p-1.5 text-[12px] border-[#4D2C1A]">
                      {t.goats.grgrgrandchildren}
                    </th>
                    <th className="p-1.5 text-[12px] border-[#4D2C1A]">
                      {t.goats.grgrgranddaughters}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-x-2 divide-[#4D2C1A]">
                  {Array.from({
                    length: Math.max(
                      12,
                      ...[1, 2, 3, 4].flatMap((l) => [
                        descendantTree.filter(
                          (d) => d.level === l && d.sex === 1,
                        ).length,
                        descendantTree.filter(
                          (d) => d.level === l && d.sex !== 1,
                        ).length,
                      ]),
                    ),
                  }).map((_, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={`divide-x-2 divide-[#4D2C1A] border-b border-[#4D2C1A] hover:bg-gray-50 transition-colors h-7 ${rowIndex % 2 === 0 ? "bg-[#E2F0D9]" : "bg-white"
                        }`}
                    >
                      {[1, 2, 3, 4].map((level) => (
                        <React.Fragment key={level}>
                          {/* MALE/NEUTRAL COLUMN */}
                          <td className="p-1 align-middle text-center min-w-[140px]">
                            {(() => {
                              const item = descendantTree.filter(
                                (d) => d.level === level && d.sex === 1,
                              )[rowIndex];
                              return item ? (
                                <Link
                                  href={`/goats/${item.id}`}
                                  className="text-black hover:text-blue-900 transition-colors block leading-tight py-0.5 text-xs font-bold"
                                >
                                  {item.name}
                                </Link>
                              ) : (
                                <span className="opacity-30 text-xs font-bold text-black">
                                  -
                                </span>
                              );
                            })()}
                          </td>
                          {/* FEMALE COLUMN */}
                          <td className="p-1 align-middle text-center min-w-[140px]">
                            {(() => {
                              const item = descendantTree.filter(
                                (d) => d.level === level && d.sex !== 1,
                              )[rowIndex];
                              return item ? (
                                <Link
                                  href={`/goats/${item.id}`}
                                  className="text-black hover:text-pink-900 transition-colors block leading-tight py-0.5 text-xs font-bold"
                                >
                                  {item.name}
                                </Link>
                              ) : (
                                <span className="opacity-30 text-xs font-bold text-black">
                                  -
                                </span>
                              );
                            })()}
                          </td>
                        </React.Fragment>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* DIRECT DESCENDANTS SUMMARY */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[#491907] text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.directDescendantsTitle}
            </h2>
          </div>
          <div className="overflow-hidden">
            <ClassicGoatTable goats={descendants} t={t} currentUser={user} />
          </div>
        </section>

        {/* LACTATION DATA (ANCESTOR PRODUCTIVITY) */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[#491907] text-sm font-black uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.lactDataTitle}
              <Link href={`/goats/${id}/lact`} className="text-blue-600 hover:text-blue-800 underline lowercase font-normal text-[11px] ml-1">
                {t.goats.add}
              </Link>
            </h2>
          </div>
          <div className="p-0">
            <LactationTable
              ancestorLacts={ancestorLacts}
              descendantLacts={descendantLacts}
              goatId={id}
              currentSelectedId={goat.id_lact_show}
              lang={lang}
              t={t}
            />
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
          <div className="p-0">
            <OwnMilkTable ownMilk={ownMilk} goatId={goat.id} lang={lang} t={t} />
          </div>
        </section>

        {/* EXPERT ASSESSMENT */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[#491907] text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.expertAssessment}
            </h2>
            <div className="flex items-center gap-4">
              <Link
                href={`/goats/${goat.id}/assessment`}
                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-black transition-all shadow-sm"
              >
                {expertTests.length > 0 ? t.goats.editShort : t.goats.add}{" "}
                {t.goats.expertAssessment.replace(":", "")}
              </Link>
              {(goat.cert_no || goat.cert_serial || certData.id) && (
                <>
                  <div className="h-6 w-[1px] bg-gray-200"></div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#491907]/50">
                    <a
                      href={`/goats/${goat.id}/certificate/1`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 hover:underline"
                    >
                      {t.goats.cert1}
                    </a>
                    <span className="opacity-30">|</span>
                    <a
                      href={`/goats/${goat.id}/certificate/2`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 hover:underline"
                    >
                      {t.goats.cert2}
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            {expertTests.length > 0 ? (
              <table className="w-full text-sm border-collapse text-center uppercase font-black whitespace-nowrap">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 text-blue-800">
                  <tr className="divide-x-2 divide-gray-400">
                    <th className="p-3">{lang === 'ru' ? 'ФИО эксперта' : 'Experts Name'}</th>
                    <th className="p-3">{lang === 'ru' ? 'Дата' : 'Date'}</th>
                    <th className="p-3">{lang === 'ru' ? 'Тип' : 'Type'}</th>
                    <th className="p-3" title={lang === 'ru' ? 'Высота в холке' : 'Height at withers'}>{lang === 'ru' ? 'ВХ' : 'WH'}</th>
                    <th className="p-3" title={lang === 'ru' ? 'Высота в крестце' : 'Height at sacrum'}>{lang === 'ru' ? 'ВК' : 'WK'}</th>
                    <th className="p-3" title={lang === 'ru' ? 'Обхват груди' : 'Chest circumference'}>{lang === 'ru' ? 'ОГ' : 'OG'}</th>
                    <th className="p-3" title={lang === 'ru' ? 'Глубина груди' : 'Chest depth'}>{lang === 'ru' ? 'ГГ' : 'GG'}</th>
                    <th className="p-3" title={lang === 'ru' ? 'Косая длина туловища' : 'Body length'}>{lang === 'ru' ? 'КД' : 'KD'}</th>
                    <th className="p-3">{lang === 'ru' ? 'Об. Развитие' : 'Dev'}</th>
                    <th className="p-3">{lang === 'ru' ? 'Х,С,П,Ср.Ч' : 'H,S,P,S'}</th>
                    <th className="p-3">{lang === 'ru' ? 'Грудь' : 'Chest'}</th>
                    <th className="p-3">{lang === 'ru' ? 'Кр-ц' : 'Kr-ts'}</th>
                    <th className="p-3">{lang === 'ru' ? 'К-ти' : 'Limbs'}</th>
                    <th className="p-3">{lang === 'ru' ? 'Копыта' : 'Hooves'}</th>
                    <th className="p-3">{lang === 'ru' ? 'Вымя' : 'Udder'}</th>
                    <th className="p-3">{lang === 'ru' ? 'Вымя спереди' : 'Udder F'}</th>
                    <th className="p-3">{lang === 'ru' ? 'Вымя сзади' : 'Udder B'}</th>
                    <th className="p-3">{lang === 'ru' ? 'Соски' : 'Teats'}</th>
                    <th className="p-3">{lang === 'ru' ? 'Мошонка' : 'Scrotum'}</th>
                    <th className="p-3">{lang === 'ru' ? 'Средний балл' : 'Avg Score'}</th>
                    <th className="p-3">{lang === 'ru' ? 'Класс' : 'Class'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {expertTests.map((test: any, i: number) => {
                    const get = (key: string) => {
                      const val =
                        test[key] ??
                        test[key.charAt(0).toUpperCase() + key.slice(1)];
                      return val !== null && val !== undefined && val !== ""
                        ? val
                        : "-";
                    };
                    return (
                      <tr
                        key={i}
                        className="divide-x-2 divide-gray-400 hover:bg-blue-50/20 transition-colors"
                      >
                        <td className="p-3 truncate max-w-[150px] font-bold">
                          {get("who_expert")}
                        </td>
                        <td className="p-3 text-gray-400">
                          {test.date_test || test.Date_test
                            ? new Date(
                                test.date_test || test.Date_test,
                              ).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="p-3 opacity-60">
                          {(() => {
                            const val = test.test_type !== undefined ? test.test_type : test.Test_type;
                            if (val === 1 || val === "1") return 'КУ';
                            if (val === 2 || val === "2") return 'AM';
                            if (val === 3 || val === "3") return 'К';
                            return 'NO';
                          })()}
                        </td>
                        <td className="p-3">{get("mark_wh")}</td>
                        <td className="p-3">{get("mark_wk")}</td>
                        <td className="p-3">{get("mark_og")}</td>
                        <td className="p-3">{get("mark_gg")}</td>
                        <td className="p-3">{get("mark_kd")}</td>
                        <td className="p-3">{get("mark_dev")}</td>
                        <td className="p-3">{get("mark_hsp")}</td>
                        <td className="p-3">{get("mark_chest")}</td>
                        <td className="p-3">{get("mark_krts")}</td>
                        <td className="p-3">{get("mark_kti")}</td>
                        <td className="p-3">{get("mark_hooves")}</td>
                        <td className="p-3">{get("mark_udder")}</td>
                        <td className="p-3">{get("mark_udder_f")}</td>
                        <td className="p-3">{get("mark_udder_b")}</td>
                        <td className="p-3">{get("mark_teats")}</td>
                        <td className="p-3">{get("mark_scrotum")}</td>
                        <td className="p-3 text-red-600 text-[11px] scale-105">
                          {get("score_total")}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-gray-100 rounded-lg">
                            {get("class")}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-20 text-gray-300 flex flex-col items-center justify-center gap-1">
                <span className="text-xl">📋</span>
                {t.catalog.empty}
              </div>
            )}
          </div>
        </section>

        {/* CERT DATA SELECTOR – mirrors PHP goat.lact.php build() exactly */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[#491907] text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
              {t.goats.certLactDataTitle}
            </h2>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {lang === 'ru' ? 'Сохраняется автоматически' : 'Saves automatically'}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse font-bold text-center whitespace-nowrap text-black">
              <thead>
                <tr className="bg-[#23DC69] border-b-2 border-[#4D2C1A] divide-x-2 divide-[#4D2C1A] text-black">
                  <th className="p-2 px-3 text-center font-black text-xs uppercase w-16">{t.goats.lactViewer}</th>
                  <th className="p-2 px-3 font-black text-xs uppercase text-left w-[320px]">{t.goats.certChoice}</th>
                  <th className="p-2 px-3 font-black text-xs uppercase">{t.goats.lactNo}</th>
                  <th className="p-2 px-3 font-black text-xs uppercase">{t.goats.lactDays}</th>
                  <th className="p-2 px-3 font-black text-xs uppercase">{t.goats.lactMilk}</th>
                  <th className="p-2 px-3 font-black text-xs uppercase">{t.goats.lactFat}</th>
                  <th className="p-2 px-3 font-black text-xs uppercase">{t.goats.lactProtein}</th>
                  <th className="p-2 px-3 font-black text-xs uppercase">{t.goats.lactMilkDay}</th>
                </tr>
              </thead>
              <tbody>
                {/* П – 5 rows – Descendants of current goat (PHP: retChild($ID)) – #F6B8EB */}
                <CertRows goatId={goat.id} label={lang === 'ru' ? 'П' : 'P'} count={5} bg="#F6B8EB"
                  certData={certData} ancestorLacts={ancestorLacts} descendantLacts={descendantLacts}
                  pathPrefix="i" sourceType="descendants" t={t} lang={lang} />

                {/* М – 3 rows – Mother (PHP: idof($ID,'M') + retParnt + retChild) – #F6DAB8 */}
                <CertRows goatId={goat.id} label={lang === 'ru' ? 'М' : 'M'} count={3} bg="#F6DAB8"
                  certData={certData} ancestorLacts={ancestorLacts} descendantLacts={descendantLacts}
                  pathPrefix="m" pathKey="MEM" sourceType="ancestor" t={t} lang={lang} />

                {/* О – 3 rows – Father (PHP: idof($ID,'F') + retParnt + retChild) – #E89F98 */}
                <CertRows goatId={goat.id} label={lang === 'ru' ? 'О' : 'ABOUT'} count={3} bg="#E89F98"
                  certData={certData} ancestorLacts={ancestorLacts} descendantLacts={descendantLacts}
                  pathPrefix="f" pathKey="MEF" sourceType="ancestor" t={t} lang={lang} />

                {/* ММ – 3 rows – Mother's Mother – #F6ECB8 */}
                <CertRows goatId={goat.id} label={lang === 'ru' ? 'ММ' : 'MM'} count={3} bg="#F6ECB8"
                  certData={certData} ancestorLacts={ancestorLacts} descendantLacts={descendantLacts}
                  pathPrefix="mm" pathKey="MEMM" sourceType="ancestor" t={t} lang={lang} />

                {/* ОМ – 3 rows – Mother's Father (PHP: idof($ID,'MF')) – #F6BDB8 */}
                <CertRows goatId={goat.id} label={lang === 'ru' ? 'ОМ' : 'OM'} count={3} bg="#F6BDB8"
                  certData={certData} ancestorLacts={ancestorLacts} descendantLacts={descendantLacts}
                  pathPrefix="fm" pathKey="MEMF" sourceType="ancestor" t={t} lang={lang} />

                {/* МО – 3 rows – Father's Mother (PHP: idof($ID,'FM')) – #F6ECB8 */}
                <CertRows goatId={goat.id} label={lang === 'ru' ? 'МО' : 'MO'} count={3} bg="#F6ECB8"
                  certData={certData} ancestorLacts={ancestorLacts} descendantLacts={descendantLacts}
                  pathPrefix="mf" pathKey="MEFM" sourceType="ancestor" t={t} lang={lang} />

                {/* ОО – 3 rows – Father's Father (PHP: idof($ID,'FF')) – #F6BDB8 */}
                <CertRows goatId={goat.id} label={lang === 'ru' ? 'ОО' : 'OO'} count={3} bg="#F6BDB8"
                  certData={certData} ancestorLacts={ancestorLacts} descendantLacts={descendantLacts}
                  pathPrefix="ff" pathKey="MEFF" sourceType="ancestor" t={t} lang={lang} />
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
            <span className="text-[10px] text-white/40 font-bold uppercase group-hover:text-emerald-400 transition-colors">
              Auto-formatted: L/Days/Milk/Fat/Protein
            </span>
          </div>
          <div className="p-4 bg-gray-50/30">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { l: "MMM", p: "mmm", path: "MEMMM" },
                { l: "BMM", p: "fmm", path: "MEMMF" },
                { l: "MBM", p: "mfm", path: "MEMFM" },
                { l: "BBM", p: "ffm", path: "MEMFF" },
                { l: "MMB", p: "mmf", path: "MEFMM" },
                { l: "BMB", p: "fmf", path: "MEFMF" },
                { l: "MBB", p: "mff", path: "MEFFM" },
                { l: "BBB", p: "fff", path: "MEFFF" },
              ].map((item, i) => {
                const node = ancestorLacts[item.path];
                const lactations = [
                  ...(node?.ownLactations || []),
                  ...(node?.daughtersLactations || []),
                ];
                const bestLact = lactations[0];

                let displayVal = "";

                if (bestLact) {
                  displayVal = `${bestLact.lact_no}\\${bestLact.lact_days}\\${bestLact.milk}\\${bestLact.fat}\\${bestLact.protein}`;
                } else {
                  // Fallback to mother
                  const motherPath = item.path + "M";
                  const motherNode = ancestorLacts[motherPath];
                  const motherLacts = [
                    ...(motherNode?.ownLactations || []),
                    ...(motherNode?.daughtersLactations || []),
                  ];
                  const mBestLact = motherLacts[0];
                  if (mBestLact) {
                    displayVal = `M\\${mBestLact.lact_no}\\${mBestLact.lact_days}\\${mBestLact.milk}\\${mBestLact.fat}\\${mBestLact.protein}`;
                  }
                }

                return (
                  <div
                    key={i}
                    className="bg-white p-3 border border-gray-200 rounded-lg flex flex-col gap-2 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {item.l}
                      </span>
                      <span className="text-[9px] font-bold text-gray-300 truncate ml-2">
                        {node?.name || "???"}
                      </span>
                    </div>
                    <CertInput
                      goatId={goat.id}
                      fieldName={`id_${item.p}_row1`}
                      defaultValue={certData[`id_${item.p}_row1`] || displayVal}
                      className={`w-full text-[11px] font-black text-center p-2 rounded-md border outline-none ${displayVal ? "bg-emerald-50/50 border-emerald-100 text-emerald-800" : "bg-gray-50 border-gray-100 text-gray-400"}`}
                      placeholder="---"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* MOVEMENT DATA SECTION */}
        <section className="rounded-2xl shadow-sm border border-[#491907]/20 overflow-hidden" style={{ backgroundColor: '#F6DBE4' }}>
          <div className="px-6 py-4 border-b border-[#491907]/10" style={{ backgroundColor: '#602701' }}>
            <h2 className="text-white text-sm  uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-white rounded-full"></span>
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
  goatId,
  label,
  count,
  bg,
  certData,
  ancestorLacts,
  descendantLacts = [],
  pathPrefix,
  pathKey,
  sourceType, // 'ancestor' | 'descendants'
  t,
  lang,
}: any) {
  // Build the pool of lactation records for this slot
  let lactations: any[] = [];

  if (sourceType === 'descendants') {
    // П rows: use descendant lactations from all descendants
    descendantLacts.forEach((d: any) => {
      (d.lactations || []).forEach((l: any) => {
        lactations.push({ ...l, _ownerName: d.name });
      });
    });
    lactations.sort((a: any, b: any) => Number(a.id) - Number(b.id));
  } else {
    // ancestor rows: use the specific ancestor node from ancestorLacts
    const node = ancestorLacts[pathKey] || { name: '', sex: 2, ownLactations: [], daughtersLactations: [] };
    const ownLacts = (node.ownLactations || []).map((l: any) => ({
      ...l,
      _ownerName: node.sex === 1 ? (l.goat_name || node.name) : (lang === 'ru' ? 'Своя' : 'Own'),
    }));

    const motherNode = ancestorLacts[pathKey + "M"];
    const motherLacts = motherNode ? (motherNode.ownLactations || []).map((l: any) => ({
      ...l,
      _ownerName: l.goat_name || motherNode.name,
    })) : [];

    const daughterLacts = (node.daughtersLactations || []).map((l: any) => ({
      ...l,
      _ownerName: l.goat_name || '',
    }));

    // Merge them: own first (if female), then mother's, then daughters'
    lactations = [
      ...(node.sex !== 1 ? ownLacts : []),
      ...motherLacts,
      ...daughterLacts,
    ];
  }

  const rows = [];
  for (let i = 1; i <= count; i++) {
    const fieldName = `id_${pathPrefix}_row${i}`;
    const savedId = certData?.[fieldName];

    // Build dropdown options exactly like old PHP: "Name/lact_no/lact_days/milk/fat/protein/milk_day"
    const options: { id: number; label: string }[] = lactations.map((l: any) => {
      const parts = [
        l._ownerName || '',
        l.lact_no ?? '',
        l.lact_days ?? '',
        l.milk ?? '',
        l.fat ?? '',
        l.protein ?? '',
        l.milk_day ?? '',
      ].join('/');
      return { id: Number(l.id), label: parts };
    });

    // Determine if this row has a saved value with a pre-selected option
    const hasValue = options.some(o => o.id === Number(savedId));

    // Get the selected lactation details to display in the separate fields
    const selectedLact = hasValue ? lactations.find((l: any) => Number(l.id) === Number(savedId)) : null;

    let displayNo = '-';
    let displayDays = '-';
    let displayMilk = '-';
    let displayFat = '-';
    let displayProtein = '-';
    let displayMilkDay = '-';

    if (selectedLact) {
      displayNo = selectedLact.lact_no !== null && selectedLact.lact_no !== undefined ? String(selectedLact.lact_no) : '-';
      displayDays = selectedLact.lact_days !== null && selectedLact.lact_days !== undefined ? String(selectedLact.lact_days) : '-';
      displayMilk = selectedLact.milk !== null && selectedLact.milk !== undefined ? String(selectedLact.milk) : '-';
      displayFat = selectedLact.fat !== null && selectedLact.fat !== undefined ? String(selectedLact.fat) : '-';
      displayProtein = selectedLact.protein !== null && selectedLact.protein !== undefined ? String(selectedLact.protein) : '-';

      const rawMDay = selectedLact.milk_day ?? selectedLact.avg_yield ?? '';
      if (rawMDay !== null && rawMDay !== undefined && rawMDay !== '') {
        const num = Number(rawMDay);
        if (!isNaN(num) && isFinite(num)) {
          displayMilkDay = String(rawMDay);
        }
      }
    }

    rows.push(
      <tr
        key={`${pathPrefix}-${i}`}
        style={{ backgroundColor: bg }}
        className="border-b border-white/40 divide-x-2 divide-[#4D2C1A] h-9 text-black text-center font-bold"
      >
        {/* WHO column – label repeats (no numeric suffix), matching old PHP */}
        <td
          className="p-1 px-3 text-center font-black text-xs w-14"
          style={{ color: '#333' }}
        >
          {label}
        </td>
        {/* CHOICE column – dropdown */}
        <td className="p-1 px-2 text-left w-[320px]">
          <CertLactSelect
            goatId={goatId}
            fieldName={fieldName}
            selectedId={hasValue ? Number(savedId) : 0}
            lactations={lactations}
            options={options}
            selectText={lang === 'ru' ? '-- выбрать --' : '-- select --'}
          />
        </td>
        {/* Lactation number */}
        <td className="p-1 px-3 text-xs">{displayNo}</td>
        {/* Days of lactation */}
        <td className="p-1 px-3 text-xs">{displayDays}</td>
        {/* Milk yield per lactation in kg */}
        <td className="p-1 px-3 text-xs">{displayMilk}</td>
        {/* Fat % */}
        <td className="p-1 px-3 text-xs">{displayFat}</td>
        {/* Protein % */}
        <td className="p-1 px-3 text-xs">{displayProtein}</td>
        {/* Average daily milk yield (kg) */}
        <td className="p-1 px-3 text-xs">{displayMilkDay}</td>
      </tr>,
    );
  }
  return <>{rows}</>;
}



function PedigreeChart({ ancestry, t }: { ancestry: any; t: any }) {
  if (!ancestry) return null;

  // Walk tree to find repeated ancestors by name (Inbreeding detection)
  const nameCounts = new Map<string, number>();
  const nameColors = new Map<string, string>();

  function countNames(node: any) {
    if (!node || !node.name) return;
    const key = node.name.trim().toLowerCase();
    nameCounts.set(key, (nameCounts.get(key) || 0) + 1);
    countNames(node.father);
    countNames(node.mother);
  }

  countNames(ancestry.father);
  countNames(ancestry.mother);

  // Very light, soft pastel colors (not dark at all)
  const repeatPalette = [
    "#E0F2FE", // very soft blue
    "#FEF08A", // very soft yellow
    "#DCFCE7", // very soft green
    "#FCE7F3", // very soft pink
    "#F3E8FF", // very soft purple
    "#FFEDD5", // very soft orange
    "#CCFBF1", // very soft teal
    "#FEF3C7", // very soft amber
    "#E2F0D9", // very soft light green
  ];
  let pIdx = 0;

  nameCounts.forEach((count, key) => {
    if (count > 1) {
      nameColors.set(key, repeatPalette[pIdx % repeatPalette.length]);
      pIdx++;
    }
  });

  function getNodeColor(node: any, defaultSex: number) {
    if (!node || !node.name) {
      return defaultSex === 1 ? "#E2F0D9" : "#FDE2E8";
    }
    const key = node.name.trim().toLowerCase();
    if (nameColors.has(key)) {
      return nameColors.get(key)!;
    }
    return node.sex === 1 ? "#E2F0D9" : "#FDE2E8";
  }

  return (
    <div className="flex flex-col w-full text-xs uppercase font-black bg-white">
      {/* HEADER STRIPE */}
      <div className="bg-[#491907] flex h-8 items-center border-b border-white/10 px-4">
        <span className="text-white/40 text-xs tracking-widest font-black uppercase">
          {t.goats.ancestralLineage}
        </span>
      </div>

      <div className="flex divide-x divide-gray-400">
        {/* GENERATION 1 */}
        <div className="flex-1 flex-col flex">
          <PedigreeNode
            node={ancestry.father}
            prefix={t.common.pedigreePrefix.father}
            color={getNodeColor(ancestry.father, 1)}
            border
            t={t}
          />
          <PedigreeNode
            node={ancestry.mother}
            prefix={t.common.pedigreePrefix.mother}
            color={getNodeColor(ancestry.mother, 2)}
            t={t}
          />
        </div>

        {/* GENERATION 2 */}
        <div className="flex-1 flex flex-col">
          {[ancestry.father, ancestry.mother].map((p, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col border-b last:border-0 border-gray-400"
            >
              <PedigreeNode
                node={p?.father}
                prefix={t.common.pedigreePrefix.father}
                color={getNodeColor(p?.father, 1)}
                border
                t={t}
              />
              <PedigreeNode
                node={p?.mother}
                prefix={t.common.pedigreePrefix.mother}
                color={getNodeColor(p?.mother, 2)}
                t={t}
              />
            </div>
          ))}
        </div>

        {/* GENERATION 3 */}
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
                  color={getNodeColor(gp?.father, 1)}
                  border
                  t={t}
                />
                <PedigreeNode
                  node={gp?.mother}
                  prefix={t.common.pedigreePrefix.mother}
                  color={getNodeColor(gp?.mother, 2)}
                  t={t}
                />
              </div>
            )),
          )}
        </div>

        {/* GENERATION 4 */}
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
                    color={getNodeColor(ggp?.father, 1)}
                    border
                    t={t}
                  />
                  <PedigreeNode
                    node={ggp?.mother}
                    prefix={t.common.pedigreePrefix.mother}
                    color={getNodeColor(ggp?.mother, 2)}
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
