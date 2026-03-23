'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import Link from 'next/link';

export default function GoatFilters({ breeds, lang, t }: { breeds: any[], lang: string, t: any }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [breed, setBreed] = useState(searchParams.get('breed') || '');
    const [sex, setSex] = useState(searchParams.get('sex') || '');
    const [view, setView] = useState(searchParams.get('view') || 'all');

    useEffect(() => {
        const params = new URLSearchParams();
        if (search) params.set('q', search);
        if (breed) params.set('breed', breed);
        if (sex) params.set('sex', sex);
        if (view && view !== 'all') params.set('view', view);
        
        const queryString = params.toString();
        router.push(`/goats${queryString ? '?' + queryString : ''}`);
    }, [search, breed, sex, view, router]);

    const QuickFilter = ({ id, label, active }: { id: string, label: string, active: boolean }) => (
        <button 
            onClick={() => setView(id)}
            className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${active ? 'text-[#491907] underline underline-offset-4' : 'text-blue-600 hover:text-blue-800'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6 mb-10">
            {/* Quick Filter Links Row */}
            <div className="flex flex-wrap items-center gap-3 text-[10px] bg-amber-50/50 p-3 rounded-lg border border-amber-900/5">
                <Link href="/catalog/goats/add" className="text-blue-600 hover:text-blue-800 font-bold uppercase tracking-widest">
                    + Add an animal
                </Link>
                <span className="text-gray-300">•</span>
                <QuickFilter id="all" label={t.goats.showAll} active={view === 'all'} />
                <span className="text-gray-300">•</span>
                <QuickFilter id="x" label={t.goats.showX} active={view === 'x'} />
                <span className="text-gray-300">•</span>
                <QuickFilter id="r" label={t.goats.showR} active={view === 'r'} />
                <span className="text-gray-300">•</span>
                <QuickFilter id="duplicates" label={t.goats.showDuplicates} active={view === 'duplicates'} />
                <span className="text-gray-300">•</span>
                <QuickFilter id="living" label={t.goats.showLiving} active={view === 'living'} />
                <span className="text-gray-300">•</span>
                <QuickFilter id="dead" label={t.goats.showDead} active={view === 'dead'} />
                <span className="text-gray-300">•</span>
                <QuickFilter id="nostatus" label={t.goats.noStatus} active={view === 'nostatus'} />
            </div>

            {/* Search & Selectors Case */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#491907] transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder={t.goats.searchLabel} 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#491907]/10 focus:border-[#491907] transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <select 
                            value={breed}
                            onChange={(e) => setBreed(e.target.value)}
                            className="flex-1 md:w-48 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#491907]/10 appearance-none cursor-pointer"
                        >
                            <option value="">{t.goats.breedFilter}</option>
                            {breeds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>

                        <select 
                            value={sex}
                            onChange={(e) => setSex(e.target.value)}
                            className="flex-1 md:w-40 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#491907]/10 appearance-none cursor-pointer"
                        >
                            <option value="">{t.goats.sexFilter}</option>
                            <option value="1">{t.goats.male}</option>
                            <option value="2">{t.goats.female}</option>
                        </select>

                        {(search || breed || sex || (view && view !== 'all')) && (
                            <button 
                                onClick={() => { setSearch(''); setBreed(''); setSex(''); setView('all'); }}
                                className="px-6 py-3 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2"
                            >
                                <X size={14} />
                                {t.goats.resetFilters}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
