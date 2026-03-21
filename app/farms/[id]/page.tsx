import { query } from '@/lib/db';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import Breadcrumbs from '@/components/Breadcrumbs';
import { cookies } from 'next/headers';
import { getTranslation, Locale } from '@/lib/translations';
import { Pencil } from 'lucide-react';

interface Farm {
  id: number;
  name: string;
  tmpl: string;
  pic1: string;
  pic2: string | null;
  displayAva?: string;
  displayPic2?: string | null;
}

async function getFarmData(id: string): Promise<Farm | null> {
  const result = await query('SELECT id, name, tmpl, pic1, pic2 FROM farms WHERE id = $1', [id]);
  if (result.rows.length === 0) return null;
  
  const farm = result.rows[0] as Farm;
  let finalAva = '/img/farm_placeholder.png';
  
  if (farm.pic1 && farm.pic1 !== 'no_pic.png') {
    const pathsToCheck = [
      path.join(process.cwd(), 'public', 'img', 'farm', farm.pic1),
      path.join(process.cwd(), 'public', 'img', farm.pic1)
    ];
    
    for (const p of pathsToCheck) {
      if (fs.existsSync(p)) {
        finalAva = p.includes('public/img/farm/') ? `/img/farm/${farm.pic1}` : `/img/${farm.pic1}`;
        break;
      }
    }
  }

  let finalPic2 = null;
  if (farm.pic2 && farm.pic2 !== 'no_pic.png') {
    const pathsToCheck2 = [
      path.join(process.cwd(), 'public', 'img', 'farm', farm.pic2),
      path.join(process.cwd(), 'public', 'img', farm.pic2)
    ];
    for (const p of pathsToCheck2) {
      if (fs.existsSync(p)) {
        finalPic2 = p.includes('public/img/farm/') ? `/img/farm/${farm.pic2}` : `/img/${farm.pic2}`;
        break;
      }
    }
  }

  return { ...farm, displayAva: finalAva, displayPic2: finalPic2 };
}

export default async function FarmDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const { id } = params;
  
  const farm = await getFarmData(id);
  const cookieStore = await cookies();
  const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
  const t = getTranslation(lang);
  const isAdmin = cookieStore.get('uid_token')?.value;

  if (!farm) return <div className="p-40 text-center text-4xl font-black text-primary animate-pulse uppercase tracking-[1em]">Farm not found</div>;

  return (
    <div className="min-h-screen bg-bg-site py-12 px-6 lg:px-24">
      <div className="max-w-6xl mx-auto space-y-12">
        <Breadcrumbs items={[{ label: t.farms.breadcrumbs, href: '/farms' }, { label: farm.name }]} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-primary/5">
              <div className="aspect-[3/4] relative">
                <img 
                  src={farm.displayAva || '/img/farm_placeholder.png'} 
                  alt={farm.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 bg-primary text-secondary">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-3 block opacity-60">{t.farms.trustedBreeder}</span>
                 <h3 className="text-xl font-black mb-6 uppercase tracking-tight leading-tight">ФЕРМА ПРОШЛА <br/> ВЕРИФИКАЦИЮ</h3>
                 <button className="w-full py-4 bg-secondary text-primary font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-white transition-all">
                    СВИДЕТЕЛЬСТВО ➔
                 </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
               <div>
                  <div className="inline-block px-8 py-2 rounded-full bg-secondary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-8">
                     ID #{farm.id}
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black text-primary tracking-tighter uppercase leading-[0.9] mb-4">{farm.name}</h1>
                  <p className="text-xl font-bold text-secondary uppercase tracking-widest italic">{t.farms.officialMember}</p>
               </div>
               {isAdmin && (
                  <Link href={`/farms/${farm.id}/edit`} className="flex items-center gap-3 px-8 py-4 bg-secondary text-primary rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-primary hover:text-white transition-all transform hover:-translate-y-2 group">
                     <Pencil size={14} className="group-hover:rotate-12 transition-transform" />
                     РЕДАКТИРОВАТЬ
                  </Link>
               )}
            </header>

            <div className="bg-white p-10 md:p-14 rounded-3xl border border-primary/5 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-8xl font-black pointer-events-none uppercase">{farm.name}</div>
               <div 
                  dangerouslySetInnerHTML={{ __html: farm.tmpl }} 
                  className="farm-tmpl-content text-primary/70 font-medium leading-relaxed text-base md:text-lg [&_p]:mb-8 [&_span]:!text-inherit [&_font]:!text-inherit [&_font]:!font-inherit"
               />
            </div>

            {farm.displayPic2 && (
               <div className="rounded-3xl overflow-hidden shadow-xl border border-primary/10 aspect-video">
                  <img 
                    src={farm.displayPic2} 
                    alt="Farm View" 
                    className="w-full h-full object-cover"
                  />
               </div>
            )}

            <div className="flex flex-col sm:flex-row gap-6 pt-10">
               <Link href="/farms" className="px-10 py-5 border-2 border-primary text-primary font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all text-center">
                  ← К СПИСКУ ФЕРМ
               </Link>
               <Link href="/catalog/goats" className="px-10 py-5 bg-primary text-secondary font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] hover:bg-secondary hover:text-primary transition-all text-center flex-1">
                  СМОТРЕТЬ ЖИВОТНЫХ
               </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
