'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteLactationAction } from '@/lib/actions';

interface DeleteLactationButtonProps {
  goatId: string | number;
  rowId: string | number;
  lang: string;
}

export default function DeleteLactationButton({ goatId, rowId, lang }: DeleteLactationButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    const confirmed = window.confirm(
      lang === 'ru'
        ? 'Вы уверены, что хотите удалить эту запись о лактации?'
        : 'Are you sure you want to delete this lactation record?'
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const result = await deleteLactationAction(goatId, rowId);
      if (result.success) {
        router.push(`/goats/${goatId}`);
        router.refresh();
      } else {
        alert(result.error || 'Failed to delete record');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="bg-red-600 hover:bg-red-800 text-white font-black text-xs uppercase tracking-widest px-8 py-3 rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50"
    >
      {loading
        ? (lang === 'ru' ? 'Удаление...' : 'Deleting...')
        : (lang === 'ru' ? 'Удалить' : 'Delete')}
    </button>
  );
}
