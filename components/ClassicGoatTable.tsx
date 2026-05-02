"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";

export default function ClassicGoatTable({
  goats,
  t,
  isMain,
  isGuest,
  currentUser,
}: {
  goats: any[];
  t: any;
  isMain?: boolean;
  isGuest?: boolean;
  currentUser?: { id: number | string; role: number };
}) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col w-full h-full min-h-0 bg-[#FEFBF5]">
      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div className="bg-white p-2 rounded-lg shadow-2xl max-w-[90vw] max-h-[90vh]">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[80vh] object-contain rounded"
            />
            <button className="w-full mt-4 py-2 bg-primary text-white font-bold uppercase text-xs rounded">
              Close
            </button>
          </div>
        </div>
      )}

      <div
        ref={tableContainerRef}
        className="flex-1 min-h-0 overflow-auto bg-white border border-gray-300 custom-scrollbar relative"
      >
        <table className="w-full text-left border-collapse table-auto min-w-[7500px] text-[14px] font-medium leading-normal">
          <thead className="sticky top-0 z-30 shadow-sm">
            {/* TOP HEADER - GROUPS (UNIFIED VIBRANT GREEN) */}
            <tr className="text-[12px] font-bold uppercase tracking-tight text-black bg-[#23DC69] border-b border-black">
              <th
                colSpan={21}
                className="p-1 text-center border-r-[3px] border-black bg-[#23DC69]"
              >
                {isMain ? t.goats.showAll : t.catalog.title}
              </th>

              <th
                colSpan={8}
                className="p-1 text-center border-r-[3px] border-black bg-[#E2F0D9] text-[16px]"
              >
                {t.goats.motherData}
              </th>
              <th
                colSpan={8}
                className="p-1 text-center border-r-[3px] border-black bg-[#FCE4D6] text-[16px]"
              >
                {t.goats.fatherData}
              </th>
              <th colSpan={8} className="p-1 text-center border-r border-black bg-[#23DC69]">
                {t.goats.productivitySection}
              </th>
              <th colSpan={8} className="p-1 text-center border-r border-black bg-[#23DC69]">
                {t.goats.certSection}
              </th>
              <th
                colSpan={4}
                className="p-1 text-center border-r border-black bg-[#23DC69] text-black"
              >
                Meta
              </th>
              <th
                colSpan={2}
                className="p-1 text-center border-black bg-[#23DC69]"
              >
                Cert
              </th>
            </tr>
            {/* BOTTOM HEADER - FIELDS (MINT GREEN / MATCHING TONE) */}
            <tr className="text-[12px] font-bold uppercase tracking-tight text-gray-900 border-b border-black bg-[#B5F4BB]">
              <th 
                className="p-0 border-r text-center text-nowrap border-black sticky left-0 bg-[#B5F4BB] z-40 min-w-[300px]"
              >
                <div className="flex items-center justify-center h-full px-2">
                  {t.goats.nickname}
                </div>
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black">
                {t.goats.breed}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#C9DAF8] text-blue-800 font-bold">
                Σ %
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black">
                {t.goats.sex}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black">
                {t.goats.abgMember}
              </th>
              <th className="p-0.5 px-2 border-r text-center min-w-[120px] text-nowrap border-black">
                {t.goats.farm}
              </th>
              <th className="p-0.5 px-2 border-r text-center min-w-[120px] text-nowrap border-black">
                {t.goats.breeder}
              </th>
              <th className="p-0.5 px-2 border-r text-center min-w-[120px] text-nowrap border-black">
                {t.goats.owner}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black">
                {t.goats.birthDate}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black">
                {t.goats.birthWeight}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black">
                {t.goats.bornQty}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black">
                {t.goats.hornedness}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black">
                {t.goats.genPassport}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black">
                {t.goats.genetic}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black">
                {t.goats.registryCode}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-gray-100/20">
                {t.goats.idUa}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-gray-100/20">
                {t.goats.idAbg}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-gray-100/20">
                {t.goats.idFx}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-gray-100/20">
                {t.goats.chipId}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-gray-100/20">
                {t.goats.idInt}
              </th>
              <th className="p-0.5 px-2 border-r-[3px] text-center text-nowrap border-black">
                {t.goats.brand}
              </th>



              {/* Mother Group */}
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#E2F0D9]/40">
                {t.goats.nickname} (M)
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#E2F0D9]/40">
                {t.goats.registryCode}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#E2F0D9]/40">
                {t.goats.idUa}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#E2F0D9]/40">
                {t.goats.idAbg}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#E2F0D9]/40">
                {t.goats.idFx}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#E2F0D9]/40">
                {t.goats.chipId}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#E2F0D9]/40">
                {t.goats.idInt}
              </th>
              <th className="p-0.5 px-2 border-r-[3px] text-center text-nowrap border-black bg-[#E2F0D9]/40">
                {t.goats.brand}
              </th>

              {/* Father Group */}
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#F8CBAD]/10">
                {t.goats.nickname} (F)
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#F8CBAD]/10">
                {t.goats.registryCode}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#F8CBAD]/10">
                {t.goats.idUa}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#F8CBAD]/10">
                {t.goats.idAbg}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#F8CBAD]/10">
                {t.goats.idFx}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#F8CBAD]/10">
                {t.goats.chipId}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#F8CBAD]/10">
                {t.goats.idInt}
              </th>
              <th className="p-0.5 px-2 border-r-[3px] text-center text-nowrap border-black bg-[#F8CBAD]/10">
                {t.goats.brand}
              </th>

              {/* Productivity Details */}
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#B4E0B4]/40">
                {t.goats.lactViewer}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#B4E0B4]/40">
                {t.goats.lactNo}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#B4E0B4]/40">
                {t.goats.lactDays}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#B4E0B4]/40">
                {t.goats.lactMilk}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#B4E0B4]/40">
                {t.goats.lactFat}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#B4E0B4]/40">
                {t.goats.lactProtein}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#B4E0B4]/40">
                {t.goats.lactMilkDay}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#B4E0B4]/40">
                {t.goats.lactGraph}
              </th>

              {/* Cert Details */}
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#CFE2F3]/40">
                {t.goats.certType}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#CFE2F3]/40">
                {t.goats.score}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#CFE2F3]/40">
                H.X.
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#CFE2F3]/40">
                H.K.
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#CFE2F3]/40">
                O.G.
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#CFE2F3]/40">
                K.D.
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#CFE2F3]/40">
                {t.goats.certClass}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-[#CFE2F3]/40">
                {t.goats.certCategory}
              </th>

              {/* Meta Group */}
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-gray-100/40">
                {t.goats.dateAdded}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-gray-100/40">
                {t.goats.source}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-gray-100/40">
                {t.goats.status}
              </th>
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-gray-100/40">
                {t.goats.notes}
              </th>

              {/* Cert Numbers */}
              <th className="p-0.5 px-2 border-r text-center text-nowrap border-black bg-gray-100/40">
                {t.goats.certSeries}
              </th>
              <th className="p-0.5 px-2 text-center text-nowrap border-black bg-gray-100/40">
                {t.goats.certNum}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black border-b border-black">
            {goats.map((g, idx) => {
              let rowColor = idx % 2 === 0 ? "#FFFFFF" : "#B5F4BB";

              if (g.status === 0 || g.status === "0") {
                rowColor = "#F7B8D5"; // PHP Pink for Dead
              } else if (
                g.is_reg === 1 ||
                g.is_reg === "1" ||
                g.is_reg === true
              ) {
                rowColor = idx % 2 === 0 ? "#FFFFFF" : "#B5F4BB";
              }

              if (highlightedRow === idx) {
                rowColor = "#FFF2CC";
              }

              const prefix =
                g.is_reg === "1" || g.is_reg === 1 || g.is_reg === true
                  ? "R"
                  : "X";
              const displayId = prefix + (10000 + Number(g.id || g.reg_id));

              return (
                <tr
                  key={idx}
                  style={{ backgroundColor: rowColor }}
                  className="divide-x divide-black transition-all border-b border-black h-9"
                >
                  <td
                    style={{ backgroundColor: rowColor }}
                    className="p-0 sticky left-0 z-20 whitespace-nowrap border-r border-black"
                  >
                    <div className="flex items-center gap-1.5 px-2 h-full">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setHighlightedRow(highlightedRow === idx ? null : idx);
                        }}
                        className={`w-3 h-3 rounded-full border border-gray-300 flex items-center justify-center transition-colors ${highlightedRow === idx ? "bg-yellow-400" : "bg-gray-50"}`}
                        title="Highlight Row"
                      >
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </button>
                      {g.ava ? (
                        <img
                          src={
                            g.ava.startsWith("http") || g.ava.startsWith("/")
                              ? g.ava
                              : `/uploads/${g.ava}`
                          }
                          alt=""
                          className="w-7 h-6 object-cover border border-gray-300 cursor-zoom-in"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage(
                              g.ava.startsWith("http") || g.ava.startsWith("/")
                                ? g.ava
                                : `/uploads/${g.ava}`,
                            );
                          }}
                        />
                      ) : (
                        <div className="w-7 h-6 bg-gray-100 border border-gray-300"></div>
                      )}
                      {(() => {
                        const currentUserId = currentUser?.id
                          ? String(currentUser.id)
                          : null;
                        const goatOwnerId = g.id_user ? String(g.id_user) : null;
                        const userRole = currentUser?.role
                          ? Number(currentUser.role)
                          : 0;

                        const canAccess = isGuest
                          ? false
                          : currentUser &&
                            (userRole >= 10 ||
                              (goatOwnerId !== null &&
                                currentUserId === goatOwnerId));

                        if (!canAccess)
                          return (
                            <span className="text-gray-900 font-bold">
                              {g.name}
                            </span>
                          );

                        return (
                          <Link
                            href={`/goats/${g.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-gray-900 font-bold"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {g.name}
                          </Link>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="p-0.5 px-2 text-center text-nowrap opacity-80 uppercase leading-none">
                    {g.breed_alias || g.breed_name}
                  </td>
                  <td className="p-0.5 px-2 text-center text-blue-800 bg-[#C9DAF8]/10 font-bold">
                    {g.blood_percent ? `${g.blood_percent}%` : "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center">
                    {g.sex === 1 ? "Buck" : "Doe"}
                  </td>
                  <td className="p-0.5 px-2 text-center">
                    {g.is_abg ? "Yes" : "No"}
                  </td>
                  <td className="p-0.5 px-2 text-nowrap truncate max-w-[150px]">
                    {g.farm_name || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-nowrap truncate max-w-[150px] opacity-70">
                    {g.manuf || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-nowrap truncate max-w-[150px]">
                    {g.owner || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center text-nowrap font-mono text-[12px]">
                    {g.date_born
                      ? new Date(g.date_born).toLocaleDateString("ru-RU", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center font-mono">
                    {g.born_weight || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center font-mono">
                    {g.born_qty || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center uppercase font-bold">
                    {g.horns_type === 1 || g.horns_type === "1"
                      ? "TO"
                      : g.horns_type === 2 || g.horns_type === "2"
                        ? "ABOUT"
                        : g.horns_type === 3 || g.horns_type === "3"
                          ? "R"
                          : "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center">
                    {g.have_gen === 1 ||
                    g.have_gen === "1" ||
                    g.have_gen === true
                      ? "Yes"
                      : "No"}
                  </td>
                  <td className="p-0.5 px-2 text-center truncate max-w-[100px]">
                    {g.gen_mat || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center text-red-700 font-bold">
                    {displayId}
                  </td>
                  <td className="p-0.5 px-2 text-center text-nowrap font-mono">
                    {g.code_ua || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center text-nowrap font-mono">
                    {g.code_abg || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center text-nowrap font-mono">
                    {g.code_farm || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center text-nowrap font-mono">
                    {g.code_chip || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center text-nowrap font-mono">
                    {g.code_int || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center text-nowrap font-mono border-r-[3px] border-black">
                    {g.code_brand || "-"}
                  </td>



                  {/* Mother Group */}
                  <td className="p-0.5 px-2 text-nowrap text-blue-900 truncate max-w-[150px] bg-[#E2F0D9]/10">
                    {g.m_id ? (
                      <a
                        href={`/goats/${g.m_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {g.m_name}
                      </a>
                    ) : (
                      g.m_name || "-"
                    )}
                  </td>
                  <td className="p-0.5 px-2 text-center font-mono bg-[#E2F0D9]/10">
                    {g.m_id ? `R${10000 + g.m_id}` : "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center font-mono bg-[#E2F0D9]/10">
                    {g.m_code_ua || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center font-mono text-red-600 bg-[#E2F0D9]/10">
                    {g.m_code_abg || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center font-mono bg-[#E2F0D9]/10">
                    {g.m_code_farm || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center font-mono bg-[#E2F0D9]/10">
                    {g.m_code_chip || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center font-mono text-red-600 bg-[#E2F0D9]/10">
                    {g.m_code_int || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center border-r-[3px] border-black bg-[#E2F0D9]/10">
                    {g.m_code_brand || "-"}
                  </td>

                  {/* Father Group */}
                  <td className="p-0.5 px-2 text-nowrap text-blue-900 truncate max-w-[150px] bg-[#FCE4D6]/15">
                    {g.f_id ? (
                      <a
                        href={`/goats/${g.f_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {g.f_name}
                      </a>
                    ) : (
                      g.f_name || "-"
                    )}
                  </td>
                  <td className="p-0.5 px-2 text-center font-mono bg-[#FCE4D6]/15">
                    {g.f_id ? `R${10000 + g.f_id}` : "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center font-mono bg-[#FCE4D6]/15">
                    {g.f_code_ua || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center font-mono text-red-600 bg-[#FCE4D6]/15">
                    {g.f_code_abg || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center font-mono bg-[#FCE4D6]/15">
                    {g.f_code_farm || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center font-mono bg-[#FCE4D6]/15">
                    {g.f_code_chip || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center font-mono text-red-600 bg-[#FCE4D6]/15">
                    {g.f_code_int || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center bg-[#FCE4D6]/15 border-r-[3px] border-black">
                    {g.f_code_brand || "-"}
                  </td>

                  {/* Productivity Details */}
                  <td className="p-0.5 px-2 text-center bg-[#B4E0B4]/10">
                    {g.viewer || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center font-mono bg-[#B4E0B4]/10">
                    {g.lact_no || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center font-mono bg-[#B4E0B4]/10">
                    {g.lact_days || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center font-black text-red-700 bg-[#B4E0B4]/10">
                    {g.milk || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center font-mono bg-[#B4E0B4]/10">
                    {g.fat || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center font-mono bg-[#B4E0B4]/10">
                    {g.protein || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center font-mono bg-[#B4E0B4]/10">
                    {g.milk_day || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center bg-[#B4E0B4]/10 font-bold italic text-blue-900">
                    {g.lact_graph ? "Yes" : "No"}
                  </td>

                  {/* Cert Details */}
                  <td className="p-0.5 px-2 text-center bg-[#CFE2F3]/10">
                    {g.test_type === 1
                      ? "Classical"
                      : g.test_type === 2
                        ? "Young"
                        : "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center font-extrabold text-red-600 bg-[#CFE2F3]/10">
                    {g.score_total || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center font-mono bg-[#CFE2F3]/10">
                    {g.par_1 || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center font-mono bg-[#CFE2F3]/10">
                    {g.par_2 || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center font-mono bg-[#CFE2F3]/10">
                    {g.par_3 || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center font-mono bg-[#CFE2F3]/10">
                    {g.par_4 || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center bg-[#CFE2F3]/10">
                    {g.cert_class || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center bg-[#CFE2F3]/10">
                    {g.category || "-"}
                  </td>

                  {/* Meta Details */}
                  <td className="p-0.5 px-2 text-center font-mono text-[12px] bg-gray-100/5">
                    {g.time_added
                      ? new Date(g.time_added).toLocaleDateString("ru-RU", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "-"}
                  </td>
                  <td className="p-0.5 px-2 truncate max-w-[100px] bg-gray-100/5">
                    {g.source || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center font-bold bg-gray-100/5">
                    {g.status === 1 || g.status === "1" ? (
                      <span className="text-green-700">Alive</span>
                    ) : g.status === 0 || g.status === "0" ? (
                      <span className="text-red-700">Dead</span>
                    ) : (
                      <span className="text-gray-500">No info</span>
                    )}
                  </td>
                  <td className="p-0.5 px-2 truncate max-w-[200px] bg-gray-100/5 border-r border-black">
                    {g.special || "-"}
                  </td>

                  {/* Cert Numbers */}
                  <td className="p-0.5 px-2 text-center font-mono bg-gray-100/10">
                    {g.cert_serial || "-"}
                  </td>
                  <td className="p-0.5 px-2 text-center font-mono bg-gray-100/10">
                    {g.cert_no || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
