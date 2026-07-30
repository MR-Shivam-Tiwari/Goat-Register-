import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import RegisterForm from './RegisterForm';
import { getTranslation, Locale } from '@/lib/translations';
import { getSessionUser } from '@/lib/access-control';

export default async function RegisterPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('nxt-lang')?.value as Locale) || 'ru';
  const t = getTranslation(lang);

  const user = await getSessionUser();
  if (user) {
    redirect('/');
  }

  return <RegisterForm t={t} />;
}
