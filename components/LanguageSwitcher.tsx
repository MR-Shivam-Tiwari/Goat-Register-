'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setLanguage } from '@/lib/actions';

export default function LanguageSwitcher({ currentLang }: { currentLang: 'ru' | 'en' }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  const current = languages.find(l => l.code === currentLang) || languages[0];

  const handleSwitch = (lang: 'ru' | 'en') => {
    startTransition(async () => {
      await setLanguage(lang);
      setIsOpen(false);
      router.refresh();
    });
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all active:scale-95 shadow-sm group"
      >
        <span className="text-xl group-hover:scale-110 transition-transform">{current.flag}</span>
        <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">{current.code}</span>
        <svg 
            className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 py-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSwitch(lang.code as 'ru' | 'en')}
              disabled={isPending}
              className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-amber-50 transition-colors group ${
                currentLang === lang.code ? 'bg-amber-50/50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <span className={`text-sm font-bold ${currentLang === lang.code ? 'text-[#491907]' : 'text-gray-700'}`}>
                    {lang.name}
                </span>
              </div>
              {currentLang === lang.code && (
                <div className="w-2 h-2 bg-[#491907] rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
