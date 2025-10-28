"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase/provider';
import { useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

const AUTH_ROUTES = ['/login'];
const PUBLIC_ROUTES: string[] = []; // Add any other public routes here

export default function AuthProvider({ children }: { children: ReactNode }) {
    const { user, isUserLoading } = useUser();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (isUserLoading) return;

        const isAuthRoute = AUTH_ROUTES.includes(pathname);
        const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

        if (user && isAuthRoute) {
            router.push('/'); // Redirect logged-in users away from login page
        } else if (!user && !isAuthRoute && !isPublicRoute) {
            router.push('/login'); // Redirect unauthenticated users to login page
        }
    }, [user, isUserLoading, pathname, router]);

    // Show a loading screen while checking auth status,
    // and if we're about to redirect.
    if (isUserLoading || (!user && !AUTH_ROUTES.includes(pathname) && !PUBLIC_ROUTES.includes(pathname)) || (user && AUTH_ROUTES.includes(pathname))) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="flex items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                    <p className="text-lg font-semibold text-muted-foreground">Loading Your Experience...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
