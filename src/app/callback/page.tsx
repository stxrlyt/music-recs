'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleIncomingRedirect } from '@inrupt/solid-client-authn-browser';
import { useSolidSession } from '@/context/solidsession';

export default function CallbackPage() {
  const router = useRouter();
  const { session } = useSolidSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function completeLogin() {
      try {
        await handleIncomingRedirect({ restorePreviousSession: true });

        // Check directly from session
        if (session.info.isLoggedIn) {
          router.replace('/');
        } else {
          router.replace('/login'); // fallback
        }
      } catch (error) {
        console.error('Error during redirect handling:', error);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    }
    completeLogin();
  }, [router, session]);

  return <div>{loading ? 'Loading...' : 'Redirecting...'}</div>;
}
