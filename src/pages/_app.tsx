import '../styles/globals.css';
import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { AuthProvider } from '../contexts/AuthContext';

const publicPaths = ['/login', '/signup', '/forgot-password'];

function LinkifyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
      // Check if we're on the client side
      if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem('token');
          const isPublicPath = publicPaths.includes(router.pathname);

          if (!storedToken && !isPublicPath) {
              router.replace('/login');
          }
      }
  }, [router.pathname]);
  
  return (
    <AuthProvider>
        <Component {...pageProps} />
    </AuthProvider>
  );
}

export default LinkifyApp;