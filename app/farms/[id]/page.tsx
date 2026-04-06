import { query } from '@/lib/db';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import Breadcrumbs from '@/components/Breadcrumbs';
import { cookies } from 'next/headers';
import { getTranslation, Locale } from '@/lib/translations';
import { Pencil } from 'lucide-react';

export const dynamic = 'force-dynamic';

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
      path.join(process.cwd(), 'public', 'uploads', farm.pic1),
      path.join(process.cwd(), 'public', 'img', 'farm', farm.pic1),
      path.join(process.cwd(), 'public', 'img', farm.pic1)
    ];
    for (const p of pathsToCheck) {
      if (fs.existsSync(p)) {
        if (p.includes('public/uploads/')) {
          finalAva = `/uploads/${farm.pic1}`;
        } else if (p.includes('public/img/farm/')) {
          finalAva = `/img/farm/${farm.pic1}`;
        } else {
          finalAva = `/img/${farm.pic1}`;
        }
        break;
      }
    }
  }

  let finalPic2 = null;
  if (farm.pic2 && farm.pic2 !== 'no_pic.png') {
    const pathsToCheck2 = [
      path.join(process.cwd(), 'public', 'uploads', farm.pic2),
      path.join(process.cwd(), 'public', 'img', 'farm', farm.pic2),
      path.join(process.cwd(), 'public', 'img', farm.pic2)
    ];
    for (const p of pathsToCheck2) {
      if (fs.existsSync(p)) {
        if (p.includes('public/uploads/')) {
          finalPic2 = `/uploads/${farm.pic2}`;
        } else if (p.includes('public/img/farm/')) {
          finalPic2 = `/img/farm/${farm.pic2}`;
        } else {
          finalPic2 = `/img/${farm.pic2}`;
        }
        break;
      }
    }
  }

  return { ...farm, displayAva: finalAva, displayPic2: finalPic2 };
}

async function getFarmGoats(id: string) {
  const result = await query(`
    SELECT A.id, A.name, A.sex, B.name as breed_name, Di.is_abg, Di.manuf, Di.owner, Di.date_born, Di.blood_percent
    FROM animals A
    JOIN goats_data Di ON A.id = Di.id_goat
    JOIN breeds B ON Di.id_breed = B.id
    WHERE A.id_farm = $1
    ORDER BY A.name ASC
  `, [id]);
  return result.rows;
}

async function getDisplacedGoats(id: string, farmName: string) {
  const farmPrefix = farmName.split(' ')[0];
  const result = await query(`
    SELECT A.id, A.name, A.sex, B.name as breed_name, Di.is_abg, Di.manuf, Di.owner, Di.date_born, Di.blood_percent
    FROM animals A
    JOIN goats_data Di ON A.id = Di.id_goat
    JOIN breeds B ON Di.id_breed = B.id
    WHERE Di.manuf ILIKE '%' || $1 || '%' 
    AND (A.id_farm != $2 OR A.id_farm IS NULL)
    ORDER BY A.name ASC
  `, [farmPrefix, id]);
  return result.rows;
}

