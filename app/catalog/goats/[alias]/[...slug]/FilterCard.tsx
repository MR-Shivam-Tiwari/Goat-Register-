"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function FilterCard({ 
    label, 
    param, 
    currentValue, 
    options 
}: { 
    label: string, 
    param: string, 
    currentValue?: string, 
    options: { id: string, name: string }[] 
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    return (
        <div className="flex flex-col gap-1   flex-1 ">
            <span className="text-[9px] font-black text-primary/40 uppercase tracking-widest px-1">{label}</span>
            <select 
                className="bg-white border border-primary/10 w-full rounded-md px-3 py-2 text-[11px] font-bold uppercase focus:ring-1 focus:ring-secondary outline-none cursor-pointer hover:border-primary/30 transition-colors"
                value={currentValue || "all"}
                onChange={(e) => {
                    const val = e.target.value;
                    const params = new URLSearchParams(searchParams.toString());
                    
                    if (param === "breed") {
                        if (val === "all") return; // Prevent navigating to "all" breed
                        
                        // Robust path replacement
                        const pathParts = window.location.pathname.split('/');
                        const goatsIdx = pathParts.indexOf('goats');
                        if (goatsIdx !== -1 && pathParts[goatsIdx + 1]) {
                            pathParts[goatsIdx + 1] = val;
                        }
                        
                        router.push(`${pathParts.join('/')}?${params.toString()}`);
                        return;
                    }

                    if (val === "all") {
                        params.delete(param);
                    } else {
                        params.set(param, val);
                    }
                    
                    router.push(`?${params.toString()}`);
                }}
            >
                <option value="all">-- {label} --</option>
                {options.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
            </select>
        </div>
    );
}
