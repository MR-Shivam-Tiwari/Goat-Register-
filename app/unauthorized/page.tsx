import Link from 'next/link';
import { cookies } from 'next/headers';
import { getTranslation, Locale } from '@/lib/translations';

export default async function UnauthorizedPage() {
    const cookieStore = await cookies();
    const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
    const t = getTranslation(lang);

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-6 bg-gray-50 font-sans">
            <div className="bg-white p-12 rounded-2xl shadow-xl max-w-md w-full border border-red-100 text-center space-y-6">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900">{t.common.accessDenied}</h1>
                <p className="text-gray-600 text-lg leading-relaxed">
                    {t.common.onlyAdmin}
                </p>

                <div className="pt-6">
                    <Link 
                        href="/" 
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-md transition-all active:scale-95 text-base"
                    >
                        {t.common.goHome}
                    </Link>
                </div>
            </div>
        </div>
    );
}
