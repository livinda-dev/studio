import { Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DailyTip() {
    return (
        <Card className="shadow-lg bg-accent/30 dark:bg-accent/20">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Lightbulb className="h-6 w-6 text-accent-foreground" />
                    <CardTitle className="font-headline text-accent-foreground">Daily Health Tip</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                 <p className="text-foreground">
                    Start your day with a glass of water and a 10-minute walk to boost your energy and metabolism. 🌞
                 </p>
            </CardContent>
        </Card>
    )
}
