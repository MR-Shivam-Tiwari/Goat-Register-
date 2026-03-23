import { query } from '@/lib/db';
import Link from 'next/link';
import { Suspense } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';

interface Goat {
  name: string;
  sex: number;
  is_abg: number;
  manuf: string;
  owner: string;
  date_born: any;
  reg_id: number;
  id_stoodbook: number;
  code_ua: string;
  code_abg: string;
  code_farm: string;
  code_chip: string;
  code_int: string;
  code_brand: string;
  born_weight: number;
  born_qty: number;
  horns_type: string;
  have_gen: string;
  gen_mat: string;
  farm_name: string;
  m_name?: string;
  m_reg_code?: string;
  m_code_ua?: string;
  m_code_abg?: string;
  f_name?: string;
  f_reg_code?: string;
  f_code_ua?: string;
  f_code_abg?: string;
  status: number;
}

const STOODBOOK_MAP: Record<string, number> = {
    'rhb': 1,
    'f1': 2, 'f2': 3, 'f3': 4, 'f4': 5, 'f5': 6, 'f6': 7, 'f7': 8,
    'rfb': 9,
    'ex1': 10, 'ex2': 11, 'ex3': 12
};

const REGISTER_NAMES: Record<string, string> = {
    'rhb': 'ГЛАВНЫЙ РЕЕСТР (RHB)',
    'f1': 'RCB ПОКОЛЕНИЕ F1', 'f2': 'RCB ПОКОЛЕНИЕ F2', 'f3': 'RCB ПОКОЛЕНИЕ F3',
    'f4': 'RCB ПОКОЛЕНИЕ F4', 'f5': 'RCB ПОКОЛЕНИЕ F5', 'f6': 'RCB ПОКОЛЕНИЕ F6', 'f7': 'RCB ПОКОЛЕНИЕ F7',
    'rfb': 'ФЕНОТИПИЧЕСКИЙ РЕЕСТР (RFB)',
    'ex1': 'ЭКСПЕРИМЕНТАЛЬНЫЙ (до 50%)', 'ex2': 'ЭКСПЕРИМЕНТАЛЬНЫЙ (51-75%)', 'ex3': 'ЭКСПЕРИМЕНТАЛЬНЫЙ (76-98%)'
};

async function getBreedData(alias: string) {
  const result = await query('SELECT id, name, alias FROM breeds WHERE TRIM(alias) ILIKE TRIM($1)', [alias]);
  return result.rows[0];
}

async function getBreedPictures(alias: string) {
    const result = await query('SELECT sex, file FROM pictures WHERE TRIM(alias) ILIKE TRIM($1)', [alias]);
    const pics: Record<number, string> = {};
    result.rows.forEach(p => pics[p.sex] = p.file);
    return pics;
}

async function getGoats(breed_id: number, sex_slug: string, reg?: string, age?: string) {
    let sex = sex_slug === 'male' ? 1 : 0;
    let status = 1; 
    let ageClause = '';
    
    if (age) {
        ageClause = `AND Di.date_born > (CURRENT_DATE - INTERVAL '${age} month')`;
    }

    let sql = `
      SELECT 
        A.name, A.sex, A.id as reg_id, A.status,
        Di.*, 
        M.name as m_name, M.id as m_reg_code, DiM.code_ua as m_code_ua, DiM.code_abg as m_code_abg,
        F.name as f_name, F.id as f_reg_code, DiF.code_ua as f_code_ua, DiF.code_abg as f_code_abg,
        Frm.name as farm_name
      FROM animals A
      LEFT JOIN goats_data Di ON A.id = Di.id_goat
      LEFT JOIN animals M ON A.id_mother = M.id
      LEFT JOIN goats_data DiM ON M.id = DiM.id_goat
      LEFT JOIN animals F ON A.id_father = F.id
      LEFT JOIN goats_data DiF ON F.id = DiF.id_goat
      LEFT JOIN farms Frm ON A.id_farm = Frm.id
      WHERE Di.id_breed = $1 AND A.sex = $2 AND A.status = $3 ${ageClause}
    `;
    
    const params: any[] = [breed_id, sex, status];
    if (reg && STOODBOOK_MAP[reg]) {
        sql += ' AND Di.id_stoodbook = $4';
        params.push(STOODBOOK_MAP[reg]);
    }
    
    sql += ' ORDER BY A.time_added DESC';
    const result = await query(sql, params);
    return result.rows as Goat[];
}

