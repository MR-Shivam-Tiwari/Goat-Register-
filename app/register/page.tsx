import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import RegisterForm from './RegisterForm';
import { getTranslation, Locale } from '@/lib/translations';

export default async function RegisterPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
  const t = getTranslation(lang);

  if (cookieStore.get('uid_token')) {
    redirect('/');
  }

  return <RegisterForm t={t} />;
}
