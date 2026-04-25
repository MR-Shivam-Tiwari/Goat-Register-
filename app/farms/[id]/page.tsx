import { query } from '@/lib/db';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import Breadcrumbs from '@/components/Breadcrumbs';
import { cookies } from 'next/headers';
import { getTranslation, Locale } from '@/lib/translations';
import { Pencil, Info } from 'lucide-react';
import { getSessionUser } from '@/lib/access-control';

export const dynamic = 'force-dynamic';

interface Farm {
  id: number;
  name: string;
  tmpl: string; // This is the description
  pic1: string;
  pic2: string | null;
  displayAva?: string;
  displayPic2?: string | null;
}

function extractPrefix(farmName: string, goats: any[]): string {
  if (goats.length === 0) return farmName.split(/[ \.\-\/]/)[0];
  
  // Get the first word of every goat name
  const words = goats
    .map(g => g.name.trim().split(/[ \.\-\/]/)[0])
    .filter(w => w && w.length > 2); // Increased to 3+ characters
    
  if (words.length === 0) {
    const defaultPrefix = farmName.split(/[ \.\-\/]/)[0];
    return defaultPrefix.length > 2 ? defaultPrefix : '';
  }
  
  // Count frequencies
  const counts: Record<string, number> = {};
  words.forEach(w => {
    counts[w] = (counts[w] || 0) + 1;
  });
  
  // Return the most frequent first word
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
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
  if (!id || id === '0') return [];
  const result = await query(`
    SELECT DISTINCT ON (A.id)
      A.id, A.name, A.sex, A.id_user, B.name as breed_name, 
      Di.is_abg, Di.manuf, Di.owner, Di.date_born, Di.blood_percent
    FROM animals A
    LEFT JOIN goats_data Di ON A.id = Di.id_goat
    LEFT JOIN breeds B ON Di.id_breed = B.id
    WHERE A.id_farm = $1::int
    ORDER BY A.id, A.name ASC
  `, [id]);
  return result.rows;
}

async function getDisplacedGoats(id: string) {
  if (!id || id === '0') return [];
  // Align strictly with official movement records from public.goats_move
  const result = await query(`
    SELECT DISTINCT ON (A.id)
      A.id, A.name, A.sex, A.id_user, B.name as breed_name, 
      Di.is_abg, Di.manuf, Di.owner, Di.date_born, Di.blood_percent
    FROM animals A
    INNER JOIN goats_move M ON A.id = M.id_goat
    LEFT JOIN goats_data Di ON A.id = Di.id_goat
    LEFT JOIN breeds B ON Di.id_breed = B.id
    WHERE M.id_farm_of = $1::int
      AND A.id_farm != $1::int
      AND A.id_farm != 0
    ORDER BY A.id, A.name ASC
  `, [id]);
  return result.rows;
}

