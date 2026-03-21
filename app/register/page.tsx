import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import RegisterForm from './RegisterForm';

export default async function RegisterPage() {
  const cookieStore = await cookies();
  if (cookieStore.get('uid_token')) {
    redirect('/');
  }

  return <RegisterForm />;
}
