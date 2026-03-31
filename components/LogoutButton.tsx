'use client';

import { translations } from '@/lib/translations';

interface LogoutButtonProps {
  t: any;
  action: (formData: FormData) => Promise<void>;
}

export default function LogoutButton({ t, action }: LogoutButtonProps) {
  const handleLogout = async (formData: FormData) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_login');
    }
    await action(formData);
  };

  return (
    <form action={handleLogout}>
      <button 
        type="submit" 
        className="bg-gray-50 text-gray-700 px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-95"
      >
        {t.nav.logout}
      </button>
    </form>
  );
}
