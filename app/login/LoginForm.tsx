'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/lib/actions';
import { translations } from '@/lib/translations';

function SubmitButton({ t }: { t: any }) {
  const { pending } = useFormStatus();
  // Ensure t and t.auth exist
  const auth = t?.auth || translations.ru.auth;

  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`w-full bg-primary text-secondary py-3.5 rounded-xl font-black text-xs shadow-lg transition-all transform hover:-translate-y-1 uppercase tracking-[0.4em] italic mt-2 active:scale-95 duration-500 box-shadow-elite flex items-center justify-center gap-3 ${pending ? 'opacity-70 cursor-not-allowed' : 'hover:bg-black'}`}
    >
      {pending ? (
        <>
          <div className="w-3.5 h-3.5 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin"></div>
          <span>{auth.loggingIn}</span>
        </>
      ) : (
        auth.signInBtn
      )}
    </button>
  );
}

export default function LoginForm({ t }: { t?: any }) {
  const [state, formAction] = useActionState(loginAction, null);
  const router = useRouter();

  // Fallback to Russian if t is missing
  const translations_safe = t || translations.ru;
  const auth = translations_safe.auth;

  useEffect(() => {
    if (state?.success) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_login', 'true');
      }
      router.push('/?loggedin=success');
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full border border-gray-200">
        
        <header className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">{auth.loginTitle}</h2>
            <p className="text-gray-500 text-lg">{auth.loginDesc}</p>
        </header>

        {state?.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
                {state.error}
            </div>
        )}

        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block ml-1">{auth.emailLabel}</label>
            <input 
              name="login" 
              type="text" 
              className="w-full bg-white border-2 border-gray-200 px-5 py-4 rounded-xl focus:border-blue-500 transition-all font-medium text-gray-900 text-lg outline-none" 
              placeholder={auth.loginPlaceholder} 
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block ml-1">{auth.passLabel}</label>
            <input 
              name="password" 
              type="password" 
              className="w-full bg-white border-2 border-gray-200 px-5 py-4 rounded-xl focus:border-blue-500 transition-all font-medium text-gray-900 text-lg outline-none" 
              placeholder={auth.passPlaceholder} 
              required 
            />
          </div>
          
          <SubmitButton t={t} />
        </form>

        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <Link href="/register" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors text-base flex items-center justify-center gap-2">
                {auth.noAccount}
                <span>➔</span>
            </Link>
        </div>
      </div>
    </div>
  );
}

