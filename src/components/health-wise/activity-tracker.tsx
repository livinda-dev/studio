"use client"

import { useState } from 'react';
import { Bike, Footprints, TrendingUp, Flame } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Activity = {
    type: 'Walk' | 'Run' | 'Cycle';
    duration: number; // in minutes
    distance: number; // in km
    date: Date;
}

const initialActivities: Activity[] = [
    { type: 'Walk', duration: 30, distance: 2.5, date: new Date(Date.now() - 86400000) },
    { type: 'Run', duration: 20, distance: 3.0, date: new Date(Date.now() - 172800000) },
];

const activityIcons = {
    Walk: <Footprints className="h-5 w-5" />,
    Run: <TrendingUp className="h-5 w-5" />,
    Cycle: <Bike className="h-5 w-5" />,
};

export default function ActivityTracker() {
    const [activities, setActivities] = useState<Activity[]>(initialActivities);

    const addActivity = (type: Activity['type']) => {
        const newActivity: Activity = {
            type,
            duration: Math.floor(Math.random() * 45) + 15, // 15-60 minutes
            distance: parseFloat((Math.random() * 5 + 1).toFixed(1)), // 1-6 km
            date: new Date(),
        };
        setActivities([newActivity, ...activities]);
    };

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Flame className="h-6 w-6 text-primary" />
                    <CardTitle className="font-headline">Activity Tracker</CardTitle>
                </div>
                <CardDescription>Log your daily physical activities.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" onClick={() => addActivity('Walk')}>
                        <Footprints className="mr-2 h-4 w-4" /> Walk
                    </Button>
                    <Button variant="outline" onClick={() => addActivity('Run')}>
                        <TrendingUp className="mr-2 h-4 w-4" /> Run
                    </Button>
                    <Button variant="outline" onClick={() => addActivity('Cycle')}>
                        <Bike className="mr-2 h-4 w-4" /> Cycle
                    </Button>
                </div>
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground">Recent Activities</h3>
                    {activities.slice(0, 3).map((activity, index) => (
                        <div key={index} className="flex items-center justify-between rounded-lg border bg-secondary/30 p-3">
                            <div className="flex items-center gap-3">
                                <div className="text-primary">{activityIcons[activity.type]}</div>
                                <div>
                                    <p className="font-semibold">{activity.type}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {activity.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">{activity.distance} km</p>
                                <p className="text-xs text-muted-foreground">{activity.duration} min</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
