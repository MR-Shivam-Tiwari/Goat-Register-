"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";

export default function GoatTable({
  goats,
  t,
  isMain,
  isGuest,
}: {
  goats: any[];
  t: any;
  isMain?: boolean;
  isGuest?: boolean;
}) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    const topScroll = topScrollRef.current;

    if (!tableContainer || !topScroll) return;

    const syncTableScroll = () => {
      if (topScroll.scrollLeft !== tableContainer.scrollLeft) {
        topScroll.scrollLeft = tableContainer.scrollLeft;
      }
    };

    const syncTopScroll = () => {
      if (tableContainer.scrollLeft !== topScroll.scrollLeft) {
        tableContainer.scrollLeft = topScroll.scrollLeft;
      }
    };

    tableContainer.addEventListener("scroll", syncTableScroll);
    topScroll.addEventListener("scroll", syncTopScroll);

    return () => {
      tableContainer.removeEventListener("scroll", syncTableScroll);
      topScroll.removeEventListener("scroll", syncTopScroll);
    };
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Top Scrollbar */}
      <div 
        ref={topScrollRef}
        className="overflow-x-auto w-full mb-0.5"
        style={{ height: '14px' }}
      >
        <div style={{ width: '7500px', height: '1px' }}></div>
      </div>

      <div 
        ref={tableContainerRef}
        className="overflow-x-auto overflow-y-auto max-h-[75vh] w-full bg-white border border-gray-300 shadow-sm custom-scrollbar relative"
      >
      <table className="w-full text-left border-collapse table-auto min-w-[7500px]">
        <thead className="sticky top-0 z-30 shadow-sm">
          {/* TOP HEADER - GROUPS */}
          <tr className="text-sm font-bold uppercase  tracking-tight text-gray-700">
            <th
              colSpan={20}
              className="p-1 text-center border-r border-gray-100 bg-[#E2F0D9]"
            >
              {isMain ? t.goats.showAll : t.catalog.title}
            </th>
            <th
              colSpan={2}
              className="p-1 text-center border-r border-gray-100 bg-[#F2F2F2]"
            >
                {t.goats.certSection}
            </th>
            <th
              colSpan={8}
              className="p-1 text-center border-r border-gray-100 bg-[#C5E0B4]"
            >
              {t.goats.motherData}
            </th>
            <th
              colSpan={8}
              className="p-1 text-center border-r border-gray-100 bg-[#F8CBAD]"
            >
              {t.goats.fatherData}
            </th>
            <th
              colSpan={8}
              className="p-1 text-center border-r border-gray-100 bg-[#B4E0E0]"
            >
              {t.goats.certSection}
            </th>
            <th
              colSpan={8}
              className="p-1 text-center border-r border-gray-100 bg-[#B4E0B4]"
            >
              {t.goats.productivitySection}
            </th>
            <th colSpan={4} className="p-1 text-center bg-[#F2F2F2]">
              {t.common.metadata || "Metadata"}
            </th>
          </tr>
          {/* BOTTOM HEADER - FIELDS */}
          <tr className="text-sm font-bold uppercase tracking-tight text-gray-700 border-b border-gray-300">
            <th className="p-1  px-5 border-r text-center text-nowrap border-gray-300 sticky left-0 bg-white z-40 min-w-[150px] text-[#491907]">
              {t.goats.nickname}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#F0F7F0] text-[#491907]">
              {t.goats.breed}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#F0F7F0] text-[#491907]">
              {t.goats.sex}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#F0F7F0] text-[#491907]">
              {t.goats.abgMember}
            </th>
            <th className="p-1 px-5 border-r text-center min-w-[100px] text-nowrap border-gray-200 bg-[#E2F0D9]">
              {t.goats.farm}
            </th>
            <th className="p-1 px-5 border-r text-center min-w-[100px] text-nowrap border-gray-200 bg-[#E2F0D9]">
              {t.goats.breeder}
            </th>
            <th className="p-1 px-5 border-r text-center min-w-[100px] text-nowrap border-gray-200 bg-[#E2F0D9]">
              {t.goats.owner}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#E2F0D9]">
              {t.goats.birthDate}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#E2F0D9]">
              {t.goats.birthWeight}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#E2F0D9]">
              {t.goats.bornQty}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#E2F0D9]">
              {t.goats.hornedness}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#E2F0D9]">
              {t.goats.genPassport}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#E2F0D9]">
              {t.goats.genetic}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#E2F0D9]">
              {t.goats.registryCode}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#E2F0D9]">
              {t.goats.idUa}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#E2F0D9]">
              {t.goats.idAbg}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#E2F0D9]">
              {t.goats.idFx}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#E2F0D9]">
              {t.goats.chipId}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#E2F0D9]">
              {t.goats.idInt}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#E2F0D9]">
              {t.goats.brand}
            </th>

            {/* Certificate Group */}
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-100 bg-[#F2F2F2]">
              {t.goats.certSeries}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-100 bg-[#F2F2F2]">
              {t.goats.certNum}
            </th>

            {/* Mother Group */}
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#C5E0B4]">
              {t.goats.nickname} (M)
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#C5E0B4]">
              {t.goats.registryCode}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#C5E0B4]">
              {t.goats.idUa}
            </th>
            <th className="p-1 px-5 border-r  text-center text-nowrap border-gray-200 bg-[#C5E0B4]">
              {t.goats.idAbg}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#C5E0B4]">
              {t.goats.idFx}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap  border-gray-200 bg-[#C5E0B4]">
              {t.goats.chipId}
            </th>
            <th className="p-1 px-5 border-r  text-center text-nowrap border-gray-200 bg-[#C5E0B4]">
              {t.goats.idInt}
            </th>
            <th className="p-1 px-5 border-r  text-center text-nowrap border-gray-200 bg-[#C5E0B4]">
              {t.goats.brand}
            </th>

            {/* Father Group */}
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#F8CBAD]">
              {t.goats.nickname} (F)
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#F8CBAD]">
              {t.goats.registryCode}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#F8CBAD]">
              {t.goats.idUa}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#F8CBAD]">
              {t.goats.idAbg}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#F8CBAD]">
              {t.goats.idFx}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#F8CBAD]">
              {t.goats.chipId}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#F8CBAD]">
              {t.goats.idInt}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#F8CBAD]">
              {t.goats.brand}
            </th>

            {/* Cert Group */}
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#B4E0E0]">
              {t.goats.certType}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#B4E0E0]">
              {t.goats.score}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#B4E0E0]">
              {t.goats.certHeightWithers}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#B4E0E0]">
              {t.goats.certHeightSacrum}
            </th>
            <th className="p-1 px-5 border-r  text-center text-nowrap border-gray-200 bg-[#B4E0E0]">
              {t.goats.certChestCirc}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#B4E0E0]">
              {t.goats.certBodyLength}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#B4E0E0]">
              {t.goats.certClass}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#B4E0E0]">
              {t.goats.certCategory}
            </th>

            {/* Productivity Group */}
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#B4E0B4]">
              {t.goats.lactViewer}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#B4E0B4]">
              {t.goats.lactNo}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#B4E0B4]">
              {t.goats.lactDays}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#B4E0B4]">
              {t.goats.lactMilk}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#B4E0B4]">
              {t.goats.lactFat}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#B4E0B4]">
              {t.goats.lactProtein}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#B4E0B4]">
              {t.goats.lactMilkDay}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#B4E0B4]">
              {t.goats.lactGraph}
            </th>

            {/* Meta Group */}
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#F2F2F2]">
              {t.goats.dateAdded}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#F2F2F2]">
              {t.goats.source}
            </th>
            <th className="p-1 px-5 min-w-[80px] text-center text-nowrap bg-[#4D2C1A] text-white border-l border-white/20">
              {t.goats.status}
            </th>
            <th className="p-1 px-5 border-r text-center text-nowrap border-gray-200 bg-[#F2F2F2]">
              {t.goats.notes}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {goats.map((g, idx) => {
            let rowBg = 'bg-white';
            if (g.status === 0) rowBg = 'bg-[#EF9A9A]/30';
            else if (g.is_reg === 1 || g.is_reg === true) rowBg = 'bg-[#D7FDB5]/30';
            else rowBg = 'bg-[#F3F1F1]/40';

            return (
              <tr
                key={idx}
                className={`divide-x divide-gray-200 hover:bg-blue-100/50 transition-all text-sm font-bold text-gray-800 h-8 ${rowBg}`}
              >
                <td className={`p-1 sticky px-4 left-0 z-20 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.05)] whitespace-nowrap bg-inherit`}>
                  <div className="flex items-center gap-1.5 min-h-[20px]">
                    {g.ava ? (
                      <img
                        src={g.ava.startsWith('http') || g.ava.startsWith('/') ? g.ava : `/uploads/${g.ava}`}
                        alt=""
                        className="w-10 h-8 object-cover rounded shadow-sm border border-gray-100"
                      />
                    ) : (
                      <div className="w-10 h-8 bg-gray-100 rounded border border-gray-100 flex items-center justify-center text-[10px] text-gray-300 font-black">
                        NO IMG
                      </div>
                    )}
                    {isGuest ? (
                      <span className="text-[#491907] font-bold">{g.name}</span>
                    ) : (
                      <Link
                        href={`/goats/${g.id}`}
                        className="hover:text-blue-600 underline text-[#491907]"
                      >
                        {g.name}
                      </Link>
                    )}
                  </div>
                </td>
              <td className="p-1 text-center font-black text-nowrap px-4 opacity-80 uppercase leading-tight">
                {g.breed_name || g.breed_alias}
              </td>
              <td className="p-1 px-4 text-center font-black">
                {g.sex === 1 ? "Buck" : "Doe"}
              </td>
              <td className="p-1 text-center">{g.is_abg ? "Yes" : "No"}</td>
              <td className="p-1 text-nowrap text-center  ">
                {g.farm_name || "-"}
              </td>
              <td className="p-1 text-nowrap text-center   ">{g.manuf || "-"}</td>
              <td className="p-1 text-nowrap text-center  ">{g.owner || "-"}</td>
              <td className="p-1 text-center whitespace-nowrap font-mono text-xs min-w-[120px]">
                {g.date_born
                  ? new Date(g.date_born).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "-"}
              </td>
              <td className="p-1 text-center font-mono">
                {g.born_weight || "-"}
              </td>
              <td className="p-1 text-center font-mono">{g.born_qty || "-"}</td>
              <td className="p-1 text-center font-black">
                {g.horns_type === 1 || g.horns_type === '1' ? "TO" : 
                 g.horns_type === 2 || g.horns_type === '2' ? "ABOUT" : 
                 g.horns_type === 3 || g.horns_type === '3' ? "R" : "-"}
              </td>
              <td className="p-1 text-center">
                {g.have_gen === 1 || g.have_gen === '1' || g.have_gen === true ? "Yes" : "No"}
              </td>
              <td className="p-1 text-center">{g.gen_mat || "-"}</td>
              <td className="p-1 text-center text-red-700 font-black">
                {(g.is_reg === '1' || g.is_reg === 1 || g.is_reg === true ? "R" : "X") + (10000 + Number(g.id || g.reg_id))}
              </td>
              <td className="p-1 text-center px-4 text-nowrap font-mono">{g.code_ua || "-"}</td>
              <td className="p-1 text-center px-4 text-nowrap font-mono">{g.code_abg || "-"}</td>
              <td className="p-1 text-center px-4 text-nowrap font-mono">
                {g.code_farm || "-"}
              </td>
              <td className="p-1 text-center px-4 text-nowrap font-mono">
                {g.code_chip || "-"}
              </td>
              <td className="p-1 text-center px-4 text-nowrap font-mono">{g.code_int || "-"}</td>
              <td className="p-1 text-center px-4 text-nowrap font-mono">{g.code_brand || "-"}</td>

              {/* Certificate fields */}
              <td className="p-1 text-center px-4 text-nowrap bg-[#F2F2F2]/50">
                {g.cert_serial || "-"}
              </td>
              <td className="p-1 text-center px-4 text-nowrap bg-[#F2F2F2]/50">
                {g.cert_no || "-"}
              </td>

              {/* Mother fields */}
              <td className="p-1 px-4 text-nowrap text-blue-600 truncate   bg-[#C5E0B4]/10">
                {g.m_id ? (
                  isGuest ? (
                    <span className="text-gray-700">{g.m_name}</span>
                  ) : (
                    <Link href={`/goats/${g.m_id}`} className="hover:underline">
                      {g.m_name}
                    </Link>
                  )
                ) : (
                  "-"
                )}
              </td>
              <td className="p-1 px-4 text-nowrap text-center bg-[#C5E0B4]/10 font-mono">
                {g.m_id || "-"}
              </td>
              <td className="p-1 px-4 text-nowrap text-center bg-[#C5E0B4]/10 font-mono">
                {g.m_code_ua || "-"}
              </td>
              <td className="p-1 px-4 text-red-600 text-nowrap text-center bg-[#C5E0B4]/10 font-mono">
                {g.m_code_abg || "-"}
              </td>
              <td className="p-1 px-4 text-nowrap text-center bg-[#C5E0B4]/10 font-mono">
                {g.m_code_farm || "-"}
              </td>
              <td className="p-1 px-4 text-nowrap text-center bg-[#C5E0B4]/10 font-mono">
                {g.m_code_chip || "-"}
              </td>
              <td className="p-1 px-4 text-red-600 text-nowrap text-center bg-[#C5E0B4]/10 font-mono">
                {g.m_code_int || "-"}
              </td>
              <td className="p-1 px-4 text-nowrap text-center bg-[#C5E0B4]/10">
                {g.m_code_brand || "-"}
              </td>

              {/* Father fields */}
              <td className="p-1 px-4 text-nowrap text-blue-600 truncate   bg-[#F8CBAD]/10">
                {g.f_id ? (
                  isGuest ? (
                    <span className="text-gray-700">{g.f_name}</span>
                  ) : (
                    <Link href={`/goats/${g.f_id}`} className="hover:underline">
                      {g.f_name}
                    </Link>
                  )
                ) : (
                  "-"
                )}
              </td>
              <td className="p-1 text-center bg-[#F8CBAD]/10 font-mono">
                {g.f_id || "-"}
              </td>
              <td className="p-1 px-4 text-nowrap text-center bg-[#F8CBAD]/10 font-mono">
                {g.f_code_ua || "-"}
              </td>
              <td className="p-1 px-4 text-nowrap text-red-600 text-center bg-[#F8CBAD]/10 font-mono">
                {g.f_code_abg || "-"}
              </td>
              <td className="p-1 px-4 text-nowrap text-center bg-[#F8CBAD]/10 font-mono">
                {g.f_code_farm || "-"}
              </td>
              <td className="p-1 px-4 text-nowrap text-center bg-[#F8CBAD]/10 font-mono">
                {g.f_code_chip || "-"}
              </td>
              <td className="p-1 px-4 text-nowrap text-red-600 text-center bg-[#F8CBAD]/10 font-mono">
                {g.f_code_int || "-"}
              </td>
              <td className="p-1 px-4 text-nowrap text-center bg-[#F8CBAD]/10 font-mono">
                {g.f_code_brand || "-"}
              </td>

              {/* Certification fields */}
              <td className="p-1 px-4 text-nowrap text-center bg-[#B4E0E0]/10">
                {g.test_type
                  ? g.test_type === 1
                    ? "Classical"
                    : "Young"
                  : "-"}
              </td>
              <td className="p-1 px-4 text-nowrap text-center text-red-600 font-extrabold bg-[#B4E0B4]/5">
                {g.score_total || "-"}
              </td>
              <td className="p-1 px-4 text-nowrap text-center bg-[#B4E0E0]/5 font-mono">
                {g.par_1 || "-"}
              </td>
              <td className="p-1 px-4 text-nowrap text-center bg-[#B4E0E0]/5 font-mono">
                {g.par_2 || "-"}
              </td>
              <td className="p-1 px-4 text-nowrap text-center bg-[#B4E0E0]/5 font-mono">
                {g.par_3 || "-"}
              </td>
              <td className="p-1 px-4 text-nowrap text-center bg-[#B4E0E0]/5 font-mono">
                {g.par_4 || "-"}
              </td>
              <td className="p-1 px-4 text-nowrap text-center bg-[#B4E0E0]/5">
                {g.cert_class || "-"}
              </td>
              <td className="p-1 px-4 text-nowrap text-center bg-[#B4E0E0]/5">
                {g.category || "-"}
              </td>

              {/* Productivity fields */}
              <td className="p-1  px-4 text-nowrap text-center bg-[#B4E0B4]/10">
                {g.viewer || "-"}
              </td>
              <td className="p-1 px-4 text-nowrap text-center bg-[#B4E0B4]/10 font-mono">
                {g.lact_no || "-"}
              </td>
              <td className="p-1 px-4 text-nowrap text-center bg-[#B4E0B4]/10 font-mono">
                {g.lact_days || "-"}
              </td>
              <td className="p-1 px-4 text-nowrap text-center text-red-700 font-black bg-[#B4E0B4]/10 font-mono">
                {g.milk || "-"}
              </td>
              <td className="p-1 px-4 text-nowrap text-center bg-[#B4E0B4]/10 font-mono">
                {g.fat || "-"}
              </td>
              <td className="p-1 px-4 text-nowrap text-center bg-[#B4E0B4]/10 font-mono">
                {g.protein || "-"}
              </td>
              <td className="p-1 px-4 text-nowrap text-center bg-[#B4E0B4]/10 font-mono">
                {g.milk_day || "-"}
              </td>
              <td className="p-1 px-4 text-nowrap text-center bg-[#B4E0B4]/10">
                {g.have_graph ? "Yes" : "No"}
              </td>

              {/* Meta fields */}
              <td className="p-1 px-4 text-nowrap text-center font-mono text-sm min-w-[120px]">
                {g.time_added
                  ? new Date(g.time_added).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "-"}
              </td>
              <td className="p-1 px-4 text-nowrap   italic">
                {g.source || "-"}
              </td>
              <td className="p-1 px-4 text-nowrap min-w-[80px] text-center font-bold">
                {g.status === 1 || g.status === "1" ? (
                  <span className="text-green-600">Alive</span>
                ) : g.status === 0 || g.status === "0" ? (
                  <span className="text-red-600">Dead</span>
                ) : (
                  <span className="text-gray-500">No info</span>
                )}
              </td>
              <td className="p-1 px-4 text-nowrap   italic text-sm    border-l border-gray-200">
                {g.special || "-"}
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