export default async function FarmDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const { id } = params;
  const farm = await getFarmData(id);
  
  const cookieStore = await cookies();
  const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
  const t = getTranslation(lang);
  const isAdmin = cookieStore.get('uid_token')?.value;

  if (!farm) return <div className="p-40 text-center text-4xl font-black text-[#491907] animate-pulse uppercase tracking-[1em]">{t.farms.farmNotFound}</div>;

  const [goats, displaced] = await Promise.all([
    getFarmGoats(id),
    getDisplacedGoats(id, farm.name)
  ]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-8 px-4 md:px-12 lg:px-24 tracking-tight">
      <div className="max-w-[1500px] mx-auto space-y-8">
        <Breadcrumbs items={[{ label: t.farms.breadcrumbs, href: '/farms' }, { label: farm.name }]} />

        {/* COMPACT DASHBOARD HEADER */}
        <section className="bg-white border rounded-lg shadow-xl overflow-hidden flex flex-col md:flex-row gap-0 text-black">
            {/* PHOTO COLUMN */}
            <div className="md:w-64 lg:w-80 shrink-0 relative bg-white border-r border-gray-100 flex items-center justify-center p-4">
                <img 
                    src={farm.displayAva || '/img/farm_placeholder.png'} 
                    alt={farm.name} 
                    className="w-full h-full object-contain max-h-[400px]"
                />
            </div>

            {/* INFO COLUMN */}
            <div className="flex-1 p-8 flex flex-col min-w-0">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-gray-100 pb-6 mb-6">
                    <div className="min-w-0 flex-1">
                        <span className="text-[12px] font-black uppercase text-gray-300 tracking-[0.3em] font-mono leading-none">{t.farms.officialIdPrefix}{farm.id} / {t.farms.officialMember}</span>
                        <h1 className="text-3xl md:text-5xl font-black text-primary uppercase italic tracking-tighter leading-none mt-2 break-words">{farm.name}</h1>
                        <p className="text-[11px] font-bold text-amber-900/60 uppercase tracking-widest mt-3">
                            {lang === 'ru' ? 'ПРЕФИКС' : 'PREFIX'}: <span className="text-amber-900 font-black">{farm.name.split(' ')[0]}</span>
                        </p>
                    </div>
                    {isAdmin && (
                        <a href={`/farms/${farm.id}/edit`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-[#491907] text-white rounded-lg font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-black transition-all group">
                            <Pencil size={14} className="group-hover:rotate-12 transition-transform" />
                            {t.common.edit}
                        </a>
                    )}
                </div>

                <div className="flex-1 overflow-auto max-h-[250px] mb-6">
                    <div 
                        dangerouslySetInnerHTML={{ __html: farm.tmpl }} 
                        className="farm-tmpl-content text-gray-600 font-bold leading-relaxed text-[12px] uppercase italic [&_p]:mb-2 [&_span]:!text-inherit break-words"
                    />
                </div>

                <div className="mt-auto flex flex-col sm:flex-row gap-4">
                    <Link href="/farms" className="px-8 py-3 border border-gray-200 text-gray-400 font-black rounded-sm text-[11px] uppercase tracking-widest hover:bg-gray-50 transition-all text-center">
                        ← {t.farms.toFarmList}
                    </Link>
                </div>
            </div>
        </section>

        {/* DATA TABLES SECURED IN COMPACT CONTAINERS */}
        <div className="space-y-12">
            {/* CURRENT STOCK */}
            <div className="space-y-4">
                <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-black border-b-2 border-black pb-3 italic flex items-center gap-3">
                    <span className="w-2 h-2 bg-black rounded-full"></span>
                    {lang === 'ru' ? 'ЖИВОТНЫЕ В ХОЗЯЙСТВЕ' : 'STOCK PRESENT ON FARM'}
                </h2>
                <div className="bg-white border rounded-sm overflow-hidden shadow-2xl relative min-h-[300px]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1300px]">
                            <thead className="sticky top-0 z-10 bg-gray-50 text-black shadow-sm border-b border-gray-400">
                                <tr className="text-[12px] font-black uppercase tracking-widest leading-none">
                                    <th className="p-4 border-r border-gray-400 w-56 sticky left-0 bg-gray-50 z-20">{t.goats.nickname}</th>
                                    <th className="p-4 border-r border-gray-400 w-44 text-center">{t.goats.breed}</th>
                                    <th className="p-4 border-r border-gray-400 w-24 text-center text-blue-800">Σ %</th>
                                    <th className="p-4 border-r border-gray-400 w-24 text-center">{t.goats.sex}</th>
                                    <th className="p-4 border-r border-gray-400 w-28 text-center">{t.goats.idAbg}</th>
                                    <th className="p-4 border-r border-gray-400 w-56">{t.goats.breeder}</th>
                                    <th className="p-4 border-r border-gray-400 w-56">{t.goats.owner}</th>
                                    <th className="p-4 text-center w-36">{t.goats.birthDate || 'Born'}</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] font-black uppercase tracking-tight divide-y divide-gray-200 bg-white text-black">
                                {goats.map((goat: any) => (
                                    <tr key={goat.id} className="hover:bg-amber-50/50 transition-colors">
                                        <td className="p-3 border-r border-gray-100 font-black text-blue-900 sticky left-0 z-10 bg-inherit shadow-[1px_0_0_0_rgba(0,0,0,0.1)]">
                                            <a href={`/goats/${goat.id}`} target="_blank" rel="noopener noreferrer" className="hover:underline italic leading-none truncate block">➔ {goat.name}</a>
                                        </td>
                                        <td className="p-3 border-r border-gray-100 text-center text-primary font-black opacity-80">{goat.breed_name}</td>
                                        <td className="p-3 border-r border-gray-100 text-center font-black text-blue-700 bg-blue-50/20">{goat.blood_percent ? `${goat.blood_percent}%` : '-'}</td>
                                        <td className="p-3 border-r border-gray-100 text-center font-bold text-black">{goat.sex === 1 ? t.goats.male : t.goats.female}</td>
                                        <td className="p-3 border-r border-gray-100 text-center font-mono text-[10px]">{goat.is_abg === 1 ? t.users.yes : t.users.no}</td>
                                        <td className="p-3 border-r border-gray-100 truncate text-[10px] opacity-60 italic">{goat.manuf}</td>
                                        <td className="p-3 border-r border-gray-100 truncate text-[10px] opacity-60 italic">{goat.owner}</td>
                                        <td className="p-3 text-center font-mono opacity-50 whitespace-nowrap">{goat.date_born ? new Date(goat.date_born).toLocaleDateString('ru-RU') : '-'}</td>
                                    </tr>
                                ))}
                                {goats.length === 0 && (
                                    <tr><td colSpan={7} className="p-40 text-center font-black uppercase opacity-20 text-3xl tracking-widest italic">{t.farms.emptyStock}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* RELOCATED STOCK */}
            {displaced.length > 0 && (
            <div className="space-y-4 pt-4">
                <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-red-950 border-b-2 border-red-200 pb-3 italic flex items-center gap-3">
                    <span className="w-2 h-2 bg-red-950 rounded-full animate-pulse"></span>
                    {lang === 'ru' ? 'ПЕРЕМЕЩЁННЫЕ ЖИВОТНЫЕ' : 'RELOCATED ANIMALS'}
                </h2>
                <div className="bg-white border border-red-50 rounded-sm overflow-hidden shadow-xl relative">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1300px]">
                            <thead className="sticky top-0 z-10 bg-red-50/30 text-black shadow-sm border-b border-red-200">
                                <tr className="text-[12px] font-black uppercase tracking-widest leading-none">
                                    <th className="p-4 border-r border-red-100 w-56 sticky left-0 bg-red-50/30 z-20">{t.goats.nickname}</th>
                                    <th className="p-4 border-r border-red-100 w-44 text-center">{t.goats.breed}</th>
                                    <th className="p-4 border-r border-red-100 w-24 text-center text-blue-800">Σ %</th>
                                    <th className="p-4 border-r border-red-100 w-24 text-center">{t.goats.sex}</th>
                                    <th className="p-4 border-r border-red-100 w-28 text-center">{t.goats.idAbg}</th>
                                    <th className="p-4 border-r border-red-100 w-56">{t.goats.breeder}</th>
                                    <th className="p-4 border-r border-red-100 w-56">{t.goats.owner}</th>
                                    <th className="p-4 text-center w-36">{t.goats.birthDate || 'Born'}</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] font-black uppercase tracking-tight divide-y divide-red-50 bg-white text-black">
                                {displaced.map((goat: any) => (
                                    <tr key={goat.id} className="hover:bg-red-50/40 transition-colors">
                                        <td className="p-3 border-r border-red-50 sticky left-0 z-10 bg-inherit shadow-[1px_0_0_0_rgba(153,0,0,0.1)]">
                                            <a href={`/goats/${goat.id}`} target="_blank" rel="noopener noreferrer" className="hover:underline italic leading-none truncate block font-black text-black">➔ {goat.name}</a>
                                        </td>
                                        <td className="p-3 border-r border-red-50 text-center font-mono text-gray-900">{goat.breed_name}</td>
                                        <td className="p-3 border-r border-red-50 text-center font-black text-blue-700 bg-red-50/10">{goat.blood_percent ? `${goat.blood_percent}%` : '-'}</td>
                                        <td className="p-3 border-r border-red-50 text-center font-black text-black">{goat.sex === 1 ? 'M' : 'F'}</td>
                                        <td className="p-3 border-r border-red-50 text-center text-black">{goat.is_abg === 1 ? t.users.yes : t.users.no}</td>
                                        <td className="p-3 border-r border-red-50 truncate text-[10px] italic text-gray-700">{goat.manuf}</td>
                                        <td className="p-3 border-r border-red-50 truncate text-[10px] italic text-gray-700">{goat.owner}</td>
                                        <td className="p-3 text-center font-mono whitespace-nowrap opacity-50 text-black">{goat.date_born ? new Date(goat.date_born).toLocaleDateString('ru-RU') : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            )}
        </div>

        {/* SECONDARY VIEW */}
        {farm.displayPic2 && (
            <div className="w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-2xl border border-gray-100 relative grayscale hover:grayscale-0 transition-all duration-700 opacity-60 hover:opacity-100 bg-white">
                <img src={farm.displayPic2} alt="Farm Detail View" className="w-full h-[400px] object-contain aspect-video" />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <span className="text-[12px] font-black uppercase text-white tracking-[0.5em] italic leading-none shadow-sm">{t.farms.verifiedInfrastructure}</span>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
