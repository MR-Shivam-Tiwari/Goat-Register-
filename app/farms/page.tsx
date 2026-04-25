import { query } from '@/lib/db';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import Image from 'next/image';
import fs from 'fs';
import path from 'path';
import { Pencil, Eye, MapPin, Shield, Plus } from 'lucide-react';
import { cookies } from 'next/headers';
import { getTranslation, Locale } from '@/lib/translations';

export const dynamic = 'force-dynamic';

async function getFarms() {
    const result = await query('SELECT id, name, pic1 FROM farms ORDER BY id DESC');
    
    const farms = result.rows.map((farm: any) => {
        let displayPic = '/img/farm_placeholder.png';
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
        return { ...farm, displayPic };
    });
    
    return farms;
}

export default async function FarmsPage() {
    const farms = await getFarms();
    const cookieStore = await cookies();
    const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
    const t = getTranslation(lang);
    const isAdmin = cookieStore.get('uid_token')?.value;
    
    return (
        <div className="min-h-screen py-10 px-4 md:px-12 lg:px-24 font-sans text-gray-800">
            <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
                <Breadcrumbs items={[{ label: t.farms.breadcrumbs }]} />

                {/* PAGE HEADER */}
                <header className="flex flex-col md:flex-row items-center justify-between border-b border-gray-200 pb-8 gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">{t.farms.title}</h1>
                        <p className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                            {t.farms.registryDesc}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest shadow-sm">
                            {farms.length} {farms.length === 1 ? t.farms.farmSingle : t.farms.farmPlural} {t.farms.registeredSuffix}
                        </span>
                        <Link
                            href="/farms/add"
                            className="flex items-center gap-2 px-6 py-3 bg-[#491907] text-white font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 duration-300"
                        >
                            <Plus size={14} />
                            {t.farms.addFarm}
                        </Link>
                    </div>
                </header>

                {/* FARM CARDS GRID */}
                {farms.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {farms.map((farm: any) => (
                            <div
                                key={farm.id}
                                className="group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                            >
                                {/* CARD IMAGE */}
                                <div className="relative h-48 bg-white overflow-hidden">
                                    <Image
                                        src={farm.displayPic}
                                        alt={farm.name}
                                        fill
                                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {/* Gradient overlay at bottom (very subtle) */}
                                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-50/50 to-transparent" />
                                </div>

                                {/* CARD BODY */}
                                <div className="flex flex-col flex-1 p-5 gap-3">
                                    {/* Farm name with ID tag */}
                                    <div className="flex items-start justify-between gap-3">
                                        <Link href={`/farms/${farm.id}`} className="flex-1">
                                            <h2 className="text-[13px] font-black uppercase tracking-tight text-gray-900 leading-tight group-hover:text-[#491907] transition-colors line-clamp-2">
                                                <span className="text-[10px] not-font-mono text-gray-400 mr-1.5">#{farm.id}</span>
                                                {farm.name}
                                            </h2>
                                        </Link>
                                        <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tight shrink-0 border border-green-100">
                                            <Shield size={8} className="fill-green-600/10" />
                                            {t.farms.memberApk}
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-center gap-1.5 text-gray-400">
                                        <MapPin size={11} className="text-[#491907] shrink-0" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{t.farms.ukraineRegional}</span>
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t border-gray-100 mt-auto pt-4 flex items-center justify-between gap-2">
                                        <Link
                                            href={`/farms/${farm.id}`}
                                            className="flex items-center gap-1.5 flex-1 justify-center py-2.5 bg-[#491907] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-sm active:scale-95"
                                        >
                                            <Eye size={12} />
                                            {t.farms.view}
                                        </Link>
                                        {isAdmin && (
                                            <Link
                                                href={`/farms/${farm.id}/edit`}
                                                className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 hover:text-amber-700 transition-all border border-gray-100"
                                            >
                                                <Pencil size={12} />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-20 text-center border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 font-bold uppercase tracking-[0.4em] text-lg">{t.common.notAvailable}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
