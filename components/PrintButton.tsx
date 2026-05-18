'use client';

import { Printer } from 'lucide-react';

export default function PrintButton({ label, className }: { label: string, className?: string }) {
    return (
        <button 
            onClick={() => window.print()} 
            className={`inline-flex items-center justify-center gap-2 ${className || "bg-[#522513] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#3b1a0d] transition-all shadow-lg hover:shadow-xl active:scale-95 cursor-pointer"}`}
        >
            <Printer className="w-5 h-5 shrink-0" />
            <span>{label}</span>
        </button>
    );
}
