'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTranslation, Locale } from '@/lib/translations';

interface FarmEditorProps {
    lang: Locale;
    initialData?: {
        name?: string;
        description?: string;
    };
    isEdit?: boolean;
    showContainer?: boolean;
}

export default function FarmEditor({ lang, initialData, isEdit = false, showContainer = true }: FarmEditorProps) {
    const router = useRouter();
    const t = getTranslation(lang);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.push('/farms?success=1');
    };

    const content = (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Farm Name */}
            <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#491907] block">Farm name:</label>
                <input 
                    name="name"
                    type="text" 
                    defaultValue={initialData?.name}
                    className="w-full border border-amber-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-100 transition-all bg-white shadow-inner"
                    required
                />
            </div>

            {/* Farm Description with Mock Editor Toolbar */}
            <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#491907] block">Farm description:</label>
                <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col shadow-sm">
                    {/* Toolbar Placeholder */}
                    <div className="bg-[#F8F8F8] border-b border-gray-200 p-1.5 flex flex-wrap gap-1 items-center grayscale opacity-60 scale-90 origin-left">
                        {['B', 'I', 'U', 'abc', 'x2', 'Tx', 'H1', '¶'].map((btn, i) => (
                            <button key={i} type="button" className="px-1.5 py-0.5 border border-gray-300 bg-white rounded text-[9px] font-bold hover:bg-gray-100 min-w-[20px]">{btn}</button>
                        ))}
                        <div className="h-3 w-px bg-gray-300 mx-0.5" />
                        {['≡', '≡', '≡'].map((btn, i) => (
                            <button key={`align-${i}`} type="button" className="px-1.5 py-0.5 border border-gray-300 bg-white rounded text-[9px] hover:bg-gray-100 min-w-[20px]">{btn}</button>
                        ))}
                    </div>
                    <textarea 
                        name="description"
                        rows={isEdit ? 8 : 10}
                        defaultValue={initialData?.description}
                        className="w-full p-4 outline-none text-sm text-gray-800 resize-none font-sans"
                    />
                </div>
            </div>

            {/* File Uploads - Conditional for New Farm usually, but keeping for both if needed */}
            <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider w-36">Photo out window:</label>
                    <input 
                        type="file" 
                        className="text-[11px] text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border file:border-gray-300 file:text-[11px] file:font-bold file:bg-gray-50 file:text-gray-600 hover:file:bg-gray-100 cursor-pointer"
                    />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider w-36">Photos per page:</label>
                    <input 
                        type="file" 
                        className="text-[11px] text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border file:border-gray-300 file:text-[11px] file:font-bold file:bg-gray-50 file:text-gray-600 hover:file:bg-gray-100 cursor-pointer"
                    />
                </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end">
                <button 
                    type="submit" 
                    className="bg-[#491907] text-white px-8 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-[#6D260D] active:scale-95 transition-all shadow-md"
                >
                    {isEdit ? t.common.save : t.common.writeDown}
                </button>
            </div>
        </form>
    );

    if (!showContainer) return content;

    return (
        <div className="min-h-screen bg-[#FFFDF9] py-12 px-6 lg:px-24 font-sans text-amber-950">
            <div className="max-w-4xl mx-auto border border-[#D2B48C]/30 rounded-xl p-8 bg-white shadow-sm space-y-6 animate-in fade-in duration-500">
                {/* Back Link */}
                <Link href="/farms" className="text-[#491907]/60 hover:text-[#491907] text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 mb-2 transition-colors">
                    ← Back
                </Link>
                {content}
            </div>
            
            <div className="text-center pt-20">
                <p className="text-[10px] text-amber-900/40 font-bold uppercase tracking-[0.3em] italic">
                    {t.home.footerConsent}
                </p>
            </div>
        </div>
    );
}
