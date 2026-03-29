import { getTranslation, Locale } from '@/lib/translations';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import { adminOnly } from '@/lib/access-control';
import Breadcrumbs from '@/components/Breadcrumbs';

async function getUser(id: string) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
}

export default async function UserEditPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    // Security Gate
    await adminOnly();

    const params = await paramsPromise;
    const { id } = params;
    const user = await getUser(id);

    const cookieStore = await cookies();
    const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
    const t = getTranslation(lang);

    if (!user) return <div className="p-20 text-center font-bold text-gray-500 text-xl">{t.common.error}</div>;

    async function updateUser(formData: FormData) {
        'use server';
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        await query(
            'UPDATE users SET name = $1, email = $2 WHERE id = $3',
            [name, email, id]
        );
        redirect('/users');
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20 pt-10 px-6">
            <div className="max-w-2xl mx-auto space-y-8">
                
                <Breadcrumbs items={[{ label: t.users.management, href: '/users' }, { label: `${t.users.editTitle}: ${user.login}` }]} />

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {t.users.editTitle}
                    </h2>
                    <p className="text-sm text-gray-500 mb-8 border-b border-gray-200 pb-6">
                        {t.users.registry}: <span className="font-semibold text-gray-800">{user.login}</span>
                    </p>

                    <form action={updateUser} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700">{t.users.memberApk}</label>
                                <select className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option>{t.users.no}</option>
                                    <option>{t.users.yes}</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700">{t.users.active}</label>
                                <select className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option>{t.users.yes}</option>
                                    <option>{t.users.no}</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-700">{t.users.email}</label>
                            <input 
                                name="email"
                                type="email" 
                                defaultValue={user.email}
                                className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-700">{t.users.fullName}</label>
                            <input 
                                name="name"
                                type="text" 
                                defaultValue={user.name || ''}
                                className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-700">{t.users.phone}</label>
                            <input 
                                name="phone"
                                type="text" 
                                placeholder="+380 (___) ___-____"
                                className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex flex-col gap-2 pb-6 border-b border-gray-200">
                            <label className="text-sm font-semibold text-gray-700">{t.users.password}</label>
                            <input 
                                name="password"
                                type="password" 
                                placeholder={t.users.passwordHelp}
                                className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="pt-2">
                            <button 
                                type="submit" 
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm transition-colors text-base"
                            >
                                {t.common.save}
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
}
