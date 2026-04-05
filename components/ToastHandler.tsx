'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { getTranslation, Locale } from '@/lib/translations';

export default function ToastHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Read lang from cookie
    const cookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith('nxt-lang='))
      ?.split('=')[1];
    const lang = (cookieValue as Locale) || 'ru';
    const t = getTranslation(lang);

    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const registered = searchParams.get('registered');
    const loggedin = searchParams.get('loggedin');
    const updated = searchParams.get('updated');

    if (success) {
      toast.success(decodeURIComponent(success), {
        style: {
          borderRadius: '12px',
          background: '#491907',
          color: '#CFA979',
          fontWeight: 'bold',
          fontSize: '12px'
        },
      });
    }

    if (error) {
      toast.error(decodeURIComponent(error), {
        style: {
          borderRadius: '12px',
          background: '#fee2e2',
          color: '#dc2626',
          fontWeight: 'bold',
          fontSize: '12px'
        },
      });
    }

    if (registered === 'success') {
      toast.success(t.common.toast.registered, {
        style: {
          borderRadius: '12px',
          background: '#491907',
          color: '#CFA979',
          fontWeight: 'bold',
          fontSize: '12px'
        },
      });
    }

    if (loggedin === 'success') {
      toast.success(t.common.toast.welcome, {
        style: {
          borderRadius: '12px',
          background: '#491907',
          color: '#CFA979',
          fontWeight: 'bold',
          fontSize: '12px'
        },
      });
    }

    if (updated === 'success') {
      toast.success(t.common.toast.updated, {
        style: {
          borderRadius: '12px',
          background: '#491907',
          color: '#CFA979',
          fontWeight: 'bold',
          fontSize: '12px'
        },
      });
    }

    // Clean params after toast to avoid re-triggering on refresh
    if (success || error || registered || loggedin || updated) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('success');
        params.delete('error');
        params.delete('registered');
        params.delete('loggedin');
        params.delete('updated');
        
        const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
        router.replace(newUrl);
    }
  }, [searchParams, router]);

  return null;
}
