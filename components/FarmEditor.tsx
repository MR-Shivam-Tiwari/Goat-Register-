'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getTranslation, Locale } from '@/lib/translations';
import { addFarmAction, updateFarmAction } from '@/lib/actions';
import { Save, ChevronLeft, Loader2, Upload, Layout, FileText, Image as ImageIcon } from 'lucide-react';
import 'react-quill-new/dist/quill.snow.css';

// Dynamic import for ReactQuill
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-50 border-2 border-gray-200 rounded-sm flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-xs">Loading...</div>
});

interface FarmEditorProps {
    lang: Locale;
    initialData?: {
        id?: number | string;
        name?: string;
        tmpl?: string;
        pic1?: string;
        pic2?: string;
    };
    isEdit?: boolean;
}

export default function FarmEditor({ lang, initialData, isEdit = false }: FarmEditorProps) {
    const router = useRouter();
    const t = getTranslation(lang);
    
    const [isMounted, setIsMounted] = useState(false);
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.tmpl || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [pic1, setPic1] = useState<File | null>(null);
    const [pic2, setPic2] = useState<File | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const quillModules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', '', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'clean'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }]
        ],
    }), []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        formData.set('description', description);
        if (pic1) formData.set('pic1', pic1);
        if (pic2) formData.set('pic2', pic2);

        if (isEdit && initialData?.id) {
            formData.set('farmId', initialData.id.toString());
        }

        try {
            const action = isEdit ? updateFarmAction : addFarmAction;
            const res = await action(formData);
            
            if (res.success) {
                router.push('/farms');
                router.refresh();
            } else {
                setError(res.error || t.common.errorSomething);
                setIsSubmitting(false);
            }
        } catch (err: any) {
            setError(err.message || t.common.errorOccurred);
            setIsSubmitting(false);
        }
    };

    if (!isMounted) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="animate-spin text-[#491907]" size={48} /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 md:py-12 px-2 md:px-12 lg:px-24 font-sans text-gray-900 tracking-tight">
            <div className="max-w-4xl mx-auto space-y-6">
                
                <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 md:p-8 rounded-sm border-2 border-gray-100 shadow-sm">
                    <div className="text-center md:text-left space-y-1">
                        <Link href="/farms" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline mb-2 transition-all">
                            <ChevronLeft size={16} /> {t.common.back}
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-black uppercase text-[#491907] flex items-center justify-center md:justify-start gap-3">
                            <Layout size={28} />
                            {isEdit ? t.farms.editTitle : t.farms.addTitle}
                        </h1>
                    </div>
                </header>

                {error && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-sm text-sm font-bold shadow-sm animate-in shake duration-500">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white p-4 md:p-8 rounded-sm border-2 border-gray-100 shadow-sm space-y-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <FileText size={14} className="text-[#491907]" />
                                {t.farms.farmNameLabel}
                            </label>
                            <input 
                                name="name"
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t.farms.placeholderName}
                                className="w-full bg-gray-50 border-2 border-gray-200 rounded-sm px-6 py-4 text-base font-black text-gray-900 focus:border-[#491907] outline-none"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Layout size={14} className="text-[#491907]" />
                                {t.farms.farmDescriptionLabel}
                            </label>
                            <div className="rounded-sm overflow-hidden border-2 border-gray-200">
                                <ReactQuill 
                                    theme="snow" 
                                    value={description} 
                                    onChange={setDescription} 
                                    modules={quillModules}
                                    className="bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Minimalist Upload Section */}
                    <div className="bg-white p-4 md:p-8 rounded-sm border-2 border-gray-100 shadow-sm space-y-8">
                        <h3 className="text-sm font-black text-[#491907] uppercase tracking-widest flex items-center gap-3 border-b-2 border-gray-50 pb-4">
                            <ImageIcon size={20} />
                            {t.farms.images}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Pic 1 */}
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t.farms.photoWindow}</label>
                                {!pic1 ? (
                                    <div className="relative">
                                        <input type="file" accept="image/*" onChange={(e) => setPic1(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                        <button type="button" className="bg-[#491907] text-white font-bold py-3 px-6 rounded-sm text-[10px] tracking-widest uppercase hover:bg-black transition-all flex items-center gap-2">
                                            <Upload size={14} />
                                            {t.common.selectPhoto}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 bg-gray-50 border-2 border-[#491907] p-2 rounded-sm text-[10px] font-black">
                                        <span className="truncate flex-1 text-gray-800">{pic1.name}</span>
                                        <button type="button" onClick={() => setPic1(null)} className="text-red-600 underline uppercase">{t.common.remove}</button>
                                    </div>
                                )}
                            </div>

                            {/* Pic 2 */}
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t.farms.photosPage}</label>
                                {!pic2 ? (
                                    <div className="relative">
                                        <input type="file" accept="image/*" onChange={(e) => setPic2(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                        <button type="button" className="bg-[#491907] text-white font-bold py-3 px-6 rounded-sm text-[10px] tracking-widest uppercase hover:bg-black transition-all flex items-center gap-2">
                                            <Upload size={14} />
                                            {t.common.selectPhoto}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 bg-gray-50 border-2 border-[#491907] p-2 rounded-sm text-[10px] font-black">
                                        <span className="truncate flex-1 text-gray-800">{pic2.name}</span>
                                        <button type="button" onClick={() => setPic2(null)} className="text-red-600 underline uppercase">{t.common.remove}</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center pb-12 pt-6">
                        <button type="submit" disabled={isSubmitting} className="w-full md:w-auto min-w-[300px] bg-[#491907] hover:bg-black text-white font-black py-4 px-12 rounded-sm text-sm tracking-[0.3em] uppercase disabled:opacity-50 transition-all flex items-center justify-center gap-4 shadow-xl active:translate-y-0.5">
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>{t.common.saving}</span>
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>{isEdit ? t.common.updateExisting : t.common.establishNew}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            
            <style jsx global>{`
                .ql-container.ql-snow { border: none !important; font-size: 1rem !important; }
                .ql-toolbar.ql-snow { border: none !important; border-bottom: 2px solid #E5E7EB !important; background: #F9FAFB !important; }
                .ql-editor { min-height: 200px !important; line-height: 1.6 !important; }
            `}</style>
        </div>
    );
}
