'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import crypto from 'crypto';

export async function loginAction(prevState: any, formData: FormData) {
  const loginInput = formData.get('login') as string;
  const password = formData.get('password') as string;

  // MD5 Hashing (Standard for 32-char hashes)
  const hash = crypto.createHash('md5').update(password).digest('hex');
  
  try {
    // Check both login and email
    const result = await query(
        'SELECT * FROM users WHERE (login = $1 OR email = $1) AND pass = $2', 
        [loginInput, hash]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const cookieStore = await cookies();
      cookieStore.set('uid_token', user.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
      cookieStore.set('user_login', user.login, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
      return { success: true };
    }

    return { error: 'Неверный логин или пароль' };
  } catch (e: any) {
    console.error('Login Error:', e.message);
    return { error: 'Ошибка сервера: ' + e.message };
  }
}

export async function registerAction(prevState: any, formData: FormData) {
    const login = formData.get('login') as string;
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    if (password !== confirmPassword) {
      return { error: 'Пароли не совпадают' };
    }

    const checkRes = await query('SELECT id FROM users WHERE email = $1 OR login = $2', [email, login]);
    if (checkRes.rows.length > 0) {
      return { error: 'Пользователь с таким email или логином уже существует' };
    }

    // MD5 Hashing 
    const hash = crypto.createHash('md5').update(password).digest('hex');
    
    // Constraints according to schema: secret: varchar(18) UNIQUE, token: varchar(19) UNIQUE
    const secret = crypto.randomBytes(8).toString('hex').substring(0, 16);
    const token = crypto.randomBytes(8).toString('hex').substring(0, 18);

    try {
      await query(
        'INSERT INTO users (login, email, name, phone, pass, secret, token, is_apk, role) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [login, email, name, phone, hash, secret, token, 0, 'member']
      );
      return { success: true };
    } catch (e: any) {
      console.error('Registration Error:', e.message);
      return { error: 'Ошибка базы данных: ' + e.message };
    }
}

export async function setLanguage(lang: string) {
    const cookieStore = await cookies();
    cookieStore.set('nxt-lang', lang, { path: '/' });
}
