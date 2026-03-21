import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import Breadcrumbs from '@/components/Breadcrumbs';

async function getUserData(username: string) {
    const result = await query(`
        SELECT id, login, name as full_name, email
        FROM users 
        WHERE login = $1
    `, [username]);
    
    if (result.rows.length === 0) return null;
    return result.rows[0];
}

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const username = cookieStore.get('user_login')?.value;
  
  if (!username) {
    redirect('/login');
  }

  const user = await getUserData(username);
  if (!user) redirect('/login');

  async function changePassword(formData: FormData) {
      'use server';
      // Simulate password change
      redirect('/profile?updated=success');
  }

  return (
    <div className="min-h-screen bg-bg-site py-20 px-6 lg:px-24 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-12 animate-in fade-in duration-1000">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'My Profile' }]} />

        <div className="bg-white p-12 lg:p-20 rounded-xl shadow-4xl border border-primary/5 space-y-12">
            <header className="mb-10 text-left border-b border-primary/5 pb-8">
                <h1 className="text-4xl font-black text-primary tracking-tighter uppercase italic">My Profile</h1>
                <div className="h-1.5 w-24 bg-secondary mt-6 rounded-full"></div>
            </header>

            <div className="space-y-8">
                <div className="flex flex-col gap-2">
                    <span className="text-xl font-medium text-primary/60">Login: <span className="font-black text-primary uppercase">{user.login}</span></span>
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-xl font-medium text-primary/60">Name: <span className="font-black text-primary uppercase">{user.full_name || '—'}</span></span>
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-xl font-medium text-primary/60">Email: <span className="font-black text-primary lowercase underline decoration-primary/20">{user.email}</span></span>
                </div>
            </div>

            <form action={changePassword} className="pt-12 space-y-6 max-w-md">
                <input 
                    name="password"
                    type="password" 
                    placeholder="Password" 
                    className="w-full bg-bg-site border border-primary/10 px-6 py-4 rounded-xl font-bold text-primary focus:border-secondary transition-all outline-none text-lg"
                />
                <input 
                    name="confirm_password"
                    type="password" 
                    placeholder="Confirm your password" 
                    className="w-full bg-bg-site border border-primary/10 px-6 py-4 rounded-xl font-bold text-primary focus:border-secondary transition-all outline-none text-lg"
                />
                <button 
                    type="submit" 
                    className="px-8 py-4 bg-primary/10 border border-primary/20 text-primary font-black rounded-xl text-sm uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-lg active:scale-95 duration-300 ring-4 ring-transparent hover:ring-secondary/20"
                >
                    Change password
                </button>
            </form>
        </div>

        <footer className="p-10 border-2 border-dashed border-primary/5 rounded-xl text-center text-primary/30 text-[9px] font-black uppercase tracking-[0.5em] italic leading-relaxed">
            Personal data is protected according to the privacy policy of the breed registry association.<br/>
            © 2026 ABG BREED REGISTRY
        </footer>
      </div>
    </div>
  );
}
