'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerAction } from '@/lib/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <div className="md:col-span-2 pt-6">
      <button 
        type="submit" 
        disabled={pending}
        className={`w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95 duration-200 ${pending ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {pending ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Создание аккаунта...</span>
          </>
        ) : (
          'Зарегистрироваться'
        )}
      </button>
      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-base">
              Уже есть аккаунт? <Link href="/login" className="text-blue-600 font-bold hover:underline ml-2">Войти в портал</Link>
          </p>
      </div>
    </div>
  );
}

export default function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push('/login?registered=success');
    }
  }, [state, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 py-20 overflow-y-auto">
      <div className="bg-white p-10 md:p-14 rounded-2xl shadow-xl max-w-3xl w-full border border-gray-200">
        
        <header className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">Регистрация в Ассоциации</h2>
            <p className="text-gray-500 text-lg">Подайте заявку на статус сертифицированного участника</p>
        </header>

        {state?.error && (
            <div className="md:col-span-2 mb-8 p-5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-base font-semibold animate-in fade-in slide-in-from-top-3">
                {state.error}
            </div>
        )}

        <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block ml-1 uppercase tracking-wider">Логин</label>
            <input 
              name="login" 
              type="text" 
              className="w-full bg-white border-2 border-gray-200 px-5 py-3.5 rounded-xl focus:border-blue-500 transition-all font-medium text-gray-900 text-lg outline-none" 
              placeholder="Придумайте логин" 
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block ml-1 uppercase tracking-wider">Email (Почта)</label>
            <input 
              name="email" 
              type="email" 
              className="w-full bg-white border-2 border-gray-200 px-5 py-3.5 rounded-xl focus:border-blue-500 transition-all font-medium text-gray-900 text-lg outline-none" 
              placeholder="example@mail.com" 
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block ml-1 uppercase tracking-wider">ФИО / Имя</label>
            <input 
              name="name" 
              type="text" 
              className="w-full bg-white border-2 border-gray-200 px-5 py-3.5 rounded-xl focus:border-blue-500 transition-all font-medium text-gray-900 text-lg outline-none" 
              placeholder="Ваше полное имя" 
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block ml-1 uppercase tracking-wider">Телефон</label>
            <input 
              name="phone" 
              type="text" 
              className="w-full bg-white border-2 border-gray-200 px-5 py-3.5 rounded-xl focus:border-blue-500 transition-all font-medium text-gray-900 text-lg outline-none" 
              placeholder="+380 (___) ___-____" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block ml-1 uppercase tracking-wider">Пароль</label>
            <input 
              name="password" 
              type="password" 
              className="w-full bg-white border-2 border-gray-200 px-5 py-3.5 rounded-xl focus:border-blue-500 transition-all font-medium text-gray-900 text-lg outline-none" 
              placeholder="••••••••" 
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block ml-1 uppercase tracking-wider">Повтор пароля</label>
            <input 
              name="confirm_password" 
              type="password" 
              className="w-full bg-white border-2 border-gray-200 px-5 py-3.5 rounded-xl focus:border-blue-500 transition-all font-medium text-gray-900 text-lg outline-none" 
              placeholder="••••••••" 
              required 
            />
          </div>
          
          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
