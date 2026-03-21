import { query } from '@/lib/db';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import Image from 'next/image';
import fs from 'fs';
import path from 'path';
import { Pencil } from 'lucide-react';
import { cookies } from 'next/headers';
import { getTranslation, Locale } from '@/lib/translations';

async function getFarms() {
    const result = await query('SELECT id, name, pic1 FROM farms ORDER BY id DESC');
    
    // Resolve image paths on the server
    const farms = result.rows.map((farm: any) => {
        let displayPic = '/img/farm_placeholder.png';
        if (farm.pic1 && farm.pic1 !== 'no_pic.png') {
            const pathsToCheck = [
                path.join(process.cwd(), 'public', 'img', 'farm', farm.pic1),
                path.join(process.cwd(), 'public', 'img', farm.pic1)
            ];
            for (const p of pathsToCheck) {
                if (fs.existsSync(p)) {
                    displayPic = p.includes('public/img/farm/') ? `/img/farm/${farm.pic1}` : `/img/${farm.pic1}`;
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
    
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-12 lg:px-24 font-sans">
            <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
                <Breadcrumbs items={[{ label: t.farms.breadcrumbs }]} />

                <header className="flex flex-col md:flex-row items-center justify-between border-b border-gray-200 pb-10 gap-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{t.farms.title}</h1>
                        <p className="mt-2 text-sm font-medium text-gray-500 uppercase tracking-widest">{t.farms.desc}</p>
                    </div>
                    <Link href="/farms/add" className="px-10 py-4 bg-[#491907] text-white font-bold rounded-2xl text-[11px] uppercase tracking-widest hover:bg-[#6D260D] transition-all shadow-lg active:scale-95 duration-300">
                        {t.farms.addFarm}
                    </Link>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14">
                    {farms.map((farm: any) => (
                        <div key={farm.id} className="group flex flex-col items-center">
                            <Link href={`/farms/${farm.id}`} className="block relative w-full overflow-hidden rounded-3xl border-8 border-white shadow-xl aspect-[1.1/1] bg-white transition-all duration-500 group-hover:shadow-2xl group-hover:border-amber-50">
                                <Image 
                                    src={farm.displayPic} 
                                    alt={farm.name} 
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute top-4 right-4 bg-[#491907] text-white px-3 py-1.5 rounded-xl font-bold text-[9px] uppercase tracking-wider shadow-md">
                                    {t.farms.memberApk}
                                </div>
                            </Link>
                            
                            <div className="mt-6 text-center space-y-4">
                                <h3 className="text-lg font-bold text-gray-900 tracking-tight group-hover:text-[#491907] transition-colors">
                                    <Link href={`/farms/${farm.id}`} className="hover:underline underline-offset-4">
                                        {farm.name}
                                    </Link>
                                </h3>
                                <div>
                                   <Link href={`/farms/${farm.id}/edit`} className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100/50 border border-gray-200 text-[10px] font-bold text-gray-600 hover:bg-[#491907] hover:text-white hover:border-[#491907] transition-all uppercase tracking-widest rounded-xl shadow-sm">
                                      <Pencil size={12} />
                                      {t.common.edit}
                                   </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {farms.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-400 font-medium">{t.common.notAvailable}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
