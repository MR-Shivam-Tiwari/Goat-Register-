import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import FarmEditor from '@/components/FarmEditor';
import { Locale } from '@/lib/translations';

async function getFarm(id: string) {
    const result = await query('SELECT id, name, tmpl, pic1, pic2 FROM farms WHERE id = $1', [id]);
    const farm = result.rows[0];
    return farm || null;
}

export default async function EditFarmPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = await paramsPromise;
    const { id } = params;
    
    const cookieStore = await cookies();
    const username = cookieStore.get('user_login')?.value;
    const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';

    if (!username) redirect('/login');

    const farm = await getFarm(id);
    if (!farm) redirect('/farms');

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <FarmEditor 
                lang={lang} 
                initialData={{ 
                    id: farm.id, 
                    name: farm.name, 
                    tmpl: farm.tmpl, 
                    pic1: farm.pic1, 
                    pic2: farm.pic2 
                }} 
                isEdit={true}
            />
        </div>
    );
}
