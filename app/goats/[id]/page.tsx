import { query } from '@/lib/db';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { cookies } from 'next/headers';
import { getTranslation, Locale } from '@/lib/translations';

export const dynamic = 'force-dynamic';

async function getGoatData(id: string) {
  const result = await query(`
    SELECT A.*, Di.*, B.name as breed_name, F.name as farm_name, S.name as studbook_name
    FROM animals A
    JOIN goats_data Di ON A.id = Di.id_goat
    JOIN breeds B ON Di.id_breed = B.id
    LEFT JOIN farms F ON A.id_farm = F.id
    LEFT JOIN stoodbook S ON Di.id_stoodbook = S.id
    WHERE A.id = $1
  `, [id]);
  return result.rows[0];
}

async function getParents(goat: any) {
  const parents: any = { father: null, mother: null };
  if (goat.id_father) {
    const res = await query('SELECT id, name FROM animals WHERE id = $1', [goat.id_father]);
    parents.father = res.rows[0];
  }
  if (goat.id_mother) {
    const res = await query('SELECT id, name FROM animals WHERE id = $1', [goat.id_mother]);
    parents.mother = res.rows[0];
  }
  return parents;
}

async function getOffspring(id: string) {
  const result = await query(`
    SELECT id, name, sex FROM animals 
    WHERE id_mother = $1 OR id_father = $1
    ORDER BY time_added DESC
  `, [id]);
  return result.rows;
}

async function getGallery(id: string) {
  const result = await query('SELECT file FROM goats_pic WHERE id_goat = $1 ORDER BY time_added DESC', [id]);
  return result.rows;
}

async function getLactation(id: string) {
  const result = await query('SELECT * FROM goats_lact WHERE id_goat = $1 ORDER BY lact_no ASC', [id]);
  return result.rows;
}

