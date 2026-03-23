import { query } from '@/lib/db';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import Image from 'next/image';
import fs from 'fs';
import path from 'path';
import { Pencil, Eye, MapPin } from 'lucide-react';
import { cookies } from 'next/headers';
import { getTranslation, Locale } from '@/lib/translations';

export const dynamic = 'force-dynamic';

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
    const isAdmin = cookieStore.get('uid_token')?.value;
    
    return (
        <div className="min-h-screen bg-[#F8F9FA] py-10 px-4 md:px-12 lg:px-24 font-sans text-gray-800">
            <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
                <Breadcrumbs items={[{ label: t.farms.breadcrumbs }]} />

                <header className="flex flex-col md:flex-row items-center justify-between border-b border-gray-200 pb-8 gap-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">{t.farms.title}</h1>
                        <p className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                            Official Registry of Participating Farm Enterprises
                        </p>
                    </div>
                    <Link href="/farms/add" className="px-8 py-3 bg-[#491907] text-white font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 duration-300">
                        {t.farms.addFarm}
                    </Link>
                </header>

                <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden relative overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead className="sticky top-0 z-20 bg-primary text-secondary shadow-md">
                            <tr className="text-[10px] uppercase font-black tracking-widest">
                                <th className="p-4 border-r border-white/10 w-20 text-center">ID</th>
                                <th className="p-4 border-r border-white/10">Farm Name</th>
                                <th className="p-4 border-r border-white/10">Location</th>
                                <th className="p-4 border-r border-white/10 text-center">Status</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-[11px] font-medium text-gray-700">
                            {farms.map((farm: any, idx: number) => (
                                <tr key={farm.id} className="hover:bg-amber-50/50 border-b border-gray-100 transition-colors group">
                                    <td className="p-4 border-r border-gray-100 text-center font-mono text-gray-400">#{farm.id}</td>
                                    <td className="p-4 border-r border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-gray-50">
                                                <Image 
                                                    src={farm.displayPic} 
                                                    alt={farm.name} 
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                />
                                            </div>
                                            <Link href={`/farms/${farm.id}`} className="font-black text-blue-800 hover:text-red-700 transition-colors uppercase tracking-tight">
                                                {farm.name}
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="p-4 border-r border-gray-100">
                                        <div className="flex items-center gap-2 text-gray-400 font-bold uppercase tracking-tighter">
                                            <MapPin size={12} className="text-[#491907]" />
                                            Ukraine / Regional
                                        </div>
                                    </td>
                                    <td className="p-4 border-r border-gray-100 text-center">
                                       <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[8px] font-black uppercase tracking-widest border border-green-100 shadow-sm">
                                            {t.farms.memberApk}
                                       </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link href={`/farms/${farm.id}`} className="p-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-primary hover:text-secondary transition-all shadow-sm group">
                                                <Eye size={14} />
                                            </Link>
                                            {isAdmin && (
                                                <Link href={`/farms/${farm.id}/edit`} className="p-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-amber-600 hover:text-white transition-all shadow-sm">
                                                    <Pencil size={14} />
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {farms.length === 0 && (
                    <div className="bg-white rounded-2xl p-20 text-center border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 font-bold uppercase tracking-[0.4em] text-lg">{t.common.notAvailable}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
