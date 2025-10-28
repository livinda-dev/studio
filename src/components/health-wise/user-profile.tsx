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
                        <div className="flex gap-2">
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
                            Daily Notifications
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
            </CardContent>
        </Card>
    )
}
