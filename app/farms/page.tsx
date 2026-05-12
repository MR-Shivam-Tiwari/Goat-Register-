import { query } from '@/lib/db';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import Image from 'next/image';
import fs from 'fs';
import path from 'path';
import { Plus, MapPin, Pencil } from 'lucide-react';
import { cookies } from 'next/headers';
import { getTranslation, Locale } from '@/lib/translations';
import SmartFarmImage from '@/components/SmartFarmImage';

export const dynamic = 'force-dynamic';

async function getFarms() {
    const result = await query('SELECT id, name, pic1 FROM farms ORDER BY id DESC');
    
    const rawFarms = result.rows.map((farm: any) => {
        const name = farm.name.toLowerCase();
        const isKamdhenu = farm.id === 1 || farm.id === '1' || name.includes('kamdhenu') || name.includes('kamadhenu') || name.includes('камадхену');
        
        let displayPic = null; // No default image, use text placeholder if null
        
        // Priority for Kamadhenu - Use the card/logo version for the list
        if (isKamdhenu) {
            displayPic = '/api/uploads/kamadhenu_card.jpg';
        }
        
        if (farm.pic1 && farm.pic1 !== 'no_pic.png') {
            let targetPath = '';
            if (farm.pic1 === 'kamadhenu.jpg') {
                targetPath = '/img/kamadhenu.jpg';
            } else if (farm.pic1 === '11.jpg') {
                targetPath = '/img/farm/11.jpg';
            } else if (farm.pic1 === 'new_farm.png') {
                targetPath = '/img/farm/new_farm.png';
            } else {
                targetPath = `/api/uploads/${farm.pic1}`;
            }

            // Check if file actually exists on disk
            try {
                const actualFile = targetPath.replace('/api/uploads/', '');
                const fullPath = path.join(process.cwd(), 'public', 'uploads', actualFile);
                if (fs.existsSync(fullPath)) {
                    // Only use pic1 as the display pic if:
                    // 1. It's not Kamadhenu (because Kamadhenu prefers its logo)
                    // 2. OR if it is Kamadhenu but we don't have the logo yet
                    if (!isKamdhenu || displayPic === null) {
                        displayPic = targetPath;
                    }
                }
            } catch (err) {
                console.error(`Error checking file existence for ${targetPath}:`, err);
            }
        }
        return { ...farm, displayPic, isKamdhenu };
    });

    // Reorder: Kamdhenu first, then others, then virtual "Without Farm"
    const kamdhenuFarms = rawFarms.filter(f => f.isKamdhenu);
    const otherFarms = rawFarms.filter(f => !f.isKamdhenu);
    
    return [
        ...kamdhenuFarms, 
        ...otherFarms,
        {
            id: 0,
            name: 'WITHOUT FARM', // Fallback, will be translated in component if needed
            pic1: 'no_pic.png',
            displayPic: null,
            isKamdhenu: false,
            isVirtual: true
        }
    ];
}

export default async function FarmsPage() {
    const farms = await getFarms();
    const cookieStore = await cookies();
    const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
    const t = getTranslation(lang);
    
    return (
        <div className="min-h-screen py-10 px-4 md:px-12 lg:px-24 font-sans text-gray-800">
            <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
                <Breadcrumbs items={[{ label: t.farms.breadcrumbs }]} t={t} locale={lang} />

                {/* PAGE HEADER */}
                <header className="flex flex-col md:flex-row items-center justify-between border-b border-gray-200 pb-8 gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">{t.farms.title}</h1>
                        <p className="mt-2 text-[13px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                            {t.farms.registryDesc}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="px-5 py-3 bg-white border border-gray-200 rounded-xl text-[13px] font-black text-gray-400 uppercase tracking-widest shadow-sm">
                            {farms.length} {farms.length === 1 ? t.farms.farmSingle : t.farms.farmPlural} {t.farms.registeredSuffix}
                        </span>
                        <Link
                            href="/farms/add"
                            className="flex items-center gap-3 px-8 py-4 bg-[#491907] text-white font-bold rounded-xl text-[13px] uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 duration-300"
                        >
                            <Plus size={14} />
                            {t.farms.addFarm}
                        </Link>
                    </div>
                </header>

                {/* FARM CARDS GRID */}
                {farms.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                        {farms.map((farm: any) => (
                            <div
                                key={farm.id}
                                className="flex flex-col space-y-4 bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                {/* CARD IMAGE */}
                                <Link href={`/farms/${farm.id}`} className="relative aspect-[4/3] bg-gray-50 overflow-hidden rounded-lg border border-gray-100 flex items-center justify-center group">
                                    <SmartFarmImage 
                                        src={farm.displayPic}
                                        alt={farm.name}
                                        fill
                                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-700 ease-in-out"
                                        emptyText={t.catalog?.empty || 'NO PHOTO AVAILABLE'}
                                    />
                                </Link>

                                {/* CARD CONTENT */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            #{farm.id}
                                        </span>
                                        <span className="text-[9px] font-black text-[#23DC69] uppercase tracking-tighter bg-[#23DC69]/10 px-2 py-0.5 rounded-full">
                                            {t.farms.memberApk}
                                        </span>
                                    </div>
                                    
                                    <Link href={`/farms/${farm.id}`} className="block">
                                        <h3 className="text-sm font-black text-[#491907] uppercase tracking-tight leading-tight hover:text-black transition-colors">
                                            {farm.isVirtual ? (t.goats.withoutFarm || 'WITHOUT FARM') : farm.name}
                                        </h3>
                                    </Link>

                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        <MapPin size={10} className="opacity-50" />
                                        {t.farms.ukraineRegional}
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-2">
                                        <Link 
                                            href={`/farms/${farm.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[9px] font-black uppercase tracking-[0.2em] text-[#491907] border-b border-[#491907]/30 pb-0.5 hover:border-[#491907] transition-all"
                                        >
                                            {t.farms.view}
                                        </Link>
                                        {!farm.isVirtual && (
                                            <Link 
                                                href={`/farms/${farm.id}/edit`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-700 border-b border-amber-700/30 pb-0.5 hover:border-amber-700 transition-all"
                                            >
                                                {t.common.edit}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-40 text-center">
                        <div className="text-6xl mb-6">🚜</div>
                        <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tighter">{t.farms.noFarms}</h3>
                        <p className="mt-2 text-sm text-gray-500 uppercase tracking-widest">{t.farms.checkBack}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
