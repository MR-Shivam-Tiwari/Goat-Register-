import { query } from '@/lib/db';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import Image from 'next/image';
import fs from 'fs';
import path from 'path';
import { Plus, MapPin, Pencil } from 'lucide-react';
import { cookies } from 'next/headers';
import { getTranslation, Locale } from '@/lib/translations';

export const dynamic = 'force-dynamic';

async function getFarms() {
    const result = await query('SELECT id, name, pic1 FROM farms ORDER BY id DESC');
    
    const rawFarms = result.rows.map((farm: any) => {
        const name = farm.name.toLowerCase();
        const isKamdhenu = name.includes('kamdhenu') || name.includes('kamadhenu') || name.includes('камадхену');
        
        let displayPic = '/breedimage/farmimg.png';
        
        if (isKamdhenu) {
            displayPic = '/img/farm_placeholder.png';
            if (farm.pic1 && farm.pic1 !== 'no_pic.png') {
                const pathsToCheck = [
                    path.join(process.cwd(), 'public', 'uploads', farm.pic1),
                    path.join(process.cwd(), 'public', 'img', 'farm', farm.pic1),
                    path.join(process.cwd(), 'public', 'img', farm.pic1)
                ];
                for (const p of pathsToCheck) {
                    if (fs.existsSync(p)) {
                        if (p.includes('public/uploads/')) {
                            displayPic = `/uploads/${farm.pic1}`;
                        } else if (p.includes('public/img/farm/')) {
                            displayPic = `/img/farm/${farm.pic1}`;
                        } else {
                            displayPic = `/img/${farm.pic1}`;
                        }
                        break;
                    }
                }
            }
        }
        return { ...farm, displayPic, isKamdhenu };
    });

    // Reorder: Kamdhenu first, then others
    const kamdhenuFarms = rawFarms.filter(f => f.isKamdhenu);
    const otherFarms = rawFarms.filter(f => !f.isKamdhenu);
    
    return [...kamdhenuFarms, ...otherFarms];
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
                                <Link href={`/farms/${farm.id}`} className="relative aspect-[4/3] bg-[#F9F8F6] overflow-hidden rounded-lg border border-gray-100 block group">
                                    <Image
                                        src={farm.displayPic}
                                        alt={farm.name}
                                        fill
                                        className="object-contain p-6 group-hover:scale-105 transition-transform duration-700 ease-in-out"
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
                                            {farm.name}
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
                                        <Link 
                                            href={`/farms/${farm.id}/edit`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-700 border-b border-amber-700/30 pb-0.5 hover:border-amber-700 transition-all"
                                        >
                                            {t.common.edit}
                                        </Link>
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
