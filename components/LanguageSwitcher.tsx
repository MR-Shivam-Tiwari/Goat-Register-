'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setLanguage } from '@/lib/actions';

export default function LanguageSwitcher({ currentLang }: { currentLang: 'ru' | 'en' }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSwitch = (lang: 'ru' | 'en') => {
    startTransition(async () => {
      await setLanguage(lang);
      router.refresh();
    });
  };

  return (
    <div className="flex bg-primary/5 p-1 rounded-2xl border border-primary/10 select-none shadow-inner opacity-60 hover:opacity-100 transition-opacity">
      <button
        onClick={() => handleSwitch('ru')}
        disabled={currentLang === 'ru' || isPending}
        className={`px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest transition-all ${
          currentLang === 'ru' ? 'bg-secondary text-primary shadow-lg' : 'text-primary/30 hover:text-primary'
        }`}
      >
        RU
      </button>
      <button
        onClick={() => handleSwitch('en')}
        disabled={currentLang === 'en' || isPending}
        className={`px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest transition-all ${
          currentLang === 'en' ? 'bg-secondary text-primary shadow-lg' : 'text-primary/30 hover:text-primary'
        }`}
      >
        EN
      </button>
    </div>
  );
}
