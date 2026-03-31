import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslation, Locale } from '@/lib/translations';
import ManagerTabs from '@/components/ManagerTabs';

async function getData() {
    const farmsRes = await query('SELECT id, name FROM farms ORDER BY id DESC');
    const goatsRes = await query(`
        SELECT A.id, A.name as nickname, B.name as breed_name, F.name as farm_name
        FROM animals A
        LEFT JOIN goats_data Di ON A.id = Di.id_goat
        LEFT JOIN breeds B ON Di.id_breed = B.id
        LEFT JOIN farms F ON A.id_farm = F.id
        ORDER BY A.id DESC
    `);
    return {
        farms: farmsRes.rows,
        goats: goatsRes.rows
    };
}

export default async function ManagePage() {
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get('uid_token')?.value;
    const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
    const t = getTranslation(lang);

    if (!isAdmin) redirect('/login');

    const { farms, goats } = await getData();

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-12 lg:px-24">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex justify-between items-end border-b-2 border-amber-900/10 pb-6">
                    <div>
                        <h1 className="text-4xl font-black text-primary tracking-tighter uppercase italic">Registry Manager</h1>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Administrative Control Center</p>
                    </div>
                </header>

                <ManagerTabs 
                    initialFarms={farms} 
                    initialGoats={goats} 
                    lang={lang} 
                />
            </div>
        </div>
    );
}
