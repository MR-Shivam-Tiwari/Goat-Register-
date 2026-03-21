import { query } from '@/lib/db';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import Image from 'next/image';
import fs from 'fs';
import path from 'path';
import { Pencil } from 'lucide-react';

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
    
    return (
        <div className="min-h-screen bg-bg-site py-12 px-4 md:px-12 lg:px-24">
            <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-1000">
                <Breadcrumbs items={[{ label: 'КАТАЛОГ ФЕРМ' }]} />

                <header className="flex flex-col md:flex-row items-center justify-between border-b border-primary/10 pb-10 gap-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-black text-primary uppercase tracking-tighter italic m-0">ФЕРМЕРСКИЕ ХОЗЯЙСТВА</h1>
                        <p className="mt-1 text-[10px] font-black text-primary/40 uppercase tracking-[0.4em] italic leading-tight">Официальный реестр племенных хозяйств АПК</p>
                    </div>
                    <Link href="/farms/add" className="px-10 py-4 bg-primary text-secondary font-black rounded-2xl text-[10px] uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all shadow-xl active:scale-95 duration-500">
                        ДОБАВИТЬ ХОЗЯЙСТВО +
                    </Link>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                    {farms.map((farm: any) => (
                        <div key={farm.id} className="group flex flex-col items-center">
                            <Link href={`/farms/${farm.id}`} className="block relative w-full overflow-hidden rounded-3xl border-4 border-white shadow-2xl aspect-[1.1/1] bg-white transition-all duration-700 group-hover:shadow-4xl group-hover:border-secondary hover:-rotate-1">
                                <Image 
                                    src={farm.displayPic} 
                                    alt={farm.name} 
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
                                />
                                <div className="absolute top-4 right-4 bg-secondary text-primary px-3 py-1 rounded-xl font-black text-[8px] uppercase tracking-[0.2em] shadow-lg animate-pulse">
                                    MEMBER АПК
                                </div>
                            </Link>
                            
                            <div className="mt-6 text-center space-y-2">
                                <h3 className="text-sm font-black text-primary uppercase tracking-tight group-hover:text-secondary transition-colors origin-top">
                                    <Link href={`/farms/${farm.id}`} className="hover:underline underline-offset-8 decoration-primary/20 decoration-2">
                                        {farm.name}
                                    </Link>
                                </h3>
                                <div className="mt-4">
                                   <Link href={`/farms/${farm.id}/edit`} className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary/5 border border-primary/10 text-[10px] font-black text-primary hover:bg-secondary transition-all uppercase tracking-widest rounded-xl group/btn shadow-sm hover:shadow-md">
                                      <Pencil size={12} className="text-secondary group-hover/btn:text-primary transition-colors" />
                                      Редактировать
                                   </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
