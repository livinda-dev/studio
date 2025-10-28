import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div>
            <div className="flex items-center gap-4 mb-4">
                 <Button variant="outline" size="icon" asChild>
                    <Link href="/profile">
                        <ArrowLeft />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold font-headline text-foreground">
                    Settings
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>App Settings</CardTitle>
                    <CardDescription>Manage your application preferences.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Settings content will go here.</p>
                </CardContent>
            </Card>
        </div>
    )
}