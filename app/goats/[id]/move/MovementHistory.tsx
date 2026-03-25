'use client';

import { useEffect, useState } from 'react';

export default function MovementHistory({ goatId, t }: { goatId: string, t: any }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/goats/${goatId}/move`)
      .then(res => res.json())
      .then(data => {
        setHistory(data.history || []);
        setLoading(false);
      });
  }, [goatId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-6 h-6 border-2 border-[#491907]/10 border-t-[#491907] rounded-full animate-spin"></div>
      <div className="text-gray-300 font-black uppercase text-[9px] tracking-[0.3em]">Syncing...</div>
    </div>
  );

  if (history.length === 0) return (
    <div className="bg-white rounded-lg p-16 text-center border border-gray-100 shadow-sm">
      <div className="text-gray-300 font-black uppercase text-[9px] tracking-[0.3em] mb-3">No movement history</div>
      <p className="text-gray-300 text-[9px] font-medium max-w-xs mx-auto leading-relaxed">This animal has remained in its current location since registration.</p>
    </div>
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100 shadow-sm bg-white">
      <table className="w-full text-center text-[9px] border-collapse font-black uppercase whitespace-nowrap">
        <thead className="bg-red-200 border-b border-gray-100 text-[#491907]">
          <tr className="divide-x divide-white">
            <th className="p-3">Transfer Date</th>
            <th className="p-3">Origin Farm</th>
            <th className="p-3">Destination</th>
            <th className="p-3">Return Date</th>
            <th className="p-3">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {history.map((item) => (
            <tr key={item.id} className="divide-x divide-gray-100 hover:bg-gray-50/50 transition-colors">
              <td className="p-3 text-[#491907]">
                {new Date(item.time_added).toLocaleDateString()}
              </td>
              <td className="p-3 text-gray-400">
                 {item.farm_from_name || (item.id_farm_of === 0 ? "Without farm" : "Unknown")}
              </td>
              <td className="p-3 text-[#491907]">
                {item.farm_to_name || "-"}
              </td>
              <td className="p-3 text-amber-600">
                 {item.date_return ? new Date(item.date_return).toLocaleDateString() : '-'}
              </td>
              <td className="p-3 text-gray-400 capitalize italic truncate max-w-[200px]">
                 {item.info || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
