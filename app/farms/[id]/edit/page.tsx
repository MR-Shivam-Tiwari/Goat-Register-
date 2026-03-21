import { query } from '@/lib/db';
import Breadcrumbs from '@/components/Breadcrumbs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import FarmEditor from '@/components/FarmEditor';
import { getTranslation, Locale } from '@/lib/translations';

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
    const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
    const t = getTranslation(lang);

    if (!username) redirect('/login');

    const farm = await getFarm(id);
    if (!farm) return <div className="p-40 text-center font-black text-primary opacity-20 uppercase tracking-[1em]">Farm not found</div>;

    const breadcrumbItems = [
        { label: t.nav.farms, href: '/farms' },
        { label: farm.name, href: `/farms/${id}` },
        { label: t.common.edit }
    ];

    return (
        <div className="min-h-screen bg-[#FFFDF9] py-16 px-6 lg:px-24 font-sans">
            <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
                <Breadcrumbs items={breadcrumbItems} />

                <header className="border-l-4 border-[#491907] pl-8 py-2">
                    <h1 className="text-3xl font-black text-[#491907] tracking-tight uppercase italic">{t.common.edit} {farm.name}</h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">
                        Registry Farm Editor • Active Session: {username}
                    </p>
                </header>

                <div className="bg-white p-8 lg:p-12 rounded-xl shadow-sm border border-amber-900/5 transition-all">
                    {/* Note: FarmEditor now contains its own <form>. We do NOT wrap it in a form here. */}
                    <FarmEditor 
                        lang={lang} 
                        initialData={{ name: farm.name, description: farm.tmpl }} 
                        isEdit={true}
                        showContainer={false}
                    />
                </div>

                <div className="text-center pt-12 pb-12">
                    <p className="text-[10px] text-[#491907]/30 font-black uppercase tracking-[0.5em] italic">
                        {t.home.footerConsent}
                    </p>
                </div>
            </div>
        </div>
    );
}
