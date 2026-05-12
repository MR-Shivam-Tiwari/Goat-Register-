'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

interface SmartFarmImageProps {
    src: string | null;
    alt: string;
    fill?: boolean;
    className?: string;
    emptyText?: string;
}

export default function SmartFarmImage({ src, alt, fill, className, emptyText }: SmartFarmImageProps) {
    const [error, setError] = useState(false);

    if (!src || error) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 text-gray-300 w-full h-full bg-gray-50">
                <div className="text-4xl opacity-20">🖼️</div>
                <span className="text-[10px] font-black uppercase tracking-widest">{emptyText || 'NO PHOTO AVAILABLE'}</span>
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill={fill}
            className={className}
            onError={() => setError(true)}
        />
    );
}
