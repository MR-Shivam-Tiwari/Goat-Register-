import Breadcrumbs from '@/components/Breadcrumbs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AddFarmPage() {
    const cookieStore = await cookies();
    const username = cookieStore.get('user_login')?.value;
    if (!username) redirect('/login');

    const breadcrumbItems = [
        { label: 'ФЕРМЫ', href: '/farms' },
        { label: 'ДОБАВИТЬ НОВОЕ ХОЗЯЙСТВО' }
    ];

    return (
        <div className="min-h-screen bg-bg-site py-20 px-6 lg:px-24">
            <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                <Breadcrumbs items={breadcrumbItems} />

                <header className="text-center mb-16">
                    <div className="inline-block px-8 py-2 rounded-full bg-secondary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-8">РЕГИСТРАЦИЯ ХОЗЯЙСТВА</div>
                    <h1 className="text-6xl font-black text-primary tracking-tighter uppercase italic drop-shadow-2xl">НОВОЕ ХОЗЯЙСТВО</h1>
                    <div className="h-2 w-32 bg-secondary mx-auto rounded-full mt-6 mb-8"></div>
                    <p className="max-w-2xl mx-auto text-xl font-bold text-primary/40 uppercase tracking-widest italic tracking-tighter uppercase mb-20 px-12 leading-relaxed">
                        Заполните анкету для внесения вашего хозяйства в официальный реестр Ассоциации Племенных Коз
                    </p>
                </header>

                <div className="bg-white p-12 lg:p-24 rounded-xl shadow-4xl border border-primary/5 space-y-20">
                    <form className="space-y-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em] mb-3 block italic">ОФИЦИАЛЬНОЕ НАЗВАНИЕ</label>
                                <input 
                                    type="text" 
                                    placeholder="Например: Племрепродуктор 'Золотая Коза'..."
                                    className="w-full bg-bg-site/50 border-2 border-primary/5 px-10 py-6 rounded-xl font-black text-primary focus:border-secondary transition-all outline-none text-xl uppercase tracking-tight"
                                />
                            </div>

                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em] mb-3 block italic">ОСНОВНАЯ ФОТОГРАФИЯ (URL)</label>
                                <input 
                                    type="text" 
                                    placeholder="farm_icon.jpg..."
                                    className="w-full bg-bg-site/50 border-2 border-primary/5 px-10 py-6 rounded-xl font-black text-primary focus:border-secondary transition-all outline-none text-xl uppercase tracking-tight"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em] mb-3 block italic">ОПИСАНИЕ И ШАБЛОН (HTML)</label>
                            <textarea 
                                placeholder="<p>Информация о хозяйстве...</p>"
                                rows={10}
                                className="w-full bg-bg-site/50 border-2 border-primary/5 px-10 py-8 rounded-xl font-mono text-primary focus:border-secondary transition-all outline-none text-sm resize-none"
                            />
                        </div>

                        <div className="pt-16 border-t border-primary/5">
                            <button 
                                type="submit" 
                                className="w-full py-10 bg-primary text-secondary font-black text-2xl uppercase tracking-[0.5em] rounded-xl shadow-4xl hover:bg-black transition-all transform hover:-translate-y-2 active:scale-95 duration-500 italic box-shadow-elite"
                            >
                                ЗАРЕГИСТРИРОВАТЬ ХОЗЯЙСТВО
                            </button>
                            <p className="text-center mt-10 text-[9px] font-bold text-primary/30 uppercase tracking-[0.3em] px-24 leading-relaxed italic">
                                Новая запись появится в каталоге после прохождения верификации модератором реестра
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