export default async function GoatsListPage({ 
    params: paramsPromise,
    searchParams: searchParamsPromise
}: { 
    params: Promise<{ alias: string, sex: string }>,
    searchParams: Promise<{ reg?: string, age?: string, s?: string, view?: string }>
}) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const { alias, sex } = params;
  const { reg, age, view } = searchParams;
  const s = searchParams.s || sex; 

  const breed = await getBreedData(alias);
  if (!breed) return <div className="p-40 text-center text-5xl font-black text-primary uppercase">Breed not found</div>;

  const pics = await getBreedPictures(alias);
  const breedImg = `/img/${pics[s === 'male' ? 1 : 0] || 'noimage.gif'}`;
  
  const breadcrumbItems = [
    { label: 'Каталог', href: '/catalog/goats' },
    { label: breed.name, href: `/catalog/goats/${alias}` },
    { label: sex === 'male' ? 'Самцы' : sex === 'female' ? 'Самки' : 'Молодняк' }
  ];

  if (reg) {
      breadcrumbItems.push({ label: REGISTER_NAMES[reg] || reg });
  } else if (view) {
      breadcrumbItems.push({ label: view === 'rcb' ? 'RCB Поколения' : 'Экспериментальный реестр' });
  }

  const showAgeGrid = sex === 'child' && !age;
  const showRegisterGrid = (sex === 'male' || sex === 'female') && !reg && !view;
  const showGenerationGrid = view === 'rcb';
  const showExperimentalGrid = view === 'ex';
  const showTable = reg || age;

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-16 px-4 font-sans leading-tight text-gray-800">
      <div className="max-w-[1800px] mx-auto space-y-10">
        <Breadcrumbs items={breadcrumbItems} />

        {showRegisterGrid && (
          <section className="space-y-12">
            <header className="border-b border-primary/10 pb-8 text-center max-w-4xl mx-auto uppercase">
                <h2 className="text-4xl md:text-5xl font-black text-primary mb-4 tracking-tight">РЕЕСТРЫ ПОРОДЫ</h2>
                <p className="text-sm font-bold opacity-40">Выберите категорию генетического реестра для {breed.name}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { id: 'rhb', name: 'Главный Реестр', code: 'RHB', desc: 'Чистопородные животные с сертифицированной родословной.' },
                  { id: 'rcb', name: 'Поглощение', code: 'RCB', desc: 'Программы поглотительного скрещивания под контролем.', isFolder: true },
                  { id: 'rfb', name: 'Фенотип', code: 'RFB', desc: 'Отбор по строгим стандартам физических характеристик.' },
                  { id: 'ex', name: 'Эксперимент', code: 'RExB', desc: 'Специализированные линии и экспериментальные программы.', isFolder: true }
                ].map((item) => (
                  <Link 
                    key={item.id} 
                    href={item.isFolder ? `?view=${item.id}` : `?reg=${item.id}`}
                    className="bg-white p-8 flex flex-col items-center text-center group border border-primary/10 hover:border-secondary rounded-2xl transition-colors shadow-sm"
                  >
                    <div className="w-16 h-16 mb-4 rounded-lg overflow-hidden bg-primary/5 p-2 border border-primary/10">
                        <img src={breedImg} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <h3 className="text-xl font-black text-primary mb-1 tracking-tight uppercase">{item.name}</h3>
                    <span className="text-secondary font-black text-[10px] mb-4 uppercase tracking-widest">{item.code}</span>
                    <p className="text-xs text-primary/70 mb-8">{item.desc}</p>
                    <div className="mt-auto px-6 py-2 w-full bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                        ОТКРЫТЬ ➔
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        )}

        {showGenerationGrid && (
           <section className="space-y-12">
            <header className="border-b border-primary/10 pb-8 text-center max-w-4xl mx-auto uppercase">
                <h2 className="text-4xl md:text-5xl font-black text-primary mb-4 tracking-tight">RCB ПОКОЛЕНИЯ</h2>
                <p className="text-sm font-bold opacity-40 italic">Основной список для программ поглощения (F1-F7)</p>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <Link 
                    key={num} 
                    href={`?reg=f${num}`}
                    className="bg-white rounded-xl p-8 flex items-center justify-between hover:bg-primary/5 group transition-colors border border-primary/10 hover:border-primary/20 shadow-sm"
                  >
                    <h3 className="text-3xl font-black text-primary uppercase italic">F{num}</h3>
                    <span className="text-secondary font-black text-[10px] uppercase tracking-widest text-right">→ ОТКРЫТЬ <br/> СПИСОК</span>
                  </Link>
                ))}
                <Link 
                    href={`/catalog/goats/${alias}/${sex}`}
                    className="bg-primary/5 rounded-xl p-8 flex items-center justify-center text-primary/40 hover:text-primary transition-colors border border-dashed border-primary/20"
                >
                    <span className="text-[10px] font-black uppercase tracking-widest">← НАЗАД</span>
                </Link>
            </div>
           </section>
        )}

        {showExperimentalGrid && (
           <section className="space-y-12">
            <header className="border-b border-primary/10 pb-8 text-center max-w-4xl mx-auto uppercase">
                <h2 className="text-4xl md:text-5xl font-black text-primary mb-4 tracking-tight">КЛАССИФИКАЦИЯ RExB</h2>
                <p className="text-sm font-bold opacity-40 italic">Списки по стандартам экспериментального процента</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { id: 'ex1', name: 'RExB 1', s: 'ДО 50%' },
                    { id: 'ex2', name: 'RExB 2', s: 'ОТ 51% ДО 75%' },
                    { id: 'ex3', name: 'RExB 3', s: 'ОТ 76% ДО 98%' }
                ].map((item) => (
                  <Link 
                    key={item.id} 
                    href={`?reg=${item.id}`}
                    className="bg-white rounded-xl p-10 flex flex-col items-center group hover:border-secondary transition-colors border border-primary/10 shadow-sm"
                  >
                    <h3 className="text-3xl font-black text-primary mb-2 uppercase italic">{item.name}</h3>
                    <span className="text-primary/40 font-black text-sm uppercase tracking-widest">{item.s}</span>
                    <div className="mt-8 px-6 py-2 border border-primary/10 rounded-lg text-primary font-black text-[10px] uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-colors">
                        ОТКРЫТЬ
                    </div>
                  </Link>
                ))}
            </div>
           </section>
        )}

        {showTable && (
          <section className="space-y-6">
             <header className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-primary/5 pb-6 gap-6">
                <div>
                    <h2 className="text-3xl font-black text-primary uppercase leading-tight tracking-tighter mb-2 italic">
                        {breed.name} / {reg ? REGISTER_NAMES[reg] : `До ${age}М`}
                    </h2>
                    <div className="flex gap-2">
                        <span className="bg-primary text-secondary px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest">
                            {s === 'male' ? 'САМЦЫ / BUCKS' : 'САМКИ / DOES'}
                        </span>
                    </div>
                </div>
                <Link href={`/catalog/goats/${alias}/${sex}`} className="px-6 py-3 bg-white border border-primary/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary hover:bg-black hover:text-white transition-all shadow-sm">
                    ← НАЗАД К СПИСКУ
                </Link>
             </header>

             <div className="bg-white border rounded-sm overflow-hidden shadow-2xl relative">
                <div className="overflow-x-auto min-h-[500px]">
                    <Suspense fallback={<div className="p-20 text-center font-black uppercase opacity-20 text-xs">Accessing Genetic Registry...</div>}>
                         <GoatTableContainer breedId={breed.id} sex={s === 'male' ? 'male' : 'female'} reg={reg} age={age} />
                    </Suspense>
                </div>
             </div>
          </section>
        )}
      </div>
    </div>
  );
}

