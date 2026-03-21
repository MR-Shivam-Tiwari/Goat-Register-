import { query } from '@/lib/db';
import Breadcrumbs from '@/components/Breadcrumbs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import FarmEditor from '@/components/FarmEditor';

async function getFarm(id: string) {
    const result = await query('SELECT * FROM farms WHERE id = $1', [id]);
    const farm = result.rows[0];
    if (!farm) return null;

    // Resolve Image Path
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
}

export default async function EditFarmPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = await paramsPromise;
    const { id } = params;
    
    const cookieStore = await cookies();
    const username = cookieStore.get('user_login')?.value;
    if (!username) redirect('/login');

    const farm = await getFarm(id);
    if (!farm) return <div className="p-40 text-center font-black text-primary opacity-20 uppercase tracking-[1em]">Farm not found</div>;

    const breadcrumbItems = [
        { label: 'ФЕРМЫ', href: '/farms' },
        { label: farm.name, href: `/farms/${id}` },
        { label: 'РЕДАКТИРОВАТЬ' }
    ];

    return (
        <div className="min-h-screen bg-bg-site py-20 px-6 lg:px-24">
            <div className="max-w-5xl mx-auto space-y-16 animate-in slide-in-from-bottom-5 duration-1000">
                <Breadcrumbs items={breadcrumbItems} />

                <header className="text-center mb-16">
                    <h1 className="text-6xl font-black text-primary tracking-tighter uppercase italic drop-shadow-2xl">РЕДАКТОР ХОЗЯЙСТВА</h1>
                    <div className="h-2 w-32 bg-secondary mx-auto rounded-full mt-6 mb-8"></div>
                    <p className="max-w-2xl mx-auto text-xl font-bold text-primary/40 uppercase tracking-widest italic tracking-tighter uppercase mb-20 px-12 leading-relaxed">
                        Обновите информацию о вашем хозяйстве , загрузите новые фотографии и отредактируйте описание для каталога АПК
                    </p>
                </header>

                <div className="bg-white p-12 lg:p-24 rounded-xl shadow-4xl border border-primary/5 space-y-20">
                    <form className="space-y-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em] mb-3 block italic">НАЗВАНИЕ ХОЗЯЙСТВА</label>
                                <input 
                                    type="text" 
                                    defaultValue={farm.name}
                                    placeholder="Введите название..."
                                    className="w-full bg-bg-site/50 border-2 border-primary/5 px-10 py-6 rounded-xl font-black text-primary focus:border-secondary transition-all outline-none text-xl uppercase tracking-tight"
                                />
                            </div>

                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em] mb-3 block italic">ОСНОВНАЯ ФОТОГРАФИЯ</label>
                                <div className="flex items-center gap-6">
                                    <div className="w-40 h-40 bg-primary/5 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-primary/5 shadow-inner">
                                        <img src={farm.displayPic} alt="Main" className="w-full h-full object-cover" />
                                    </div>
                                    <button type="button" className="px-10 py-4 bg-primary text-secondary font-black rounded-xl text-[10px] uppercase tracking-[0.4em] hover:bg-secondary hover:text-primary transition-all shadow-xl active:scale-95 duration-300">ЗАМЕНИТЬ ФОТО</button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em] mb-3 block italic">ОПИСАНИЕ И ШАБЛОН (RICH TEXT)</label>
                            <FarmEditor defaultValue={farm.tmpl} />
                        </div>

                        <div className="pt-16 border-t border-primary/10">
                            <button 
                                type="submit" 
                                className="w-full py-10 bg-primary text-secondary font-black text-2xl uppercase tracking-[0.5em] rounded-xl shadow-4xl hover:bg-black transition-all transform hover:-translate-y-2 active:scale-95 duration-500 italic box-shadow-elite"
                            >
                                СОХРАНИТЬ ИЗМЕНЕНИЯ
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
