import { getTranslation, Locale } from '@/lib/translations';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import { adminOnly } from '@/lib/access-control';
import Breadcrumbs from '@/components/Breadcrumbs';
import UserEditForm from '@/components/UserEditForm';

export const dynamic = "force-dynamic";

async function getUser(id: string) {
    const result = await query('SELECT id, login, name, email, phone, role, is_apk FROM users WHERE id = $1', [id]);
    return result.rows[0];
}

export default async function UserEditPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    // Security Gate: Strictly Admin Only
    await adminOnly();

    const params = await paramsPromise;
    const { id } = params;
    const user = await getUser(id);

    if (!user) {
        notFound();
    }

    const cookieStore = await cookies();
    const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
    const t = getTranslation(lang);

    return (
        <div className="min-h-screen py-12 px-6 md:px-12 lg:px-24 font-sans tracking-tight bg-[#FDFDFD]">
            <div className="max-w-[1700px] mx-auto space-y-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4 w-full">
                        <Breadcrumbs 
                            items={[
                                { label: t.users.management, href: '/users' }, 
                                { label: `${t.users.editTitle}: ${user.login}` }
                            ]} 
                            t={t} 
                            locale={lang} 
                        />
                        <h1 className="text-4xl font-black text-[#491907] uppercase tracking-tighter leading-none">
                            {t.users.editTitle}
                        </h1>
                        <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">
                            {t.users.registry}: <span className="text-[#491907]">{user.login}</span>
                        </p>
                    </div>
                </div>

                <div className="bg-white p-1 rounded-sm shadow-xl border border-black/10">
                    <div className="bg-white p-6 md:p-10 rounded-sm">
                        <UserEditForm user={user} t={t} />
                    </div>
                </div>
            </div>
        </div>
    );
}
