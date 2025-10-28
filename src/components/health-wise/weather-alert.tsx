import { Sun, Droplets } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function WeatherAlert() {
    return (
        <Card className="shadow-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-950/50">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Sun className="h-6 w-6 text-yellow-500" />
                    <CardTitle className="font-headline text-primary">Weather Alert</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <Droplets className="h-8 w-8 text-primary/80 shrink-0" />
                <div>
                    <p className="font-semibold">It’s sunny and hot today!</p>
                    <p className="text-sm text-muted-foreground">Remember to drink plenty of water to stay hydrated.</p>
                </div>
            </CardContent>
        </Card>
    )
}
