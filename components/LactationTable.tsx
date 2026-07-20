'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { selectOfficialLactationAction, deleteLactationAction } from '@/lib/actions';

interface LactationTableProps {
  ancestorLacts: any;
  descendantLacts?: any[];
  goatId: string | number;
  currentSelectedId: number | null;
  lang: string;
  t: any;
}

export default function LactationTable({
  ancestorLacts,
  descendantLacts = [],
  goatId,
  currentSelectedId,
  lang,
  t,
}: LactationTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const allLacts: any[] = [];

  // ── ANCESTORS (and SELF): de-duplicate by goat ID, female-only filter (except self)
  const uniqueAncestorNodes = new Map<number, { id: number; name: string; maxLevel: number }>();

  Object.entries(ancestorLacts).forEach(([path, node]: [string, any]) => {
    if (!node || !node.id) return;

    const isSelf = Number(node.id) === Number(goatId);
    // Keep self always; skip male ancestors
    if (node.sex === 1 && !isSelf) return;

    const level = path.length - 2; // "ME" → 0, "MEM" → 1, etc.
    const existing = uniqueAncestorNodes.get(Number(node.id));
    if (!existing || level > existing.maxLevel) {
      uniqueAncestorNodes.set(Number(node.id), {
        id: Number(node.id),
        name: node.name,
        maxLevel: level,
      });
    }
  });

  uniqueAncestorNodes.forEach(node => {
    const pathNode = Object.values(ancestorLacts).find(
      (n: any) => n && Number(n.id) === node.id,
    ) as any;
    const lactations = pathNode?.ownLactations || pathNode?.lactations || [];

    lactations.forEach((l: any) => {
      const isSelf = node.id === Number(goatId);
      allLacts.push({
        ...l,
        id_goat: l.id_goat || node.id,
        _isSelf: isSelf,
        _isDescendant: false,
        // For self: no prefix, for ancestors: "Pr: (N)"
        relationLabel: isSelf ? '' : `Pr: (${node.maxLevel})`,
        goatName: node.name,
      });
    });
  });

  // ── DESCENDANTS: de-duplicate by goat ID (include all descendants)
  const uniqueDescendantIds = new Set<number>();
  descendantLacts.forEach((d: any) => {
    if (!d || !d.id || uniqueDescendantIds.has(Number(d.id))) return;
    uniqueDescendantIds.add(Number(d.id));

    d.lactations.forEach((l: any) => {
      allLacts.push({
        ...l,
        id_goat: l.id_goat || d.id,
        _isSelf: false,
        _isDescendant: true,
        // Old site uses "Пт:" (Russian) → in English "Fri:" based on old site screenshots
        relationLabel: lang === 'ru' ? `Пт: (${d.level})` : `Fri: (${d.level})`,
        goatName: d.name,
      });
    });
  });

  // Sort all lactations by their record ID (insertion order) – matches old MySQL default order
  allLacts.sort((a, b) => Number(a.id) - Number(b.id));

  // Red highlighting for max values
  const maxMilk    = allLacts.length > 0 ? Math.max(...allLacts.map(l => parseFloat(l.milk) || 0)) : 0;
  const maxFat     = allLacts.length > 0 ? Math.max(...allLacts.map(l => parseFloat(l.fat) || 0)) : 0;
  const maxProtein = allLacts.length > 0 ? Math.max(...allLacts.map(l => parseFloat(l.protein) || 0)) : 0;

  let ownEditCounter = 0; // intentionally kept for potential future sequential labelling

  const handleSelectLact = async (lactId: number) => {
    setLoadingId(lactId);
    try {
      const result = await selectOfficialLactationAction(goatId, lactId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || 'Error selecting lactation');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteLact = async (goatId: number | string, lactId: number) => {
    const confirmed = window.confirm(
      lang === 'ru'
        ? 'Вы уверены, что хотите удалить эту запись о лактации?'
        : 'Are you sure you want to delete this lactation record?'
    );
    if (!confirmed) return;

    setLoadingId(lactId);
    try {
      const result = await deleteLactationAction(goatId, lactId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || 'Error deleting lactation');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-x-auto border-2 border-[#4D2C1A] rounded-lg">
      <table className="w-full text-center text-xs border-collapse font-bold uppercase whitespace-nowrap text-black">
        <thead className="bg-[#23DC69] text-black border-b-2 border-[#4D2C1A]">
          <tr className="divide-x-2 divide-[#4D2C1A]">
            <th className="p-2.5 w-16">{lang === 'ru' ? '№' : 'No.'}</th>
            <th className="p-2.5 text-center">{lang === 'ru' ? 'Потомок/предок' : 'Descendant/Ancestor'}</th>
            <th className="p-2.5">{t.goats.lactNo}</th>
            <th className="p-2.5">{t.goats.lactDays}</th>
            <th className="p-2.5">{t.goats.lactMilk}</th>
            <th className="p-2.5">{t.goats.lactFat}</th>
            <th className="p-2.5">{t.goats.lactProtein}</th>
            <th className="p-2.5">{t.goats.lactMilkDay}</th>
            <th className="p-2.5">{t.goats.lactGraph}</th>
            <th className="p-2.5">{lang === 'ru' ? 'Испр' : 'Correction'}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#4D2C1A] divide-x-2">
          {allLacts.map((l: any, idx: number) => {
            const isSelected   = Number(l.id) === Number(currentSelectedId);
            const isMilkMax    = parseFloat(l.milk) > 0 && parseFloat(l.milk) === maxMilk;
            const isFatMax     = parseFloat(l.fat) > 0 && parseFloat(l.fat) === maxFat;
            const isProteinMax = parseFloat(l.protein) > 0 && parseFloat(l.protein) === maxProtein;

            const rowBg = isSelected
              ? 'bg-[#93E7F8] hover:bg-[#82D6E7]'
              : idx % 2 === 0
              ? 'bg-[#E2F0D9] hover:bg-[#D4E4CC]'
              : 'bg-[#FCFAF0] hover:bg-[#F2EFE0]';

            // Counter for own-record edit links (sequential number: 1, 2, 3…)
            if (l._isSelf) ownEditCounter++;

            return (
              <tr
                key={`${l.id}-${idx}`}
                className={`${rowBg} divide-x-2 divide-[#4D2C1A] transition-colors h-10`}
              >
                {/* Row number – click to select as official lactation */}
                <td className="p-2 text-center font-black">
                  <button
                    onClick={() => handleSelectLact(l.id)}
                    disabled={loadingId !== null}
                    className={`underline cursor-pointer font-bold ${isSelected ? 'text-blue-900 font-black' : 'text-blue-600 hover:text-blue-800'}`}
                    title={lang === 'ru' ? 'Выбрать эту продуктивность' : 'Select this record'}
                  >
                    {loadingId === l.id ? '…' : idx + 1}
                  </button>
                </td>

                {/* Descendant/Ancestor column:
                    - own: plain bold BLACK text (no link), use viewer field = short name like "Flora"
                    - ancestor: "Pr: (N) Name" as a blue link
                    - descendant: "Fri: (N) Name" as a blue link */}
                <td className="p-2 px-4 text-center font-black">
                  {l._isSelf ? (
                    // Own record: viewer field has the short display name ("Flora"), not the full name
                    <span className="text-black font-black">
                      {l.viewer || l.goatName}
                    </span>
                  ) : (
                    <>
                      {l.relationLabel && (
                        <span className="text-gray-500/60 mr-1">{l.relationLabel}</span>
                      )}
                      <Link
                        href={`/goats/${l.id_goat}`}
                        className="text-blue-600 hover:text-blue-800 underline font-bold"
                      >
                        {l.goatName}
                      </Link>
                    </>
                  )}
                </td>

                <td className="p-2 text-center">{l.lact_no}</td>
                <td className="p-2 text-center">{l.lact_days}</td>
                <td className={`p-2 text-center font-black ${isMilkMax ? 'text-red-600 font-black scale-105' : ''}`}>
                  {l.milk}
                </td>
                <td className={`p-2 text-center font-bold ${isFatMax ? 'text-red-600 font-black scale-105' : ''}`}>
                  {l.fat}
                </td>
                <td className={`p-2 text-center font-bold ${isProteinMax ? 'text-red-600 font-black scale-105' : ''}`}>
                  {l.protein}
                </td>
                <td className="p-2 text-center">{l.milk_day || l.avg_yield || '-'}</td>
                <td className="p-2 text-center">
                  {l.have_graph ? (
                    <span className="text-blue-700 font-bold italic">{t.users.yes}</span>
                  ) : (
                    t.users.no
                  )}
                </td>

                {/* Correction column:
                    - all records: Edit and Delete buttons */}
                <td className="p-2 text-center text-xs space-x-2">
                  <Link
                    href={`/goats/${l.id_goat}/lact?row=${l.id}`}
                    className="text-blue-600 hover:text-blue-800 underline font-bold"
                  >
                    {lang === 'ru' ? 'Исправить' : 'Edit'}
                  </Link>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => handleDeleteLact(l.id_goat, l.id)}
                    disabled={loadingId !== null}
                    className="text-red-600 hover:text-red-800 underline font-bold cursor-pointer disabled:opacity-50"
                  >
                    {lang === 'ru' ? 'Удалить' : 'Delete'}
                  </button>
                </td>
              </tr>
            );
          })}
          {allLacts.length === 0 && (
            <tr>
              <td
                colSpan={10}
                className="py-12 text-gray-400 font-bold text-center bg-white"
              >
                {t.catalog.empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