async function GoatTableContainer({ breedId, sex, reg, age }: { breedId: number, sex: string, reg?: string, age?: string }) {
    const goats = await getGoats(breedId, sex, reg, age);
    
    return (
        <table className="w-full text-left border-collapse table-fixed min-w-[4200px]">
            <thead className="sticky top-0 z-30 bg-[#E2F0D9] text-gray-700 shadow-sm border-b border-gray-300">
                <tr className="text-[10px] font-black uppercase tracking-tighter">
                    <th rowSpan={2} className="p-2 border-r border-gray-300 w-72 sticky left-0 bg-[#E2F0D9] z-40">Кличка / Имя</th>
                    <th rowSpan={2} className="p-2 border-r border-gray-300 w-32 text-center">Член ABG</th>
                    <th rowSpan={2} className="p-2 border-r border-gray-300 w-44">Ферма</th>
                    <th rowSpan={2} className="p-2 border-r border-gray-300 w-72">Заводчик</th>
                    <th rowSpan={2} className="p-2 border-r border-gray-300 w-72">Владелец</th>
                    <th rowSpan={2} className="p-2 border-r border-gray-300 w-36 text-center">Дата рожд</th>
                    <th rowSpan={2} className="p-2 border-r border-gray-300 w-28 text-center">Вес (г)</th>
                    <th rowSpan={2} className="p-2 border-r border-gray-300 w-28 text-center">Кол-во</th>
                    <th rowSpan={2} className="p-2 border-r border-gray-300 w-28 text-center">Рогат.</th>
                    <th rowSpan={2} className="p-2 border-r border-gray-300 w-28 text-center">Ген.пасп</th>
                    <th rowSpan={2} className="p-2 border-r border-gray-300 w-32 text-center">Ген.мат</th>
                    <th rowSpan={2} className="p-2 border-r border-gray-300 w-32 text-center">Код реестр</th>
                    <th rowSpan={2} className="p-2 border-r border-gray-300 w-56">ID UA</th>
                    <th rowSpan={2} className="p-2 border-r border-gray-300 w-56">ID ABG</th>
                    <th rowSpan={2} className="p-2 border-r border-gray-300 w-56">ID RK</th>
                    <th rowSpan={2} className="p-2 border-r border-gray-300 w-56">ID Chip</th>
                    <th rowSpan={2} className="p-2 border-r border-gray-300 w-56">International</th>
                    <th rowSpan={2} className="p-2 border-r border-gray-300 w-44 text-center">Клеймо</th>
                    
                    <th colSpan={7} className="p-2 border-r border-gray-300 text-center bg-[#C5E0B4]">Данные по матери</th>
                    <th colSpan={7} className="p-2 border-r border-gray-300 text-center bg-[#F8CBAD]">Данные по отцу</th>
                    <th rowSpan={2} className="p-2 text-center w-32 bg-[#4D2C1A] text-white">Статус</th>
                </tr>
                <tr className="text-[9px] font-bold uppercase tracking-tighter bg-gray-50 border-b border-gray-300">
                    <th className="p-2 border-r border-gray-300 w-48 bg-[#C5E0B4]/50">Кличка</th>
                    <th className="p-2 border-r border-gray-300 w-28 bg-[#C5E0B4]/50 text-center">Реестр</th>
                    <th className="p-2 border-r border-gray-300 w-48 bg-[#C5E0B4]/50">ID UA</th>
                    <th className="p-2 border-r border-gray-300 w-48 bg-[#C5E0B4]/50">ID ABG</th>
                    <th className="p-2 border-r border-gray-300 w-48 bg-[#C5E0B4]/50">ID Int</th>
                    <th className="p-2 border-r border-gray-300 w-48 bg-[#C5E0B4]/50 border-r-2 border-gray-400 text-center">Клеймо</th>
                    <th className="p-2 border-r border-gray-300 w-28 bg-[#C5E0B4]/50 text-center italic">Score</th>
                    
                    <th className="p-2 border-r border-gray-300 w-48 bg-[#F8CBAD]/50">Кличка</th>
                    <th className="p-2 border-r border-gray-300 w-28 bg-[#F8CBAD]/50 text-center">Реестр</th>
                    <th className="p-2 border-r border-gray-300 w-48 bg-[#F8CBAD]/50">ID UA</th>
                    <th className="p-2 border-r border-gray-300 w-48 bg-[#F8CBAD]/50">ID ABG</th>
                    <th className="p-2 border-r border-gray-300 w-48 bg-[#F8CBAD]/50">ID Int</th>
                    <th className="p-2 border-r border-gray-300 w-48 bg-[#F8CBAD]/50 text-center">Клеймо</th>
                    <th className="p-2 bg-[#F8CBAD]/50 text-center italic w-28">Score</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                <GoatsTableData goats={goats} />
            </tbody>
        </table>
    );
}

