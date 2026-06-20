'use client';

import { useState } from 'react';

interface LactationRow {
  lact_no: any;
  lact_days: any;
  milk: any;
  fat: any;
  protein: any;
}

interface CertificateLactationTableProps {
  lactations: LactationRow[];
  cl1: any;
}

export default function CertificateLactationTable({ lactations, cl1 }: CertificateLactationTableProps) {
  // Always display exactly 5 rows. Pad the array with empty objects if it has fewer than 5 rows.
  const displayRows = [...lactations];
  while (displayRows.length < 5) {
    displayRows.push({
      lact_no: null,
      lact_days: null,
      milk: null,
      fat: null,
      protein: null,
    });
  }

  // Default: all rows are checked/enabled for print
  const [selected, setSelected] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    displayRows.forEach((_, i) => {
      initial[i] = true;
    });
    return initial;
  });

  const toggleSelected = (idx: number) => {
    setSelected(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="w-full">
      {/* Table Header Bar (Standalone Heading outside table) */}
      <div className="productive-table-header flex items-center justify-center text-center text-black py-1 mb-2 font-black text-[11.5px] uppercase select-none">
        <input
          className="w-full text-center bg-transparent border-none outline-none font-sans font-black tracking-wide text-[11.5px] uppercase text-black"
          defaultValue={cl1.tribalValue || 'BREEDING VALUE AND OWN PRODUCTIVITY OF THE ANIMAL'}
        />
      </div>

      <div className="overflow-x-auto w-full">
      <table className="productive-table w-full min-w-[480px] border-[1.5px] border-black text-center border-collapse">
        <thead>
          <tr className="bg-white text-black text-[9px] font-black uppercase h-7 divide-x divide-black border-b border-black">
            <th className="w-[5%] border-black">V</th>
            <th colSpan={2} className="uppercase text-[9px] border-black p-0">
              <input
                className="w-full h-full border-none outline-none text-center bg-transparent text-[9px] font-black uppercase text-black"
                defaultValue={cl1.lactHeader || 'LACTATION'}
              />
            </th>
            <th colSpan={2} className="uppercase text-[9px] border-black p-0">
              <input
                className="w-full h-full border-none outline-none text-center bg-transparent text-[9px] font-black uppercase text-black"
                defaultValue={cl1.milkHeader || 'MILK YIELD'}
              />
            </th>
            <th colSpan={2} className="uppercase text-[9px] border-black p-0">
              <input
                className="w-full h-full border-none outline-none text-center bg-transparent text-[9px] font-black uppercase text-black"
                defaultValue={cl1.fatHeader || 'MILK FAT'}
              />
            </th>
            <th colSpan={2} className="uppercase text-[9px] border-black p-0">
              <input
                className="w-full h-full border-none outline-none text-center bg-transparent text-[9px] font-black uppercase text-black"
                defaultValue={cl1.proteinHeader || 'MILK PROTEIN'}
              />
            </th>
          </tr>
          <tr className="bg-white text-black text-[8px] font-black uppercase h-6 divide-x divide-black border-b border-black">
            <th className="border-black"></th>
            <th className="border-black w-[10%] p-0">
              <input
                className="w-full h-full border-none outline-none text-center bg-transparent text-[8px] font-black uppercase text-black"
                defaultValue={cl1.lactNo || '№'}
              />
            </th>
            <th className="border-black w-[14%] p-0">
              <input
                className="w-full h-full border-none outline-none text-center bg-transparent text-[8px] font-black uppercase text-black"
                defaultValue={cl1.lactDays || 'DAYS'}
              />
            </th>
            <th className="border-black w-[19%] p-0">
              <input
                className="w-full h-full border-none outline-none text-center bg-transparent text-[8px] font-black uppercase text-black"
                defaultValue={cl1.milkKg || 'KG'}
              />
            </th>
            <th className="border-black w-[10%] p-0">
              <input
                className="w-full h-full border-none outline-none text-center bg-transparent text-[8px] font-black uppercase text-black"
                defaultValue={cl1.milkClass || 'CLASS'}
              />
            </th>
            <th className="border-black w-[11%] p-0">
              <input
                className="w-full h-full border-none outline-none text-center bg-transparent text-[8px] font-black uppercase text-black"
                defaultValue={cl1.fatPercent || '%'}
              />
            </th>
            <th className="border-black w-[9%] p-0">
              <input
                className="w-full h-full border-none outline-none text-center bg-transparent text-[8px] font-black uppercase text-black"
                defaultValue={cl1.fatClass || 'CLASS'}
              />
            </th>
            <th className="border-black w-[11%] p-0">
              <input
                className="w-full h-full border-none outline-none text-center bg-transparent text-[8px] font-black uppercase text-black"
                defaultValue={cl1.proteinPercent || '%'}
              />
            </th>
            <th className="border-black w-[9%] p-0">
              <input
                className="w-full h-full border-none outline-none text-center bg-transparent text-[8px] font-black uppercase text-black"
                defaultValue={cl1.proteinClass || 'CLASS'}
              />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black font-bold">
          {displayRows.map((l, i) => {
            const isChecked = selected[i] ?? true;
            return (
              <tr
                key={i}
                className={`h-7 text-[10.5px] leading-tight divide-x divide-black ${
                  isChecked ? 'text-black font-bold bg-white' : 'text-gray-400 print:hidden'
                }`}
              >
                {/* Checkbox */}
                <td className="border-black p-0 text-center align-middle w-[5%] select-none">
                  <div className="flex justify-center items-center h-full">
                    <button
                      type="button"
                      onClick={() => toggleSelected(i)}
                      className="no-print flex justify-center items-center w-5 h-5 border border-gray-400 rounded cursor-pointer bg-white hover:border-[#5C2A18] transition-all"
                    >
                      {isChecked && (
                        <svg className="w-4 h-4 text-[#2e7d32]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    {/* Print: show checkbox symbol */}
                    <span className="print-only hidden text-black font-black text-[12px]">{isChecked ? '✓' : ''}</span>
                  </div>
                </td>

                <td className="border-black w-[10%] p-0">
                  <input
                    className="w-full h-full border-none outline-none text-center bg-transparent text-[10.5px] font-black text-black"
                    defaultValue={l.lact_no ?? ''}
                  />
                </td>
                <td className="border-black w-[14%] p-0">
                  <input
                    className="w-full h-full border-none outline-none text-center bg-transparent text-[10.5px] font-bold text-black"
                    defaultValue={l.lact_days ?? ''}
                  />
                </td>
                <td className="border-black w-[19%] p-0">
                  <input
                    className="w-full h-full border-none outline-none text-center bg-transparent text-[10.5px] font-black text-black"
                    defaultValue={l.milk ?? ''}
                  />
                </td>
                <td className="border-black w-[10%] p-0">
                  <input
                    className="w-full h-full border-none outline-none text-center bg-transparent text-[10px] font-bold text-black"
                    defaultValue=""
                  />
                </td>
                <td className="border-black w-[11%] p-0">
                  <input
                    className="w-full h-full border-none outline-none text-center bg-transparent text-[10.5px] font-bold text-black"
                    defaultValue={l.fat ?? ''}
                  />
                </td>
                <td className="border-black w-[9%] p-0">
                  <input
                    className="w-full h-full border-none outline-none text-center bg-transparent text-[10px] font-bold text-black"
                    defaultValue=""
                  />
                </td>
                <td className="border-black w-[11%] p-0">
                  <input
                    className="w-full h-full border-none outline-none text-center bg-transparent text-[10.5px] font-bold text-black"
                    defaultValue={l.protein ?? ''}
                  />
                </td>
                <td className="border-black w-[9%] p-0">
                  <input
                    className="w-full h-full border-none outline-none text-center bg-transparent text-[10px] font-bold text-black"
                    defaultValue=""
                  />
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
