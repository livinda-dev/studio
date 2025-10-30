"use client"

import { useState } from 'react';
import { User, Mail, Bell, BellOff, Settings, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Skeleton } from '../ui/skeleton';

const TelegramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-1.002 6.5-1.153 7.29-.076.395-.28.46-.48.462-.436.002-1.053-.29-1.574-.617-.528-.33-1.026-.676-1.52-1.01-.58-.39-1.16-.78-1.52-1.01-.39-.25-.132-.502.1-.79.91-1.05 2.115-2.458 2.115-2.458s.229-.208-.04-.019l-3.06 1.944c-.44.278-.88.42-1.32.279-.44-.14-.436-.42-.436-.88v-3.03c0-.88.35-1.32.88-1.32.44 0 .88.14 1.32.279l6.764 3.382s.38.16.54.06c.16-.1.14-.38.14-.38l.001-3.193z"/>
    </svg>
);


export default function UserProfile() {
    const [notifications, setNotifications] = useState(true);
    const { user, auth, isUserLoading } = useFirebase();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // The AuthProvider will handle the redirect.
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    if (isUserLoading) {
        return (
             <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className='space-y-2'>
                           <Skeleton className="h-6 w-32" />
                           <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Skeleton className="h-12 w-full" />
                    <Separator/>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <div className="flex flex-col gap-2">
                           <Skeleton className="h-9 w-full" />
                           <Skeleton className="h-9 w-full" />
                           <Skeleton className="h-9 w-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }


    return (
        <Card className="shadow-lg">
            <CardHeader>
                 <h1 className="text-2xl font-bold font-headline text-foreground mb-4">
                    My Profile
                </h1>
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary">
                         <AvatarImage src={user?.photoURL || "https://picsum.photos/seed/user-avatar/64/64"} alt={user?.displayName || "User Avatar"} data-ai-hint="person face" />
                        <AvatarFallback>
                            <User className="h-8 w-8" />
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-xl font-headline">{user?.displayName || 'Welcome'}</CardTitle>
                        <CardDescription className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4"/>
                            {user?.email || 'No email provided'}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="flex items-center space-x-3">
                        {notifications ? <Bell className="h-5 w-5 text-primary" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
                        <Label htmlFor="notifications-switch" className="font-medium">
                            Daily App Notifications
                        </Label>
                    </div>
                    <Switch
                        id="notifications-switch"
                        checked={notifications}
                        onCheckedChange={setNotifications}
                        aria-label="Toggle daily notifications"
                    />
                </div>
                <Separator/>
                 <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">Account Actions</h3>
                    <div className="flex flex-col gap-2">
                         <Button variant="outline" className="w-full justify-start" asChild>
                           <Link href="https://t.me/your_bot_username" target="_blank">
                                <TelegramIcon className="mr-2 h-5 w-5"/>
                                Connect with Telegram
                            </Link>
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1" asChild>
                                <Link href="/settings">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </Link>
                            </Button>
                            <Button variant="destructive" size="sm" className="flex-1" onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Log Out
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
