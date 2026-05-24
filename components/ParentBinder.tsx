'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { bindParentAction } from '@/lib/actions';

interface ParentBinderProps {
  goatId: string | number;
  bindAs: 'f' | 'm';
  label: string;
  lang: string;
  t: any;
}

export default function ParentBinder({
  goatId,
  bindAs,
  label,
  lang,
  t,
}: ParentBinderProps) {
  const router = useRouter();
  const [parentCode, setParentCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBind = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('goatId', String(goatId));
      formData.append('parentCode', parentCode);
      formData.append('bindAs', bindAs);

      const result = await bindParentAction(formData);

      if (result.success) {
        setParentCode('');
        router.refresh();
      } else {
        setError(result.error || (lang === 'ru' ? 'Ошибка связи' : 'Binding error'));
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const addHref = `/catalog/goats/add?sex=${bindAs === 'f' ? 'male' : 'female'}&bind_to=${goatId}&bind_as=${bindAs}`;

  return (
    <div className="flex flex-col gap-1 w-full max-w-[280px]">
      <span className="text-gray-400 font-bold text-[10px] tracking-widest uppercase">
        {label}
      </span>
      <form onSubmit={handleBind} className="flex gap-2 items-center">
        <input
          type="text"
          value={parentCode}
          onChange={(e) => setParentCode(e.target.value)}
          placeholder={lang === 'ru' ? 'Реестровый № (напр. R10408)' : 'Registry No. (e.g. R10408)'}
          disabled={loading}
          className="border-2 border-gray-100 rounded px-2.5 py-1 text-xs font-bold text-[#491907] focus:border-[#491907] outline-none h-8 w-44 bg-[#FDFBF7]/40 shadow-sm transition-all"
        />
        <button
          type="submit"
          disabled={loading || !parentCode.trim()}
          className="bg-[#491907] hover:bg-black text-white font-black text-[10px] uppercase tracking-wider px-3.5 py-1 rounded h-8 transition-all disabled:opacity-50 flex items-center justify-center min-w-[70px] shadow-sm"
        >
          {loading ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            lang === 'ru' ? 'Связать' : 'Link'
          )}
        </button>
      </form>
      <div className="flex items-center gap-3 pl-1">
        <a
          href={addHref}
          className={`text-[11px] font-black uppercase tracking-wider transition-colors ${bindAs === 'f' ? 'text-blue-600 hover:text-blue-800' : 'text-pink-600 hover:text-pink-800'}`}
        >
          + {lang === 'ru' ? 'Добавить' : 'Add'}
        </a>
        {error && (
          <span className="text-[9px] text-red-600 font-black uppercase truncate max-w-[180px] animate-pulse">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
