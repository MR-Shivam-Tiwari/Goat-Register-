import { query } from '@/lib/db';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';

async function getAllGoats() {
    const result = await query(`
        SELECT A.id, A.name, A.sex, B.name as breed_name, F.name as farm_name, Di.is_abg, A.time_added
        FROM animals A
        JOIN goats_data Di ON A.id = Di.id_goat
        JOIN breeds B ON Di.id_breed = B.id
        LEFT JOIN farms F ON A.id_farm = F.id
        ORDER BY A.time_added DESC
        LIMIT 100
    `);
    return result.rows;
}

export default async function GoatsListPage() {
    const goats = await getAllGoats();
    
    return (
        <div className="min-h-screen bg-bg-site py-20 px-6 lg:px-24">
            <div className="max-w-7xl mx-auto space-y-16 animate-in slide-in-from-right-10 duration-1000">
                <Breadcrumbs items={[{ label: 'КАТАЛОГ', href: '/catalog/goats' }, { label: 'ПОЛНЫЙ СПИСОК' }]} />

                <header className="flex flex-col md:flex-row items-center justify-between border-b-4 border-secondary/20 pb-16 gap-12">
                    <div className="text-center md:text-left">
                        <h1 className="text-6xl font-black text-primary uppercase tracking-tighter italic">ОБЩИЙ РЕЕСТР</h1>
                        <p className="mt-4 text-xl font-black text-primary/40 uppercase tracking-[0.4em] italic leading-tight">База данных племенного козоводства</p>
                    </div>
                    <Link href="/catalog/goats/add" className="px-12 py-5 bg-primary text-secondary font-black rounded-xl text-[11px] uppercase tracking-[0.4em] hover:bg-secondary hover:text-primary transition-all shadow-4xl active:scale-95 duration-500">
                        ОФОРМИТЬ РЕГИСТРАЦИЮ +
                    </Link>
                </header>

                <div className="overflow-hidden rounded-xl border border-primary/5 shadow-5xl bg-white">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-primary/5">
                                <th className="p-10 text-left text-[11px] font-black uppercase text-primary/40 tracking-[0.5em]">ЖИВОТНОЕ</th>
                                <th className="p-10 text-left text-[11px] font-black uppercase text-primary/40 tracking-[0.5em]">ПОРОДА</th>
                                <th className="p-10 text-left text-[11px] font-black uppercase text-primary/40 tracking-[0.5em]">ПОЛ</th>
                                <th className="p-10 text-left text-[11px] font-black uppercase text-primary/40 tracking-[0.5em]">ХОЗЯЙСТВО</th>
                                <th className="p-10 text-left text-[11px] font-black uppercase text-primary/40 tracking-[0.5em]">СТАТУС</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {goats.map((goat: any) => (
                                <tr key={goat.id} className="hover:bg-primary/5 transition-all group">
                                    <td className="p-10">
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-black text-primary group-hover:text-secondary uppercase tracking-tighter leading-none">{goat.name}</span>
                                            <span className="text-[10px] font-bold text-primary/30 uppercase mt-2 tracking-widest italic leading-none">ID: {goat.id}</span>
                                        </div>
                                    </td>
                                    <td className="p-10">
                                        <span className="text-sm font-black text-primary uppercase tracking-widest">{goat.breed_name}</span>
                                    </td>
                                    <td className="p-10">
                                        <span className="text-xs font-black text-secondary uppercase tracking-widest opacity-60 italic">{goat.sex === 1 ? 'САМЕЦ' : 'САМКА'}</span>
                                    </td>
                                    <td className="p-10">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-primary uppercase tracking-widest leading-none">{goat.farm_name || 'Не указано'}</span>
                                            <span className="text-[9px] font-bold text-primary/20 uppercase tracking-[0.2em] mt-1 italic">Верифицирован</span>
                                        </div>
                                    </td>
                                    <td className="p-10">
                                        <div className="flex flex-col">
                                            {goat.is_abg === 1 ? (
                                                <span className="bg-green-50 text-green-600 px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-100 flex items-center gap-2 w-fit">
                                                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                                                    АКТИВЕН
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-black text-primary/20 uppercase tracking-widest">ПУБЛИЧНЫЙ</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
