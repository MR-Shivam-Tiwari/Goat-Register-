import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { getGoatData } from '@/lib/goats-data';
import GoatForm from '@/components/GoatForm';
import { Locale } from '@/lib/translations';

async function getBreeds() {
    const result = await query('SELECT id, name FROM breeds ORDER BY name ASC');
    return result.rows;
}

async function getFarms() {
    const result = await query('SELECT id, name FROM farms ORDER BY name ASC');
    return result.rows;
}

export default async function FixGoatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const cookieStore = await cookies();
    const username = cookieStore.get('user_login')?.value;
    const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
    
    if (!username) redirect('/login');

    const goat = await getGoatData(id);
    if (!goat) notFound();

    const breeds = await getBreeds();
    const farms = await getFarms();

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6 md:px-12 lg:px-24 font-sans tracking-tight">
            <div className="max-w-5xl mx-auto space-y-12">
                <GoatForm breeds={breeds} farms={farms} lang={lang} initialData={goat} />
            </div>
        </div>
    );
}
