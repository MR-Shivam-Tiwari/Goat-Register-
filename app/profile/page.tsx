import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getTranslation, Locale } from '@/lib/translations';
import { User, Mail, Shield, Key } from 'lucide-react';
import ProfileSubmitButton from './ProfileSubmitButton';

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
  const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
  const t = getTranslation(lang);
  
  if (!username) {
    redirect('/login');
  }

  const user = await getUserData(username);
  if (!user) redirect('/login');

  async function changePassword(formData: FormData) {
      'use server';
      // Simulation for now as requested UI focus
      redirect('/profile?updated=success');
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <Breadcrumbs items={[{ label: t.nav.home, href: '/' }, { label: t.nav.memberPortal }]} />

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#491907] px-8 py-10 text-white relative overflow-hidden">
            <div className="relative z-10">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight uppercase">{t.nav.memberPortal}</h1>
                <p className="text-white/70 text-sm mt-1 font-medium italic opacity-80 uppercase tracking-widest">{t.auth.loginDesc}</p>
            </div>
            {/* Decorative element */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          </div>

          <div className="p-6 sm:p-10 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* Account Details */}
              <div className="lg:col-span-1 space-y-8">
                <div>
                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <User size={12} strokeWidth={3} />
                        {t.users.registry}
                    </h2>
                    
                    <div className="space-y-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t.users.login}</span>
                            <span className="text-base font-bold text-gray-900 break-all">{user.login}</span>
                        </div>
                        
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t.users.fullName}</span>
                            <span className="text-base font-bold text-gray-900">{user.full_name || '—'}</span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t.users.email}</span>
                            <span className="text-base font-bold text-gray-900 break-all">{user.email}</span>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-50 flex items-center gap-3 text-green-600">
                    <Shield size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">{t.users.active} Account</span>
                </div>
              </div>

              {/* Password Change Form */}
              <div className="lg:col-span-2 bg-gray-50/50 rounded-2xl p-6 sm:p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                    <Key className="text-[#491907]" size={20} />
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight">{t.users.password}</h2>
                </div>

                <form action={changePassword} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">{t.auth.passLabel}</label>
                            <input 
                                name="password"
                                type="password" 
                                placeholder={t.auth.passPlaceholder} 
                                className="w-full bg-white border border-gray-200 px-5 py-3 rounded-xl font-medium text-gray-900 focus:border-[#491907] focus:ring-1 focus:ring-[#491907]/10 transition-all outline-none text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">{t.auth.confirmPassLabel}</label>
                            <input 
                                name="confirm_password"
                                type="password" 
                                placeholder={t.auth.passPlaceholder} 
                                className="w-full bg-white border border-gray-200 px-5 py-3 rounded-xl font-medium text-gray-900 focus:border-[#491907] focus:ring-1 focus:ring-[#491907]/10 transition-all outline-none text-sm"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <ProfileSubmitButton 
                            label={t.common.save} 
                            savingLabel={t.auth.creatingAccount} 
                        />
                    </div>
                    
                    <p className="text-[10px] text-gray-400 font-medium italic mt-4 opacity-70">
                        * {t.users.passwordHelp}
                    </p>
                </form>
              </div>
            </div>
          </div>
        </div>

        <footer className="py-8 text-center">
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] leading-relaxed max-w-lg mx-auto">
                {t.users.copyright}
            </p>
            <p className="text-[9px] font-black text-[#491907]/20 uppercase tracking-[0.5em] mt-2">
                © 2026 ABG BREED REGISTRY
            </p>
        </footer>
      </div>
    </div>
  );
}
