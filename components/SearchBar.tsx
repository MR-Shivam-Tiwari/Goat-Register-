'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative group w-full">
      <input
        type="text"
        placeholder="Global Registry Search..."
        className="w-full bg-primary/5 border-none px-8 py-4 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] focus:outline-none focus:ring-4 focus:ring-secondary/20 focus:bg-white transition-all pr-16 text-primary shadow-inner placeholder:text-primary/10"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button 
        type="submit" 
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-secondary rounded-2xl flex items-center justify-center opacity-40 group-hover:opacity-100 group-hover:bg-secondary group-hover:text-primary transition-all duration-500 shadow-xl"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
}
