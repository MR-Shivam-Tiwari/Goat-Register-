'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateCertValueAction } from '@/lib/actions';

interface LactOption {
  id: number;
  label: string; // pre-formatted: "Name/lact_no/lact_days/milk/fat/protein/milk_day"
}

interface CertLactSelectProps {
  goatId: string | number;
  fieldName: string;
  selectedId: number | string | null;
  // Either pass pre-built options OR raw lactations (legacy)
  options?: LactOption[];
  lactations?: Array<{
    id: number;
    lact_no: number;
    lact_days: number;
    milk: number;
    fat: number;
    protein: number;
    milk_day?: number;
    _ownerName?: string;
  }>;
  selectText: string;
}

export default function CertLactSelect({
  goatId,
  fieldName,
  selectedId,
  options,
  lactations = [],
  selectText,
}: CertLactSelectProps) {
  const router = useRouter();
  const [value, setValue] = useState(selectedId ? String(selectedId) : '');
  const [loading, setLoading] = useState(false);

  // Sync state with selectedId when server data changes
  useEffect(() => {
    setValue(selectedId ? String(selectedId) : '');
  }, [selectedId]);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setValue(val);
    setLoading(true);

    try {
      await updateCertValueAction(goatId, fieldName, val || null);
      router.refresh();
    } catch (err) {
      console.error('Failed to update cert select:', err);
    } finally {
      setLoading(false);
    }
  };

  // Build final list of options – use pre-built options if provided, else build from lactations
  const finalOptions: LactOption[] = options
    ? options
    : lactations.map(l => {
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

  // If there's a saved value that matches one of the options, show it as selected text
  const selectedOption = finalOptions.find(o => o.id === Number(value));

  return (
    <div className="relative w-full flex items-center">
      <select
        value={value}
        onChange={handleChange}
        disabled={loading}
        className={`w-full text-[11px] bg-white border border-gray-300 rounded p-1 outline-none font-bold shadow-sm focus:ring-1 focus:ring-[#491907]/20 transition-all cursor-pointer ${loading ? 'opacity-50' : ''}`}
      >
        <option value="">{selectText}</option>
        {finalOptions.map(opt => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
      {loading && (
        <span className="absolute right-6 top-1/2 -translate-y-1/2 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#491907] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#491907]"></span>
        </span>
      )}
    </div>
  );
}
