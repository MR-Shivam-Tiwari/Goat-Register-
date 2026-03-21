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
  reg_code: number;
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
  const result = await query('SELECT id, name FROM breeds WHERE TRIM(alias) ILIKE TRIM($1)', [alias]);
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
        A.name, A.sex, Di.is_abg, Di.manuf, Di.owner, Di.date_born, A.id as reg_code
      FROM animals A
      LEFT JOIN goats_data Di ON A.id = Di.id_goat
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
    <div className="min-h-screen bg-[#FDFDFD] py-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto space-y-16">
        <Breadcrumbs items={breadcrumbItems} />

        {showRegisterGrid && (
          <section className="space-y-12">
            <header className="border-b border-primary/10 pb-8 text-center max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-black text-primary mb-4 tracking-tight uppercase">РЕЕСТРЫ ПОРОДЫ</h2>
                <p className="text-xl text-primary/70 font-medium">Выберите категорию генетического реестра для {breed.name}</p>
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
                    className="bg-white p-8 flex flex-col items-center text-center group border-2 border-primary/10 hover:border-secondary rounded-2xl transition-colors"
                  >
                    <div className="w-24 h-24 mb-6 rounded-xl overflow-hidden bg-primary/5 p-4 border border-primary/10">
                        <img src={breedImg} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <h3 className="text-2xl font-black text-primary mb-2 tracking-tight uppercase">{item.name}</h3>
                    <span className="text-secondary font-black text-sm mb-4 uppercase tracking-widest">{item.code}</span>
                    <p className="text-base text-primary/70 mb-8">{item.desc}</p>
                    <div className="mt-auto px-6 py-3 w-full bg-primary/5 text-primary font-black text-xs uppercase tracking-widest rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                        ОТКРЫТЬ ➔
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        )}

        {showGenerationGrid && (
           <section className="space-y-12">
            <header className="border-b border-primary/10 pb-8 text-center max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-black text-primary mb-4 tracking-tight uppercase">RCB ПОКОЛЕНИЯ</h2>
                <p className="text-xl text-primary/70 font-medium">Основной список для программ поглощения (F1-F7)</p>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <Link 
                    key={num} 
                    href={`?reg=f${num}`}
                    className="bg-white rounded-2xl p-8 flex items-center justify-between hover:bg-primary/5 group transition-colors border-2 border-primary/10 hover:border-primary/20"
                  >
                    <h3 className="text-3xl font-black text-primary uppercase">F{num}</h3>
                    <span className="text-secondary font-black text-xs uppercase tracking-widest">→ ОТКРЫТЬ</span>
                  </Link>
                ))}
                <Link 
                    href={`/catalog/goats/${alias}/${sex}`}
                    className="bg-primary/5 rounded-2xl p-8 flex items-center justify-center text-primary/60 hover:text-primary transition-colors border-2 border-dashed border-primary/20"
                >
                    <span className="text-sm font-black uppercase tracking-widest">← НАЗАД</span>
                </Link>
            </div>
           </section>
        )}

        {showExperimentalGrid && (
           <section className="space-y-12">
            <header className="border-b border-primary/10 pb-8 text-center max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-black text-primary mb-4 tracking-tight uppercase">КЛАССИФИКАЦИЯ RExB</h2>
                <p className="text-xl text-primary/70 font-medium">Списки по стандартам экспериментального процента</p>
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
                    className="bg-white rounded-2xl p-10 flex flex-col items-center group hover:border-secondary transition-colors border-2 border-primary/10"
                  >
                    <h3 className="text-4xl font-black text-primary mb-4 uppercase">{item.name}</h3>
                    <span className="text-primary/60 font-black text-lg uppercase tracking-widest">{item.s}</span>
                    <div className="mt-8 px-6 py-2 border-2 border-primary/10 rounded-lg text-primary font-black text-xs uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-colors">
                        ОТКРЫТЬ
                    </div>
                  </Link>
                ))}
            </div>
           </section>
        )}

        {showAgeGrid && (
           <section className="space-y-12">
             <header className="border-b border-primary/10 pb-8 text-center max-w-4xl mx-auto">
                 <h2 className="text-4xl md:text-5xl font-black text-primary mb-4 tracking-tight uppercase">МОЛОДНЯК</h2>
                 <p className="text-xl text-primary/70 font-medium">Реестр козлят, отфильтрованный по возрасту</p>
             </header>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                {['female', 'male'].map((sx) => (
                  <div key={sx} className="bg-white rounded-2xl p-10 border-2 border-primary/10">
                    <h3 className="text-3xl font-black mb-10 uppercase text-primary border-b-2 border-primary/5 pb-6 text-center">
                        {sx === 'male' ? 'Козлики (Самцы)' : 'Козочки (Самки)'}
                    </h3>
                    <div className="flex flex-col gap-4">
                        {[3, 6, 12].map(m => (
                          <Link 
                            key={m} 
                            href={`?age=${m}&s=${sx}`}
                            className="w-full py-6 px-8 rounded-xl bg-primary/5 border border-primary/10 text-primary font-black text-xl hover:bg-primary hover:text-white transition-colors uppercase flex justify-between items-center"
                          >
                            <span>До {m} месяцев</span>
                            <span className="text-sm font-bold opacity-60">➔</span>
                          </Link>
                        ))}
                    </div>
                  </div>
                ))}
             </div>
           </section>
        )}

        {showTable && (
          <section className="space-y-10">
             <header className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-primary/10 pb-8 gap-6">
                <div>
                    <h2 className="text-4xl font-black text-primary uppercase leading-tight tracking-tight mb-4">{breed.name} <br/><span className="text-3xl opacity-80">ОСНОВНОЙ РЕЕСТР</span></h2>
                    <p className="inline-block bg-secondary text-primary px-4 py-2 rounded-lg text-sm font-black uppercase tracking-widest">
                        {reg ? REGISTER_NAMES[reg] : `Категория: ${s === 'male' ? 'Самцы' : 'Самки'} (До ${age}М)`}
                    </p>
                </div>
                <Link href={`/catalog/goats/${alias}/${sex}`} className="px-8 py-4 bg-primary/5 border-2 border-primary/10 rounded-xl text-sm font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-colors whitespace-nowrap">
                    ← НАЗАД К СПИСКУ
                </Link>
             </header>

             <div className="bg-white rounded-2xl border-2 border-primary/10 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-primary/5 border-b-2 border-primary/10">
                                <th className="p-6 text-sm font-black uppercase text-primary">КЛИЧКА / ИМЯ</th>
                                <th className="p-6 text-sm font-black uppercase text-primary">РЕГ. КОД</th>
                                <th className="p-6 text-sm font-black uppercase text-primary">ПОЛ</th>
                                <th className="p-6 text-sm font-black uppercase text-primary">СТАТУС</th>
                                <th className="p-6 text-sm font-black uppercase text-primary">ЗАВОДЧИК</th>
                                <th className="p-6 text-sm font-black uppercase text-primary">ВЛАДЕЛЕЦ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            <Suspense fallback={<tr><td colSpan={6} className="p-16 text-center text-xl font-bold text-primary/50">Загрузка данных...</td></tr>}>
                                <GoatsTableData breedId={breed.id} sex={s === 'male' ? 'male' : 'female'} reg={reg} age={age} />
                            </Suspense>
                        </tbody>
                    </table>
                </div>
             </div>
          </section>
        )}
      </div>
    </div>
  );
}

