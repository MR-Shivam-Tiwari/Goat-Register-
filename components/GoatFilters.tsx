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
    const [regType, setRegType] = useState(searchParams.get('reg') || 'all');

    useEffect(() => {
        const params = new URLSearchParams();
        if (search) params.set('q', search);
        if (breed) params.set('breed', breed);
        if (sex) params.set('sex', sex);
        if (view && view !== 'all') params.set('view', view);
        if (regType && regType !== 'all') params.set('reg', regType);
        
        const queryString = params.toString();
        router.push(`/goats${queryString ? '?' + queryString : ''}`);
        router.refresh();
    }, [search, breed, sex, view, regType, router]);

    return (
        <div className="space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
                {/* SEARCH BAR (Isolated) */}
                <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="text-gray-400 group-focus-within:text-[#491907] transition-colors" size={18} />
                    </div>
                    <input 
                        type="text" 
                        placeholder={t.goats.searchLabel} 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 h-8 bg-white border border-gray-300 rounded shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all font-bold placeholder:font-normal"
                    />
                </div>

                {/* FILTERS PANEL */}
                <div className="flex flex-wrap items-center gap-4  ">
                    {/* Breed & Sex Selectors */}
                    <select 
                        value={breed}
                        onChange={(e) => setBreed(e.target.value)}
                        className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-[10px] font-black uppercase tracking-wider text-gray-700 outline-none"
                    >
                        <option value="">{t.goats.breedFilter}</option>
                        {breeds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>

                    <select 
                        value={sex}
                        onChange={(e) => setSex(e.target.value)}
                        className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-[10px] font-black uppercase tracking-wider text-gray-700 outline-none"
                    >
                        <option value="">{t.goats.sexFilter}</option>
                        <option value="1">{t.goats.male}</option>
                        <option value="2">{t.goats.female}</option>
                    </select>

                    {/* View Selector (Living, Dead, etc.) */}
                    <select 
                        value={view}
                        onChange={(e) => setView(e.target.value)}
                        className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-[10px] font-black uppercase tracking-wider text-gray-700 outline-none"
                    >
                        <option value="all">-- {t.goats.showAll} --</option>
                        <option value="living">{t.goats.showLiving}</option>
                        <option value="dead">{t.goats.showDead}</option>
                        <option value="duplicates">{t.goats.showDuplicates}</option>
                        <option value="nostatus">{t.goats.noStatus}</option>
                    </select>

                    {/* Checkboxes for X and R (Exclusive but separate param) */}
                    <div className="flex items-center gap-4 border-l pl-4 border-gray-300">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={regType === 'x'} 
                                onChange={(e) => setRegType(e.target.checked ? 'x' : 'all')}
                                className="w-4 h-4 border-gray-300 rounded text-primary focus:ring-primary transition-all"
                            />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-primary">{t.goats.showX}</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={regType === 'r'} 
                                onChange={(e) => setRegType(e.target.checked ? 'r' : 'all')}
                                className="w-4 h-4 border-gray-300 rounded text-primary focus:ring-primary transition-all"
                            />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-primary">{t.goats.showR}</span>
                        </label>
                    </div>

                    {(search || breed || sex || view !== 'all' || regType !== 'all') && (
                        <button 
                            onClick={() => { setSearch(''); setBreed(''); setSex(''); setView('all'); setRegType('all'); }}
                            className="ml-auto text-red-600 hover:text-red-800 p-1"
                            title={t.goats.resetFilters}
                        >
                            <X size={16} strokeWidth={3} />
                        </button>
                    )}
                </div>
            </div>
            
            <div className="flex justify-end">
                <Link 
                    href="/catalog/goats/add" 
                    className="px-4 py-1.5 bg-[#4D2C1A] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded shadow-sm hover:translate-y-[-1px] transition-all"
                >
                    + {t.nav.addGoat}
                </Link>
            </div>
        </div>
    );
}
     

