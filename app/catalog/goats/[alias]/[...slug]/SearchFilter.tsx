"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

export default function SearchFilter({ 
    label, 
    placeholder 
}: { 
    label: string, 
    placeholder: string 
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [value, setValue] = useState(searchParams.get("q") || "");

    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set("q", value);
            } else {
                params.delete("q");
            }
            router.push(`?${params.toString()}`);
        }, 500);
        return () => clearTimeout(timer);
    }, [value, router, searchParams]);

    return (
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <span className="text-[9px] font-black text-primary/40 uppercase tracking-widest px-1">{label}</span>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400 group-focus-within:text-primary transition-colors" size={14} />
                </div>
                <input 
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full pl-9 pr-8 h-[38px] bg-white border border-primary/10 rounded-md text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-secondary transition-all"
                />
                {value && (
                    <button 
                        onClick={() => setValue("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        </div>
    );
}