export default async function FarmDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const { id } = params;
  const farm = await getFarmData(id);
  
  const cookieStore = await cookies();
  const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
  const t = getTranslation(lang);
  
  const sessionUser = await getSessionUser();
  const isAdmin = sessionUser && sessionUser.role >= 10;

  if (!farm) return <div className="p-40 text-center text-4xl font-black text-[#491907] animate-pulse uppercase tracking-[1em]">{t.farms.farmNotFound}</div>;

  const goats = await getFarmGoats(id);
  const detectedPrefix = extractPrefix(farm.name, goats);
  const displaced = await getDisplacedGoats(id);
  const user = await getSessionUser();

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-8 px-4 md:px-12 lg:px-24 tracking-tight">
      <div className="max-w-[1500px] mx-auto space-y-4">
        <Breadcrumbs items={[{ label: t.farms.breadcrumbs, href: '/farms' }, { label: farm.name }]} />

        {/* FARM NAME & PREFIX - TOP LEVEL */}
        <div className="pb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-[#491907] uppercase tracking-tight">
                {farm.name}
            </h1>
            {detectedPrefix && (
                <p className="text-sm font-bold text-[#491907] uppercase tracking-widest mt-1 opacity-70">
                    Prefix: {detectedPrefix}
                </p>
            )}
        </div>

        {/* MAIN DISPLAY SECTION */}
        <section className="bg-[#FAF9F6] border border-gray-200 shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[500px]">
            {/* IMAGE COLUMN (Left) */}
            <div className="lg:w-[500px] shrink-0 bg-[#FFB000] flex items-center justify-center p-1 border-r border-gray-200">
                <img 
                    src={farm.displayPic2 || farm.displayAva || '/img/farm_placeholder.png'} 
                    alt={farm.name} 
                    className="max-w-full max-h-[500px] object-contain shadow-inner"
                />
            </div>

            {/* DESCRIPTION COLUMN (Right) */}
            <div className="flex-1 p-12 flex flex-col items-center justify-center text-center">
                <div className="max-w-2xl w-full">
                    <div 
                        className="text-[#491907] leading-loose font-medium prose prose-slate max-w-none prose-p:my-4 prose-strong:text-[#491907] text-[15px]"
                        dangerouslySetInnerHTML={{ __html: farm.tmpl }} 
                    />
                </div>
                
                {isAdmin && (
                    <div className="mt-8">
                        <a href={`/farms/${farm.id}/edit`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-2 bg-[#491907] text-white rounded-sm font-bold text-[11px] uppercase tracking-widest hover:bg-black transition-all group">
                            <Pencil size={14} />
                            {t.common.edit}
                        </a>
                    </div>
                )}
            </div>
        </section>

        <div className="pt-4">
            <Link href="/farms" className="text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:underline">
                ← {t.farms.toFarmList}
            </Link>
        </div>

        {/* DATA TABLES SECTION */}
        <div className="pt-12 space-y-12">
            {/* CURRENT STOCK */}
            <div className="space-y-4">
                <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-black border-b-2 border-black pb-3 flex items-center gap-3">
                    <span className="w-2 h-2 bg-black rounded-full"></span>
                    {t.farms.activeStockRegistry}
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
                                {goats.map((goat: any) => {
                                    const hasAccess = sessionUser && (sessionUser.role >= 10 || sessionUser.id === goat.id_user);
                                    return (
                                        <tr key={goat.id} className="hover:bg-amber-50/50 transition-colors">
                                            <td className="p-3 border-r border-gray-100 font-black text-blue-900 sticky left-0 z-10 bg-inherit shadow-[1px_0_0_0_rgba(0,0,0,0.1)]">
                                                {hasAccess ? (
                                                    <a href={`/goats/${goat.id}`} target="_blank" rel="noopener noreferrer" className="hover:underline leading-none truncate block">➔ {goat.name}</a>
                                                ) : (
                                                    <span className="leading-none truncate block opacity-50">➔ {goat.name}</span>
                                                )}
                                            </td>
                                            <td className="p-3 border-r border-gray-100 text-center text-primary font-black opacity-80">{goat.breed_name}</td>
                                            <td className="p-3 border-r border-gray-100 text-center font-black text-blue-700 bg-blue-50/20">{goat.blood_percent ? `${goat.blood_percent}%` : '-'}</td>
                                            <td className="p-3 border-r border-gray-100 text-center font-bold text-black">{goat.sex === 1 ? t.goats.male : t.goats.female}</td>
                                            <td className="p-3 border-r border-gray-100 text-center font-mono text-[10px]">{goat.is_abg === 1 ? t.users.yes : t.users.no}</td>
                                            <td className="p-3 border-r border-gray-100 truncate text-[10px] opacity-60">{goat.manuf}</td>
                                            <td className="p-3 border-r border-gray-100 truncate text-[10px] opacity-60">{goat.owner}</td>
                                            <td className="p-3 text-center font-mono opacity-50 whitespace-nowrap">{goat.date_born ? new Date(goat.date_born).toLocaleDateString('ru-RU') : '-'}</td>
                                        </tr>
                                    );
                                })}
                                {goats.length === 0 && (
                                    <tr><td colSpan={8} className="p-40 text-center font-black uppercase opacity-20 text-3xl tracking-widest">{t.farms.emptyStock}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* RELOCATED STOCK */}
            {displaced.length > 0 && (
            <div className="space-y-4 pt-4">
                <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-red-950 border-b-2 border-red-200 pb-3 flex items-center gap-3">
                    <span className="w-2 h-2 bg-red-950 rounded-full animate-pulse"></span>
                    {t.farms.displacedStock}
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
                                {displaced.map((goat: any) => {
                                    const hasAccess = sessionUser && (sessionUser.role >= 10 || sessionUser.id === goat.id_user);
                                    return (
                                        <tr key={goat.id} className="hover:bg-red-50/40 transition-colors">
                                            <td className="p-3 border-r border-red-50 sticky left-0 z-10 bg-inherit shadow-[1px_0_0_0_rgba(153,0,0,0.1)]">
                                                {hasAccess ? (
                                                    <a href={`/goats/${goat.id}`} target="_blank" rel="noopener noreferrer" className="hover:underline leading-none truncate block font-black text-black">➔ {goat.name}</a>
                                                ) : (
                                                    <span className="leading-none truncate block font-black opacity-30 text-black">➔ {goat.name}</span>
                                                )}
                                            </td>
                                            <td className="p-3 border-r border-red-50 text-center font-mono text-gray-900">{goat.breed_name}</td>
                                            <td className="p-3 border-r border-red-50 text-center font-black text-blue-700 bg-red-50/10">{goat.blood_percent ? `${goat.blood_percent}%` : '-'}</td>
                                            <td className="p-3 border-r border-red-50 text-center font-black text-black">{goat.sex === 1 ? 'M' : 'F'}</td>
                                            <td className="p-3 border-r border-red-50 text-center text-black">{goat.is_abg === 1 ? t.users.yes : t.users.no}</td>
                                            <td className="p-3 border-r border-red-50 truncate text-[10px] text-gray-700">{goat.manuf}</td>
                                            <td className="p-3 border-r border-red-50 truncate text-[10px] text-gray-700">{goat.owner}</td>
                                            <td className="p-3 text-center font-mono whitespace-nowrap opacity-50 text-black">{goat.date_born ? new Date(goat.date_born).toLocaleDateString('ru-RU') : '-'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            )}
        </div>
      </div>
    </div>
  );
}
