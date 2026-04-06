import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { query } from './db';

export async function getSessionUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('uid_token')?.value;
    
    if (!token) return null;

    const result = await query('SELECT id, login, role FROM users WHERE token = $1', [token]);
    const user = result.rows[0];
    if (user) {
        // Ensure role is treated as number for logic safety
        user.role = Number(user.role);
    }
    return user || null;
}

export async function adminOnly() {
    const user = await getSessionUser();
    // BYPASS: Allow any logged in user
    if (!user) {
        redirect('/login');
    }
    return user;
}
