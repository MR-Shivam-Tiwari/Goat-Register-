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
                <header className="flex items-center justify-between py-2 border-b border-[#491907]/10">
                    <h2 className="text-[22px] font-light text-[#491907] uppercase tracking-tight leading-none">
                        {t.farms.activeStockRegistry}
                    </h2>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                        {goats.length} RECORDS FOUND
                    </div>
                </header>

                <div className="flex-1 min-h-[300px] overflow-auto bg-white border border-black relative">
                    <table className="w-full text-left border-collapse table-auto min-w-[1300px] text-[10.5px] font-normal leading-none">
                        <thead className="sticky top-0 z-30 shadow-sm">
                            <tr className="text-[9px] font-bold uppercase tracking-tight text-white bg-[#5F2000] border-b border-black">
                                <th colSpan={8} className="p-1.5 text-center border-r border-black uppercase tracking-widest">
                                    {t.farms.activeStockRegistry}
                                </th>
                            </tr>
                            <tr className="text-[9px] font-bold uppercase tracking-tight text-gray-900 border-b border-black bg-[#B5F4BB]">
                                <th className="p-1 px-4 border-r border-black sticky left-0 bg-[#B5F4BB] z-40 w-64">{t.goats.nickname}</th>
                                <th className="p-1 px-4 border-r border-black text-center">{t.goats.breed}</th>
                                <th className="p-1 px-4 border-r border-black text-center w-24">Σ %</th>
                                <th className="p-1 px-4 border-r border-black text-center w-24">{t.goats.sex}</th>
                                <th className="p-1 px-4 border-r border-black text-center w-24">{t.goats.idAbg}</th>
                                <th className="p-1 px-4 border-r border-black text-center">{t.goats.breeder}</th>
                                <th className="p-1 px-4 border-r border-black text-center">{t.goats.owner}</th>
                                <th className="p-1 px-4 border-black text-center w-36">{t.goats.birthDate || 'Born'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black bg-white">
                            {goats.map((goat: any, idx: number) => {
                                const hasAccess = sessionUser && (sessionUser.role >= 10 || sessionUser.id === goat.id_user);
                                const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#B5F4BB';
                                return (
                                    <tr 
                                      key={goat.id} 
                                      style={{ backgroundColor: rowBg }}
                                      className="divide-x divide-black h-8 hover:opacity-90 transition-opacity"
                                    >
                                        <td 
                                          style={{ backgroundColor: rowBg }}
                                          className="p-1 px-4 sticky left-0 z-20 border-r border-black font-bold whitespace-nowrap"
                                        >
                                            {hasAccess ? (
                                                <a href={`/goats/${goat.id}`} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2 text-black">
                                                    <span className="opacity-30">➔</span>
                                                    {goat.name}
                                                </a>
                                            ) : (
                                                <span className="flex items-center gap-2 opacity-50 text-black">
                                                    <span className="opacity-30">➔</span>
                                                    {goat.name}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-1 px-4 text-center uppercase opacity-80">{goat.breed_name}</td>
                                        <td className="p-1 px-4 text-center font-bold text-blue-900">{goat.blood_percent ? `${goat.blood_percent}%` : '-'}</td>
                                        <td className="p-1 px-4 text-center uppercase font-bold">{goat.sex === 1 ? t.goats.male : t.goats.female}</td>
                                        <td className="p-1 px-4 text-center font-bold">{goat.is_abg === 1 ? t.users.yes : t.users.no}</td>
                                        <td className="p-1 px-4 truncate max-w-[250px] uppercase">{goat.manuf}</td>
                                        <td className="p-1 px-4 truncate max-w-[250px] uppercase">{goat.owner}</td>
                                        <td className="p-1 px-4 text-center font-mono tabular-nums">{goat.date_born ? new Date(goat.date_born).toLocaleDateString('ru-RU') : '-'}</td>
                                    </tr>
                                );
                            })}
                            {goats.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                                        {t.farms.emptyStock}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* RELOCATED STOCK */}
            {displaced.length > 0 && (
            <div className="space-y-4 pt-4">
                <header className="flex items-center justify-between py-2 border-b border-red-900/10">
                    <h2 className="text-[22px] font-light text-red-950 uppercase tracking-tight leading-none">
                        {t.farms.displacedStock}
                    </h2>
                    <div className="text-[10px] font-bold text-red-400 uppercase tracking-[0.2em]">
                        {displaced.length} RECORDS FOUND
                    </div>
                </header>

                <div className="flex-1 min-h-[150px] overflow-auto bg-white border border-black relative">
                    <table className="w-full text-left border-collapse table-auto min-w-[1300px] text-[10.5px] font-normal leading-none">
                        <thead className="sticky top-0 z-30 shadow-sm">
                            <tr className="text-[9px] font-bold uppercase tracking-tight text-white bg-red-950 border-b border-black">
                                <th colSpan={8} className="p-1.5 text-center border-r border-black uppercase tracking-widest">
                                    {t.farms.displacedStock}
                                </th>
                            </tr>
                            <tr className="text-[9px] font-bold uppercase tracking-tight text-gray-900 border-b border-black bg-red-50">
                                <th className="p-1 px-4 border-r border-black sticky left-0 bg-red-50 z-40 w-64">{t.goats.nickname}</th>
                                <th className="p-1 px-4 border-r border-black text-center">{t.goats.breed}</th>
                                <th className="p-1 px-4 border-r border-black text-center w-24">Σ %</th>
                                <th className="p-1 px-4 border-r border-black text-center w-24">{t.goats.sex}</th>
                                <th className="p-1 px-4 border-r border-black text-center w-24">{t.goats.idAbg}</th>
                                <th className="p-1 px-4 border-r border-black text-center">{t.goats.breeder}</th>
                                <th className="p-1 px-4 border-r border-black text-center">{t.goats.owner}</th>
                                <th className="p-1 px-4 border-black text-center w-36">{t.goats.birthDate || 'Born'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black bg-white">
                            {displaced.map((goat: any, idx: number) => {
                                const hasAccess = sessionUser && (sessionUser.role >= 10 || sessionUser.id === goat.id_user);
                                const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#FEF2F2';
                                return (
                                    <tr 
                                      key={goat.id} 
                                      style={{ backgroundColor: rowBg }}
                                      className="divide-x divide-black h-8 hover:opacity-90 transition-opacity"
                                    >
                                        <td 
                                          style={{ backgroundColor: rowBg }}
                                          className="p-1 px-4 sticky left-0 z-20 border-r border-black font-bold whitespace-nowrap"
                                        >
                                            {hasAccess ? (
                                                <a href={`/goats/${goat.id}`} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2 text-red-950">
                                                    <span className="opacity-30">➔</span>
                                                    {goat.name}
                                                </a>
                                            ) : (
                                                <span className="flex items-center gap-2 opacity-50 text-red-950">
                                                    <span className="opacity-30">➔</span>
                                                    {goat.name}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-1 px-4 text-center uppercase opacity-80">{goat.breed_name}</td>
                                        <td className="p-1 px-4 text-center font-bold text-blue-900">{goat.blood_percent ? `${goat.blood_percent}%` : '-'}</td>
                                        <td className="p-1 px-4 text-center uppercase font-bold">{goat.sex === 1 ? 'M' : 'F'}</td>
                                        <td className="p-1 px-4 text-center font-bold">{goat.is_abg === 1 ? t.users.yes : t.users.no}</td>
                                        <td className="p-1 px-4 truncate max-w-[250px] uppercase">{goat.manuf}</td>
                                        <td className="p-1 px-4 truncate max-w-[250px] uppercase">{goat.owner}</td>
                                        <td className="p-1 px-4 text-center font-mono tabular-nums">{goat.date_born ? new Date(goat.date_born).toLocaleDateString('ru-RU') : '-'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            )}
        </div>
      </div>
    </div>
  );
}
