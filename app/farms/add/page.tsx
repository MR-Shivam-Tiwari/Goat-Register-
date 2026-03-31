import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import FarmEditor from '@/components/FarmEditor';
import { Locale } from '@/lib/translations';

export default async function AddFarmPage() {
    const cookieStore = await cookies();
    const username = cookieStore.get('user_login')?.value;
    const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
    
    if (!username) redirect('/login');

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <FarmEditor lang={lang} />
        </div>
    );
}
