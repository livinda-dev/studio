"use client"

import { useState } from 'react';
import { User, Mail, Bell, BellOff, Settings, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function UserProfile() {
    const [notifications, setNotifications] = useState(true);

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary">
                         <AvatarImage src="https://picsum.photos/seed/user-avatar/64/64" alt="User Avatar" data-ai-hint="person face" />
                        <AvatarFallback>
                            <User className="h-8 w-8" />
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-xl font-headline">Alex Doe</CardTitle>
                        <CardDescription className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4"/>
                            alex.doe@example.com
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
                        <Button variant="outline" size="sm" className="flex-1">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Button>
                        <Button variant="destructive" size="sm" className="flex-1">
                            <LogOut className="mr-2 h-4 w-4" />
                            Log Out
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
