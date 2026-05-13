'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addPhotoAction } from '@/lib/actions';
import { Upload, X, Loader2, Camera } from 'lucide-react';

export default function AddPhotoGallery({ goatId, t }: { goatId: string | number, t: any }) {
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        
        setUploading(true);
        setSuccess(false);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('goatId', goatId.toString());

        try {
            const res = await addPhotoAction(formData);
            if (res.success) {
                setSuccess(true);
                window.dispatchEvent(new CustomEvent('gallery-status', { detail: { type: 'success' } }));
                setTimeout(() => setSuccess(false), 3000);
                router.refresh(); 
            } else {
                alert(res.error || t.errors.uploadFailed);
            }
        } catch (err) {
            console.error(err);
            alert(t.errors.somethingWrong);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    return (
        <div className="flex items-center gap-4">
            {success && (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100 animate-in fade-in zoom-in duration-300">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t.goats.added || 'Added!'}</span>
                </div>
            )}
            <label className={`
                cursor-pointer px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2
                ${uploading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-black active:scale-95'}
            `}>
                {uploading ? (
                    <>
                        <Loader2 size={14} className="animate-spin text-white" />
                        <span className="animate-pulse">Uploading...</span>
                    </>
                ) : (
                    <>
                        <Camera size={14} />
                        <span>{t.goats.add} {t.goats.photoShort}</span>
                    </>
                )}
                <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleUpload} 
                    disabled={uploading}
                    accept="image/*"
                />
            </label>
            <button 
                onClick={() => router.refresh()} 
                className="text-gray-400 hover:text-primary transition-all text-[10px] font-bold uppercase tracking-widest"
            >
                {t.goats.refresh}
            </button>
        </div>
    );
}
