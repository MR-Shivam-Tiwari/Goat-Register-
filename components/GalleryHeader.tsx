'use client';

import { useState, useEffect } from 'react';
import AddPhotoGallery from './AddPhotoGallery';

export default function GalleryHeader({ goatId, t }: { goatId: string | number, t: any }) {
    const [status, setStatus] = useState<{ message: string, type: 'success' | 'delete' } | null>(null);

    useEffect(() => {
        const handleStatus = (e: any) => {
            const { type } = e.detail;
            let message = '';
            if (type === 'delete') {
                message = t.goats.photoDeleted || 'Photo deleted successfully';
            } else {
                message = t.goats.photoAdded || 'Photo added successfully';
            }
            setStatus({ message, type });
            setTimeout(() => setStatus(null), 4000);
        };
        window.addEventListener('gallery-status', handleStatus);
        return () => window.removeEventListener('gallery-status', handleStatus);
    }, [t]);

    return (
        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <h2 className="text-[#491907] text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1 h-3 bg-[#491907] rounded-full"></span>
                    {t.goats?.gallery || 'Gallery'}
                </h2>
                {status && (
                    <div className={`
                        px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-left-2 duration-500
                        ${status.type === 'delete' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}
                    `}>
                        {status.message}
                    </div>
                )}
            </div>
            <AddPhotoGallery goatId={goatId} t={t} />
        </div>
    );
}
