import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';
import { getTranslation, Locale } from '@/lib/translations';

export default async function LoginPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
  const t = getTranslation(lang);

  if (cookieStore.get('uid_token')) {
    redirect('/');
  }

  return <LoginForm t={t} />;
}