async function GoatsTableData({ breedId, sex, reg, age }: { breedId: number, sex: string, reg?: string, age?: string }) {
    const goats = await getGoats(breedId, sex, reg, age);
    
    if (goats.length === 0) {
        return (
            <tr>
                <td colSpan={6} className="p-16 text-center">
                    <span className="text-2xl font-black uppercase tracking-widest text-primary/30">СПИСОК ПУСТ</span>
                </td>
            </tr>
        );
    }

    return (
        <>
            {goats.map((goat, i) => (
                <tr key={i} className="hover:bg-primary/5 transition-colors">
                    <td className="p-6">
                        <span className="text-lg font-black text-primary uppercase">{goat.name}</span>
                    </td>
                    <td className="p-6">
                        <span className="font-mono text-sm font-bold bg-white border border-primary/20 px-3 py-1 rounded inline-block">
                            Ref: {goat.reg_code}
                        </span>
                    </td>
                    <td className="p-6">
                        <span className="text-sm font-bold text-primary/60 uppercase">{goat.sex === 1 ? 'САМЕЦ' : 'САМКА'}</span>
                    </td>
                    <td className="p-6">
                        {goat.is_abg ? (
                            <span className="inline-block text-green-700 font-bold text-xs uppercase bg-green-100 border border-green-200 px-3 py-1 rounded">
                                СЕРТИФИЦИРОВАН
                            </span>
                        ) : (
                            <span className="inline-block text-primary/50 font-bold text-xs uppercase border border-primary/10 px-3 py-1 rounded">
                                ПУБЛИЧНЫЙ
                            </span>
                        )}
                    </td>
                    <td className="p-6">
                        <span className="block text-sm font-black text-primary uppercase">{goat.manuf}</span>
                        <span className="block text-xs text-primary/50 mt-1">Заводчик</span>
                    </td>
                    <td className="p-6">
                         <span className="block text-sm font-black text-primary uppercase">{goat.owner}</span>
                         <span className="block text-xs text-primary/50 mt-1">Владелец</span>
                    </td>
                </tr>
            ))}
        </>
    );
}
