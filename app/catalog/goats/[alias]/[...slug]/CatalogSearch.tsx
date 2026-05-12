'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export default function CatalogSearch({ placeholder }: { placeholder: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (debouncedSearch) {
            params.set('q', debouncedSearch);
        } else {
            params.delete('q');
        }
        
        const queryString = params.toString();
        router.push(`?${queryString}`);
    }, [debouncedSearch, router, searchParams]);

    return (
        <div className="relative group min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400 group-focus-within:text-[#491907] transition-colors" size={14} />
            </div>
            <input 
                type="text" 
                placeholder={placeholder} 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 h-[38px] bg-white border border-gray-300 rounded text-[13px] focus:outline-none focus:ring-1 focus:ring-[#CFA97A]/50 focus:border-[#CFA97A] transition-all font-bold placeholder:font-normal"
            />
            {search && (
                <button 
                    onClick={() => setSearch('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500"
                >
                    <X size={14} />
                </button>
            )}
        </div>
    );
}
