'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { deletePhotoAction } from '@/lib/actions';
import { Trash2, Maximize2, Loader2, X } from 'lucide-react';

export default function GalleryItem({ file, goatId, t }: { file: string, goatId: string | number, t: any }) {
    const [deleting, setDeleting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="w-36 h-52 bg-[#B5F4BB] border-r border-b border-[#4D2C1A]" />;

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this photo?')) return;
        
        setDeleting(true);
        try {
            const res = await deletePhotoAction(file, goatId);
            if (res.success) {
                window.dispatchEvent(new CustomEvent('gallery-status', { detail: { type: 'delete' } }));
                router.refresh();
            } else {
                alert(res.error || 'Failed to delete');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
        <div className="w-36 h-46 bg-[#B5F4BB] border-r border-b border-[#4D2C1A] last:border-r-0 p-2 group relative overflow-hidden flex flex-col items-center justify-center">
            <div className="w-full h-full relative overflow-hidden border border-[#491907]/20">
                <img
                    src={file.startsWith('http') || file.startsWith('/') ? file : `/uploads/${file}`}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                    alt="Gallery item"
                />
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-white/20 hover:bg-white/40 text-white p-1.5 rounded transition-all backdrop-blur-sm"
                        title={t.goats.viewShort}
                    >
                        <Maximize2 size={16} />
                    </button>
                    <button 
                        onClick={handleDelete}
                        disabled={deleting}
                        className="bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded transition-all disabled:opacity-50 backdrop-blur-sm"
                        title="Delete"
                    >
                        {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                </div>
            </div>
        </div>

            {/* Simple Modal for Viewing */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
                    <button 
                        onClick={() => setShowModal(false)}
                        className="absolute top-6 right-6 text-white hover:text-gray-300 bg-white/10 p-3 rounded-full transition-all active:scale-95"
                    >
                        <X size={28} />
                    </button>
                    <div className="max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl border border-white/10 ring-4 ring-black/50 animate-in zoom-in-95 duration-500">
                        <img 
                            src={file.startsWith('http') || file.startsWith('/') ? file : `/uploads/${file}`} 
                            className="w-full h-auto max-h-[85vh] object-contain select-none" 
                            alt="Preview" 
                        />
                    </div>
                </div>
            )}
        </>
    );
}
