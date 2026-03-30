import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { query } from './db';

export async function getSessionUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('uid_token')?.value;
    
    if (!token) return null;

    const result = await query('SELECT id, login, role FROM users WHERE token = $1', [token]);
    return result.rows[0] || null;
}

export async function adminOnly() {
    const user = await getSessionUser();
    
    if (!user || user.role !== 10) {
        redirect('/unauthorized');
    }
    
    return user;
}
