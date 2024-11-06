import { useEffect } from 'react';
import { useRouter } from 'next/router';

const publicPaths = ['/login', '/signup', '/forgot-password'];

export function RouteGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const isPublicPath = publicPaths.includes(router.pathname);

        if (!storedToken && !isPublicPath) {
            router.push('/login');
        }
    }, [router]);

    return <>{children}</>;
}