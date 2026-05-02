import { getTranslation, Locale } from '@/lib/translations';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { adminOnly } from '@/lib/access-control';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';

async function getUsers() {
    const result = await query(`
        SELECT DISTINCT ON (U.id) 
            U.id, U.login, U.name, U.email, U.time_added, F.name as farm_name
        FROM users U
        LEFT JOIN (
            SELECT DISTINCT ON (id_user) id_user, id_farm 
            FROM animals 
            ORDER BY id_user, id DESC
        ) A ON U.id = A.id_user
        LEFT JOIN farms F ON A.id_farm = F.id
        ORDER BY U.id, U.time_added DESC
    `);
    
    return result.rows.sort((a, b) => 
        new Date(b.time_added).getTime() - new Date(a.time_added).getTime()
    );
}

export default async function UsersPage() {
    // Security Gate: Only admins can see this page
    await adminOnly();
    
    const users = await getUsers();
    const cookieStore = await cookies();
    const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
    const t = getTranslation(lang);
    
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6">
            <div className="max-w-[1400px] mx-auto space-y-8 font-sans">
                <Breadcrumbs items={[{ label: t.nav.users }]} t={t} locale={lang} />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{t.users.listTitle}</h1>
                        <p className="text-base text-gray-500 mt-1">{t.users.registry}</p>
                    </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-100/80 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700">{t.users.login}</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">{t.users.fullName}</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">{t.users.email}</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">{t.users.phone}</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">{t.users.memberApk}</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">{t.users.active}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map((user: any) => (
                                    <tr key={`user-${user.id}`} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link href={`/users/${user.id}/edit`} className="text-[#491907] font-medium hover:text-[#6D260D] hover:underline">
                                                {user.login}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">
                                            {user.name || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            —
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.id % 2 === 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {user.id % 2 === 0 ? t.users.yes : t.users.no}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {t.users.yes}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="text-center pt-8 border-t border-gray-100">
                    <p className="text-sm text-gray-400 font-medium">{t.users.copyright}</p>
                </div>
                
            </div>
        </div>
    );
}
