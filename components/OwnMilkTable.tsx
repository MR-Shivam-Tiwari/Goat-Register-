'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { copyMilkToLactationAction, deleteOwnMilkAction } from '@/lib/actions';

interface OwnMilkTableProps {
  ownMilk: any[];
  goatId: string | number;
  lang: string;
  t: any;
}

export default function OwnMilkTable({ ownMilk, goatId, lang, t }: OwnMilkTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleCopyMilk = async (milkId: number) => {
    setLoadingId(milkId);
    try {
      const result = await copyMilkToLactationAction(goatId, milkId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || 'Error copying milk record');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteMilk = async (milkId: number) => {
    const confirmMsg =
      lang === 'ru'
        ? 'Вы уверены, что хотите удалить эту запись о продуктивности?'
        : lang === 'uk'
        ? 'Ви впевнені, що хочете видалити цей запис про продуктивність?'
        : 'Are you sure you want to delete this productivity record?';

    const confirmed = window.confirm(confirmMsg);
    if (!confirmed) return;

    setLoadingId(milkId);
    try {
      const result = await deleteOwnMilkAction(goatId, milkId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || 'Error deleting record');
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
            <th className="p-3 w-16">{t.goats.milkNo}</th>
            <th className="p-3">{t.goats.milkLactNo}</th>
            <th className="p-3">{t.goats.milkLactDays}</th>
            <th className="p-3">{t.goats.milkYield}</th>
            <th className="p-3">{t.goats.milkFat}</th>
            <th className="p-3">{t.goats.milkProtein}</th>
            <th className="p-3">{t.goats.milkLactose}</th>
            <th className="p-3">{t.goats.milkPeak}</th>
            <th className="p-3">{t.goats.milkAvg}</th>
            <th className="p-3">{t.goats.milkDensity}</th>
            <th className="p-3">{t.goats.milkFlow}</th>
            <th className="p-3">{t.goats.milkGraph}</th>
            <th className="p-3">{t.goats.milkSource}</th>
            <th className="p-3">{t.goats.milkCorrection}</th>
            <th className="p-3">{t.goats.milkAdded}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#4D2C1A] divide-x-2">
          {ownMilk.map((m: any, idx: number) => (
            <tr
              key={m.id || idx}
              className={`divide-x-2 divide-[#4D2C1A] hover:bg-gray-50 transition-colors h-10 ${
                idx % 2 === 0 ? 'bg-[#E2F0D9]' : 'bg-white'
              }`}
            >
              {/* Row number – click to copy to lactation table */}
              <td className="p-3 font-bold text-center">
                <button
                  onClick={() => handleCopyMilk(m.id)}
                  disabled={loadingId !== null}
                  className="underline cursor-pointer font-bold text-blue-600 hover:text-blue-800"
                  title={lang === 'ru' ? 'Перенести эту запись в лактации' : 'Copy this record to lactation list'}
                >
                  {loadingId === m.id ? '…' : idx + 1}
                </button>
              </td>
              <td className="p-3">{m.lact_no}</td>
              <td className="p-3">{m.lact_days}</td>
              <td className="p-3 text-red-700 font-black">{m.milk}</td>
              <td className="p-3">{m.fat}</td>
              <td className="p-3">{m.protein}</td>
              <td className="p-3">{m.lactose || '-'}</td>
              <td className="p-3">{m.peak_yield || '-'}</td>
              <td className="p-3">{m.avg_yield || '-'}</td>
              <td className="p-3">{m.density || '-'}</td>
              <td className="p-3">{m.flow_rate || '-'}</td>
              <td className="p-3">
                {m.have_graph ? (
                  <span className="text-blue-700 font-bold italic">{t.users.yes}</span>
                ) : (
                  t.users.no
                )}
              </td>
              <td className="p-3 truncate max-w-[150px]">{m.source || '-'}</td>
              <td className="p-3 text-center text-xs space-x-2">
                <Link
                  href={`/goats/${goatId}/milk?row=${m.id}`}
                  className="text-blue-600 hover:underline font-bold"
                >
                  {t.goats.milkCorrection}
                </Link>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={() => handleDeleteMilk(m.id)}
                  disabled={loadingId !== null}
                  className="text-red-600 hover:underline font-bold cursor-pointer disabled:opacity-50"
                >
                  {lang === 'ru' ? 'Удалить' : lang === 'uk' ? 'Видалити' : 'Delete'}
                </button>
              </td>
              <td className="p-3 text-gray-600">
                {m.added
                  ? new Date(m.added).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : '-'}
              </td>
            </tr>
          ))}
          {ownMilk.length === 0 && (
            <tr>
              <td colSpan={15} className="py-12 text-gray-400 font-bold text-center">
                {t.goats.noMilkRecords}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
