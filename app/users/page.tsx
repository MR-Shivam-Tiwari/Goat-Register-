import { getTranslation, Locale } from '@/lib/translations';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { adminOnly } from '@/lib/access-control';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';

async function getUsers() {
    const result = await query(`
        SELECT DISTINCT ON (U.id) 
            U.id, U.login, U.name, U.email, U.time_added, U.role, F.name as farm_name
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
        <div className="min-h-screen bg-[#FDFDFD] py-12 px-6 lg:px-24">
            <div className="max-w-[1700px] mx-auto space-y-8 font-sans">
                <Breadcrumbs items={[{ label: t.nav.users }]} t={t} locale={lang} />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-8">
                    <div>
                        <h1 className="text-4xl font-black text-[#491907] uppercase tracking-tighter leading-none">{t.users.management}</h1>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-2">{t.users.registry}</p>
                    </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-sm shadow-xl shadow-black/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[12px] whitespace-nowrap border-collapse">
                            <thead>
                                <tr className="bg-[#491907] text-white uppercase tracking-widest text-[10px]">
                                    <th className="px-6 py-4 font-black">{t.users.login}</th>
                                    <th className="px-6 py-4 font-black">{t.users.fullName}</th>
                                    <th className="px-6 py-4 font-black">{t.users.email}</th>
                                    <th className="px-6 py-4 font-black">{t.auth.roleLabel || 'ROLE'}</th>
                                    <th className="px-6 py-4 font-black text-center">{t.breedManage.actions || 'ACTIONS'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user: any, idx: number) => (
                                    <tr key={`user-${user.id}`} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-green-50/50 transition-colors`}>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-[#491907] font-black uppercase text-[13px]">{user.login}</span>
                                                <span className="text-[9px] text-gray-400 font-mono tracking-tighter">ID: {user.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-900 font-bold uppercase">
                                            {user.name || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-medium">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest ${user.role >= 10 ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                                                {user.role >= 10 ? (t.auth.adminRole || 'ADMIN') : (t.auth.memberRole || 'MEMBER')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link 
                                                    href={`/users/${user.id}/edit`}
                                                    className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-[#491907] hover:border-[#491907] rounded-sm transition-all shadow-sm"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button 
                                                    className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-600 rounded-sm transition-all shadow-sm"
                                                    title="Delete User"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
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
