'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toggleApkAction } from '@/lib/actions';
import { Check, X } from 'lucide-react';

export default function ApkToggleButton({ 
    userId, 
    isApk, 
    yesText, 
    noText 
}: { 
    userId: number; 
    isApk: number; 
    yesText: string; 
    noText: string; 
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(isApk);

    async function handleToggle() {
        setLoading(true);
        try {
            const res = await toggleApkAction(userId, status);
            if (res.success && res.newStatus !== undefined) {
                setStatus(res.newStatus);
                router.refresh();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleToggle}
            disabled={loading}
            title="Click to toggle APK Membership (ДА/НЕТ)"
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 border ${
                status === 1
                    ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
            } ${loading ? 'opacity-50 cursor-wait' : ''}`}
        >
            {status === 1 ? (
                <>
                    <Check size={11} className="stroke-[3]" />
                    <span>{yesText}</span>
                </>
            ) : (
                <>
                    <X size={11} className="stroke-[3]" />
                    <span>{noText}</span>
                </>
            )}
        </button>
    );
}
