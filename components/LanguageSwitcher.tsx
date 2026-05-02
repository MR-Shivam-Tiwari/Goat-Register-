'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LanguageSwitcher({ currentLang }: { currentLang: 'ru' | 'en' | 'uk' }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState(currentLang);
  const [isMounted, setIsMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setIsMounted(true);
    setActive(currentLang);
  }, [currentLang]);

  const handleSwitch = async (lang: 'ru' | 'en' | 'uk') => {
    if (lang === active) return;
    
    setActive(lang);
    
    try {
        await fetch('/api/set-lang', {
            method: 'POST',
            body: JSON.stringify({ lang }),
            headers: { 'Content-Type': 'application/json' }
        });

        startTransition(() => {
            router.refresh();
            setTimeout(() => {
                window.location.reload();
            }, 100);
        });
    } catch (err) {
        console.error('Failed to set language:', err);
    }
  };

  if (!isMounted) {
    return <div className="w-24 h-8 bg-black/20 rounded-full animate-pulse" />;
  }

  return (
    <div className="relative flex p-1 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 shadow-lg scale-90 md:scale-100 ring-1 ring-white/5">
      {/* Sliding background pill */}
      <div 
        className={`absolute top-1 bottom-1 w-[calc(33.33%-4px)] bg-white rounded-full transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) shadow-md ${
          active === 'ru' ? 'left-1' : 
          active === 'en' ? 'left-[calc(33.33%+2px)]' : 
          'left-[calc(66.66%+1px)]'
        }`}
      />

      <button
        onClick={() => handleSwitch('ru')}
        disabled={isPending}
        className={`relative z-10 flex items-center justify-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${
          active === 'ru' 
            ? 'text-[#491907]' 
            : 'text-white/40 hover:text-white/60'
        }`}
      >
        <span>RU</span>
      </button>

      <button
        onClick={() => handleSwitch('en')}
        disabled={isPending}
        className={`relative z-10 flex items-center justify-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${
          active === 'en' 
            ? 'text-[#491907]' 
            : 'text-white/40 hover:text-white/60'
        }`}
      >
        <span>EN</span>
      </button>

      <button
        onClick={() => handleSwitch('uk')}
        disabled={isPending}
        className={`relative z-10 flex items-center justify-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${
          active === 'uk' 
            ? 'text-[#491907]' 
            : 'text-white/40 hover:text-white/60'
        }`}
      >
        <span>UA</span>
      </button>

      {/* Progress Animation using tailwind only */}
      {isPending && (
        <div className="absolute inset-x-4 -bottom-1 h-[1px] bg-white/30 rounded-full overflow-hidden">
          <div className="w-full h-full bg-white animate-[shimmer_2s_infinite] origin-left" />
        </div>
      )}
    </div>
  );
}
