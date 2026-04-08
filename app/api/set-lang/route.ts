import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { lang } = await request.json();
  const cookieStore = await cookies();
  
  cookieStore.set('nxt-lang', lang, {
    path: '/',
    maxAge: 31536000,
    sameSite: 'lax',
  });

  return NextResponse.json({ success: true });
}