async function GoatsTableData({ goats }: { goats: Goat[] }) {
    if (goats.length === 0) {
        return (
            <tr>
                <td colSpan={32} className="p-20 text-center bg-white">
                    <span className="text-xl font-black uppercase tracking-[1em] text-gray-200">NO RECORDS FOUND</span>
                </td>
            </tr>
        );
    }

    return (
        <>
            {goats.map((goat, i) => (
                <tr key={i} className={`text-[11px] hover:bg-amber-50/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="p-2 border-r border-gray-200 font-black text-blue-900 uppercase sticky left-0 z-10 bg-inherit shadow-[1px_0_0_0_rgba(0,0,0,0.1)]">
                        <Link href={`/goats/${goat.reg_id}`} className="hover:underline">{goat.name}</Link>
                    </td>
                    <td className="p-2 border-r border-gray-200 text-center font-bold">{goat.is_abg ? 'ДА' : 'НЕТ'}</td>
                    <td className="p-2 border-r border-gray-200 uppercase font-black text-gray-400 truncate text-[10px]">{goat.farm_name || '-'}</td>
                    <td className="p-2 border-r border-gray-200 truncate uppercase text-[10px]">{goat.manuf}</td>
                    <td className="p-2 border-r border-gray-200 truncate uppercase font-bold text-[10px]">{goat.owner}</td>
                    <td className="p-2 border-r border-gray-200 text-center whitespace-nowrap">{goat.date_born ? new Date(goat.date_born).toLocaleDateString('ru-RU') : '-'}</td>
                    <td className="p-2 border-r border-gray-200 text-center font-mono">{goat.born_weight || '-'}</td>
                    <td className="p-2 border-r border-gray-200 text-center font-mono">{goat.born_qty || '-'}</td>
                    <td className="p-2 border-r border-gray-200 text-center uppercase">{goat.horns_type || '-'}</td>
                    <td className="p-2 border-r border-gray-200 text-center uppercase">{goat.have_gen || 'НЕТ'}</td>
                    <td className="p-2 border-r border-gray-200 text-center uppercase">{goat.gen_mat || 'НЕТ'}</td>
                    <td className="p-2 border-r border-gray-200 text-center font-mono font-bold text-red-800">{goat.id_stoodbook || '-'}</td>
                    <td className="p-2 border-r border-gray-200 font-mono text-gray-600 truncate">{goat.code_ua || '-'}</td>
                    <td className="p-2 border-r border-gray-200 font-mono text-gray-600 truncate">{goat.code_abg || '-'}</td>
                    <td className="p-2 border-r border-gray-200 font-mono text-gray-600">-</td>
                    <td className="p-2 border-r border-gray-200 font-mono text-gray-600 truncate">{goat.code_chip || '-'}</td>
                    <td className="p-2 border-r border-gray-200 font-mono text-gray-600 truncate">{goat.code_int || '-'}</td>
                    <td className="p-2 border-r border-gray-200 text-center uppercase truncate">{goat.code_brand || '-'}</td>
                    
                    {/* Mother Columns */}
                    <td className="p-2 border-r border-gray-200 bg-[#C5E0B4]/10 font-bold uppercase truncate">{goat.m_name || '-'}</td>
                    <td className="p-2 border-r border-gray-200 bg-[#C5E0B4]/10 text-center font-mono">{goat.m_reg_code || '-'}</td>
                    <td className="p-2 border-r border-gray-200 bg-[#C5E0B4]/10 font-mono text-[10px] truncate">{goat.m_code_ua || '-'}</td>
                    <td className="p-2 border-r border-gray-200 bg-[#C5E0B4]/10 font-mono text-[10px] truncate">{goat.m_code_abg || '-'}</td>
                    <td className="p-2 border-r border-gray-200 bg-[#C5E0B4]/10 font-mono text-[10px]">-</td>
                    <td className="p-2 border-r border-gray-200 bg-[#C5E0B4]/10 border-r-2 border-gray-400 text-center">-</td>
                    <td className="p-2 border-r border-gray-200 bg-[#C5E0B4]/10 text-center italic opacity-40">-</td>
                    
                    {/* Father Columns */}
                    <td className="p-2 border-r border-gray-200 bg-[#F8CBAD]/10 font-bold uppercase truncate">{goat.f_name || '-'}</td>
                    <td className="p-2 border-r border-gray-200 bg-[#F8CBAD]/10 text-center font-mono">{goat.f_reg_code || '-'}</td>
                    <td className="p-2 border-r border-gray-200 bg-[#F8CBAD]/10 font-mono text-[10px] truncate">{goat.f_code_ua || '-'}</td>
                    <td className="p-2 border-r border-gray-200 bg-[#F8CBAD]/10 font-mono text-[10px] truncate">{goat.f_code_abg || '-'}</td>
                    <td className="p-2 border-r border-gray-200 bg-[#F8CBAD]/10 font-mono text-[10px]">-</td>
                    <td className="p-2 border-r border-gray-200 bg-[#F8CBAD]/10 text-center">-</td>
                    <td className="p-2 bg-[#F8CBAD]/10 text-center italic opacity-40">-</td>
 
                    <td className={`p-2 text-center font-black uppercase tracking-widest text-[11px] ${goat.status === 1 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                        {goat.status === 1 ? 'ALIVE' : 'DEAD'}
                    </td>
                </tr>
            ))}
        </>
    );
}
