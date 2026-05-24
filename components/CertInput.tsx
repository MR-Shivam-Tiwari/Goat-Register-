'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateCertValueAction } from '@/lib/actions';

interface CertInputProps {
  goatId: string | number;
  fieldName: string;
  defaultValue: string;
  placeholder?: string;
  className?: string;
}

export default function CertInput({
  goatId,
  fieldName,
  defaultValue,
  placeholder = '---',
  className = '',
}: CertInputProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setValue(defaultValue || '');
  }, [defaultValue]);

  const handleSave = async () => {
    if (value === defaultValue) return;
    setLoading(true);

    try {
      await updateCertValueAction(goatId, fieldName, value || null);
      router.refresh();
    } catch (err) {
      console.error('Failed to save cert value:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
      e.currentTarget.blur();
    }
  };

  return (
    <div className="relative w-full flex items-center">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={loading}
        className={`${className} ${loading ? 'opacity-50' : ''}`}
        placeholder={placeholder}
      />
      {loading && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      )}
    </div>
  );
}