async function getAncestors(id: number, level: number = 0): Promise<any> {
    if (level >= 5 || !id) return null;
    const res = await query('SELECT id, name, id_father, id_mother, sex FROM animals WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    const goat = res.rows[0];
    const dataRes = await query('SELECT code_ua FROM goats_data WHERE id_goat = $1', [goat.id]);
    goat.code_ua = dataRes.rows[0]?.code_ua;

    return {
        ...goat,
        father: await getAncestors(goat.id_father, level + 1),
        mother: await getAncestors(goat.id_mother, level + 1)
    };
}

export default async function GoatDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const { id } = await paramsPromise;
  const goat = await getGoatData(id);
  
  if (!goat) return <div className="p-40 text-center text-4xl font-black text-primary uppercase bg-[#F0F4F0] min-h-screen">ANIMAL NOT FOUND</div>;

  const [parents, offspring, gallery, lactation, ancestry] = await Promise.all([
    getParents(goat),
    getOffspring(id),
    getGallery(id),
    getLactation(id),
    getAncestors(parseInt(id))
  ]);

  const cookieStore = await cookies();
  const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
  const t = getTranslation(lang);

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-8 px-2 md:px-10 lg:px-20 font-sans tracking-tight">
      <div className="max-w-[1700px] mx-auto space-y-8">
        <Breadcrumbs items={[{ label: t.nav.registry, href: '/goats' }, { label: goat.name }]} />

        {/* PROFILE HEADER GRID */}
        <section className="bg-white border rounded-sm shadow-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
                <span className={`px-4 py-1.5 rounded-sm text-[11px] font-black uppercase tracking-widest ${goat.status === 1 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                    {goat.status === 1 ? 'ALIVE / ЖИВОЕ' : 'DEAD / ВЫБЫЛО'}
                </span>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* LEFT: PHOTO & TITLE */}
                <div className="w-full lg:w-1/4 space-y-4">
                    <div className="aspect-square bg-gray-50 border border-gray-100 rounded-sm overflow-hidden flex items-center justify-center p-2">
                        <img 
                            src={gallery[0] ? `/img/${gallery[0].file}` : '/img/noimage.gif'} 
                            alt={goat.name} 
                            className="max-h-full object-contain hover:scale-105 transition-transform"
                        />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 uppercase italic leading-none">{goat.name}</h1>
                        <p className="text-[#1A5F7A] font-mono text-xs mt-2 font-bold opacity-60">UA-CODE: {goat.code_ua || '-'}</p>
                    </div>
                </div>

                {/* RIGHT: CORE DATA TABLE */}
                <div className="flex-1">
                    <div className="bg-[#E2F0D9] px-4 py-2 border-b border-gray-300">
                        <h2 className="text-[12px] font-black uppercase tracking-widest text-[#491907]">Core Registry Information</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 border-l border-t border-gray-200 bg-white">
                        <DataBox label="Sex / Пол" value={goat.sex === 1 ? 'MALE / CAMЕЦ' : 'FEMALE / CAMKA'} />
                        <DataBox label="Breed / Порода" value={goat.breed_name} />
                        <DataBox label="Born / Дата рожд" value={goat.date_born ? new Date(goat.date_born).toLocaleDateString('ru-RU') : '-'} />
                        <DataBox label="Born Weight / Вес" value={goat.born_weight ? `${goat.born_weight}g` : '-'} />
                        <DataBox label="Litter Size / Кол-во" value={goat.born_qty || '-'} />
                        <DataBox label="Horns / Рогатость" value={goat.horns_type || '-'} />
                        <DataBox label="ABG Member" value={goat.is_abg ? 'YES / ДA' : 'NO / HЕТ'} />
                        <DataBox label="Registry / Реестр" value={goat.studbook_name || '-'} />
                        <DataBox label="Breeder / Заводчик" value={goat.manuf} isTruncate />
                        <DataBox label="Owner / Владелец" value={goat.owner} isTruncate />
                        <DataBox label="Farm / Ферма" value={goat.farm_name} isTruncate />
                        <DataBox label="Operator / ID" value={goat.id_user || 'SYSTEM'} />
                    </div>

                    <div className="mt-6 bg-[#C5E0B4] px-4 py-2 border-b border-gray-300">
                        <h2 className="text-[12px] font-black uppercase tracking-widest text-[#491907]">Genetic Identifiers</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 border-l border-t border-gray-200 bg-white">
                        <DataBox label="ID ABG" value={goat.code_abg || '-'} />
                        <DataBox label="ID RK" value="-" />
                        <DataBox label="ID Chip" value={goat.code_chip || '-'} />
                        <DataBox label="International" value={goat.code_int || '-'} />
                        <DataBox label="Tattoo / Клеймо" value={goat.code_brand || '-'} />
                        <DataBox label="Gen Passport" value={goat.have_gen || 'NO'} />
                        <DataBox label="Gen Material" value={goat.gen_mat || 'NO'} />
                        <DataBox label="System ID" value={id} />
                    </div>
                </div>
            </div>
        </section>

        {/* ANCESTRY SECTION */}
        <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 border-b border-gray-300 pb-2 italic">Five-Generation Pedigree</h3>
            <div className="overflow-hidden border border-gray-300 shadow-sm bg-white overflow-x-auto min-h-[550px]">
                <PedigreeGrid ancestry={ancestry} />
            </div>
        </section>

        {/* BOTTOM DATA GRIDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
            {/* OFFSPRING */}
            <section className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 border-b border-gray-300 pb-2 italic">Offspring Database</h3>
                <div className="border border-gray-300 bg-white rounded-sm overflow-hidden">
                    <table className="w-full text-[11px] border-collapse uppercase font-bold">
                        <thead className="bg-[#4D2C1A] text-white uppercase font-black tracking-widest">
                            <tr>
                                <th className="p-3 border-r border-white/10 text-left">Sons / Сыновья</th>
                                <th className="p-3 text-left">Daughters / Дочери</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="p-4 align-top border-r space-y-2 bg-[#E2F0D9]/5">
                                    {offspring.filter(o => o.sex === 1).map(s => (
                                        <Link key={s.id} href={`/goats/${s.id}`} className="block text-blue-900 hover:underline">➔ {s.name}</Link>
                                    ))}
                                    {offspring.filter(o => o.sex === 1).length === 0 && <span className="opacity-30 italic">No sons recorded</span>}
                                </td>
                                <td className="p-4 align-top space-y-2 bg-[#F8CBAD]/5">
                                    {offspring.filter(o => o.sex === 2 || o.sex === 0).map(d => (
                                        <Link key={d.id} href={`/goats/${d.id}`} className="block text-blue-900 hover:underline">➔ {d.name}</Link>
                                    ))}
                                    {offspring.filter(o => o.sex === 2 || o.sex === 0).length === 0 && <span className="opacity-30 italic">No daughters recorded</span>}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* LACTATION */}
            <section className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 border-b border-gray-300 pb-2 italic">Productivity / Lactation</h3>
                <div className="overflow-x-auto border border-gray-300 bg-white rounded-sm">
                    <table className="w-full text-[11px] border-collapse text-center">
                        <thead className="bg-[#4D2C1A] text-white uppercase font-black tracking-widest whitespace-nowrap">
                            <tr>
                                <th className="p-3 border-r border-white/10">№</th>
                                <th className="p-3 border-r border-white/10">Days</th>
                                <th className="p-3 border-r border-white/10">Milk (kg)</th>
                                <th className="p-3 border-r border-white/10">Fat %</th>
                                <th className="p-3 border-r border-white/10">Prot %</th>
                                <th className="p-3 border-r border-white/10">Avg/Day</th>
                                <th className="p-3">Graph</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 uppercase font-bold">
                             {lactation.length === 0 ? (
                                <tr><td colSpan={7} className="p-12 text-center text-gray-300 italic">No lactation metrics recorded for this interval</td></tr>
                            ) : (
                                lactation.map((l, i) => (
                                    <tr key={l.id} className="hover:bg-amber-50">
                                        <td className="p-3 border-r border-gray-200">{l.lact_no}</td>
                                        <td className="p-3 border-r border-gray-200">{l.lact_days || '-'}</td>
                                        <td className="p-3 border-r border-gray-200 text-red-800 font-black">{l.milk || '-'}</td>
                                        <td className="p-3 border-r border-gray-200">{l.fat || '-'}</td>
                                        <td className="p-3 border-r border-gray-200">{l.protein || '-'}</td>
                                        <td className="p-3 border-r border-gray-200">{l.milk_day || '-'}</td>
                                        <td className="p-3">{l.have_graph === 1 ? 'YES' : 'NO'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>

        {/* GALLERY */}
        {gallery.length > 1 && (
            <section className="space-y-4 pb-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 border-b border-gray-300 pb-2 italic">Additional Media</h3>
                <div className="flex flex-wrap gap-4">
                    {gallery.slice(1).map((pic, idx) => (
                        <div key={idx} className="w-32 h-32 rounded-sm border bg-white overflow-hidden p-1 shadow-sm hover:border-blue-500 transition-colors">
                            <img src={`/img/${pic.file}`} alt="Media" className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer" />
                        </div>
                    ))}
                </div>
            </section>
        )}
      </div>
    </div>
  );
}

function DataBox({ label, value, isTruncate }: { label: string, value: any, isTruncate?: boolean }) {
    return (
        <div className="p-4 border-r border-b border-gray-200 flex flex-col justify-center min-h-[60px]">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1 leading-none">{label}</span>
            <span className={`text-[12px] font-black text-gray-900 uppercase tracking-tight leading-none ${isTruncate ? 'truncate' : ''}`}>
                {value || '-'}
            </span>
        </div>
    );
}

function PedigreeGrid({ ancestry }: { ancestry: any }) {
  if (!ancestry) return null;

  return (
    <div className="flex w-full min-w-[1500px] text-[11px] uppercase font-black min-h-[550px] bg-[#E2F0D9]/5">
      {/* Col 1: Parents */}
      <div className="flex-[1] flex flex-col border-r-2 border-primary/10">
        <PedigreeBlock node={ancestry.father} label="SIRE / ОТЕЦ" color="bg-[#C5E0B4]/20 border-b-2 border-gray-300" />
        <PedigreeBlock node={ancestry.mother} label="DAM / МАТЬ" color="bg-[#F8CBAD]/20" />
      </div>

      {/* Col 2: Grandparents */}
      <div className="flex-[1.2] flex flex-col border-r-2 border-primary/10">
        {[ancestry.father, ancestry.mother].map((parent, pIdx) => (
          <div key={pIdx} className="flex-1 flex flex-col border-b-2 last:border-0 border-gray-300">
            <PedigreeBlock node={parent?.father} label={pIdx === 0 ? "FF / ОТЕЦ ОТЦА" : "MF / ОТЕЦ МАТЕРИ"} color="bg-[#C5E0B4]/10" />
            <PedigreeBlock node={parent?.mother} label={pIdx === 0 ? "FM / МАТЬ ОТЦА" : "MM / МАТЬ МАТЕРИ"} color="bg-[#F8CBAD]/10" />
          </div>
        ))}
      </div>

      {/* Col 3: G-Grandparents */}
      <div className="flex-[1.5] flex flex-col border-r-2 border-primary/10">
        {[ancestry.father, ancestry.mother].map((p, pIdx) => 
          [p?.father, p?.mother].map((gp, gpIdx) => (
            <div key={`${pIdx}-${gpIdx}`} className="flex-1 flex flex-col border-b last:border-0 border-gray-200">
              <PedigreeBlock node={gp?.father} label={gpIdx === 0 ? "FFF" : "MFF"} color="opacity-80" />
              <PedigreeBlock node={gp?.mother} label={gpIdx === 0 ? "FFM" : "MFM"} color="opacity-80" />
            </div>
          ))
        )}
      </div>

      {/* Col 4: GG-Grandparents */}
      <div className="flex-[2] flex flex-col border-r border-gray-200">
         {[ancestry.father, ancestry.mother].map((p, pIdx) => 
          [p?.father, p?.mother].map((gp, gpIdx) => 
             [gp?.father, gp?.mother].map((ggp, ggpIdx) => (
                <div key={`${pIdx}-${gpIdx}-${ggpIdx}`} className="flex-1 flex flex-col border-b last:border-0 border-gray-100">
                    <PedigreeBlock node={ggp?.father} label="SIRE" color="opacity-60" />
                    <PedigreeBlock node={ggp?.mother} label="DAM" color="opacity-60" />
                </div>
             ))
          )
        )}
      </div>

      {/* Col 5: GGG-Grandparents */}
      <div className="flex-[2] flex flex-col">
        {Array.from({ length: 16 }).map((_, i) => (
             <div key={i} className="flex-1 flex flex-col border-b last:border-0 border-gray-100/50">
                 <div className="flex-1 flex items-center px-4 py-2 text-[9px] italic opacity-20 border-b border-gray-50">-</div>
                 <div className="flex-1 flex items-center px-4 py-2 text-[9px] italic opacity-20">-</div>
             </div>
        ))}
      </div>
    </div>
  );
}

function PedigreeBlock({ node, label, color }: { node: any, label?: string, color?: string }) {
  return (
    <div className={`flex-1 flex flex-col justify-center px-6 py-4 border-b border-gray-200 last:border-0 ${color || ''}`}>
      {label && <span className="text-[9px] text-gray-400 mb-1 font-black leading-none">{label}</span>}
      {node ? (
        <>
            <Link href={`/goats/${node.id}`} className="text-blue-950 font-black hover:text-red-800 hover:underline leading-tight truncate text-[11px]">
                {node.name}
            </Link>
            <span className="text-[9px] opacity-60 mt-1 font-mono font-bold leading-none italic">ID: {node.code_ua || node.id}</span>
        </>
      ) : (
        <span className="text-gray-300 italic text-[11px]">-</span>
      )}
    </div>
  );
}
