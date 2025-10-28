"use client"

import { useState, useEffect, useRef } from 'react';
import { Bike, Footprints, TrendingUp, Flame, Play, Square, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ActivityType = 'Walk' | 'Run' | 'Cycle';

type Activity = {
    type: ActivityType;
    duration: number; // in seconds
    distance: number; // in km
    calories: number; // estimated calories burned
    date: Date;
}

const activityIcons = {
    Walk: <Footprints className="h-5 w-5" />,
    Run: <TrendingUp className="h-5 w-5" />,
    Cycle: <Bike className="h-5 w-5" />,
};

// MET (Metabolic Equivalent of Task) values for calorie calculation
const metValues: Record<ActivityType, number> = {
    Walk: 3.5,
    Run: 9.8,
    Cycle: 7.5,
};
const USER_WEIGHT_KG = 70; // Assuming an average user weight of 70kg for calorie calculation.

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export default function ActivityTracker() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isTracking, setIsTracking] = useState(false);
    const [currentActivityType, setCurrentActivityType] = useState<ActivityType>('Walk');
    const [trackingState, setTrackingState] = useState<{ distance: number, duration: number }>({ distance: 0, duration: 0 });
    const [error, setError] = useState<string | null>(null);

    const watchIdRef = useRef<number | null>(null);
    const lastPositionRef = useRef<GeolocationPosition | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Cleanup on component unmount
        return () => {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const handleStartTracking = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        setError(null);
        setTrackingState({ distance: 0, duration: 0 });
        lastPositionRef.current = null;
        setIsTracking(true);

        // Start timer
        timerRef.current = setInterval(() => {
            setTrackingState(prev => ({ ...prev, duration: prev.duration + 1 }));
        }, 1000);

        // Start watching position
        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                if (lastPositionRef.current) {
                    const newDistance = haversineDistance(
                        lastPositionRef.current.coords.latitude,
                        lastPositionRef.current.coords.longitude,
                        position.coords.latitude,
                        position.coords.longitude
                    );
                    setTrackingState(prev => ({ ...prev, distance: prev.distance + newDistance }));
                }
                lastPositionRef.current = position;
            },
            (err) => {
                setError(`Geolocation error: ${err.message}. Please enable location permissions.`);
                setIsTracking(false);
                if (timerRef.current) clearInterval(timerRef.current);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleStopTracking = () => {
        setIsTracking(false);

        // Stop timer and location watch
        if (timerRef.current) clearInterval(timerRef.current);
        if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        
        const durationHours = trackingState.duration / 3600;
        const caloriesBurned = Math.round((metValues[currentActivityType] * USER_WEIGHT_KG * durationHours));

        const newActivity: Activity = {
            type: currentActivityType,
            duration: trackingState.duration,
            distance: trackingState.distance,
            calories: caloriesBurned,
            date: new Date(),
        };

        setActivities([newActivity, ...activities]);
        setTrackingState({ distance: 0, duration: 0 });
    };

    const formatDuration = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours > 0 ? `${hours.toString().padStart(2, '0')}:` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Flame className="h-6 w-6 text-primary" />
                    <CardTitle className="font-headline">Activity Tracker</CardTitle>
                </div>
                <CardDescription>Track your physical activities in real-time.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-lg border bg-secondary/30 p-4 space-y-4 text-center">
                    {isTracking ? (
                        <>
                            <div className="flex justify-around items-center">
                                <div>
                                    <p className="text-sm text-muted-foreground">Distance</p>
                                    <p className="text-2xl font-bold">{trackingState.distance.toFixed(2)} <span className="text-sm font-normal">km</span></p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Duration</p>
                                    <p className="text-2xl font-bold">{formatDuration(trackingState.duration)}</p>
                                </div>
                            </div>
                            <Button variant="destructive" size="lg" onClick={handleStopTracking} className="w-full">
                                <Square className="mr-2 h-5 w-5" /> Stop Tracking
                            </Button>
                        </>
                    ) : (
                        <>
                            <Select onValueChange={(value: ActivityType) => setCurrentActivityType(value)} defaultValue={currentActivityType}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select an activity" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Walk"><Footprints className="mr-2 h-4 w-4 inline-block"/> Walk</SelectItem>
                                    <SelectItem value="Run"><TrendingUp className="mr-2 h-4 w-4 inline-block"/> Run</SelectItem>
                                    <SelectItem value="Cycle"><Bike className="mr-2 h-4 w-4 inline-block"/> Cycle</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button size="lg" onClick={handleStartTracking} className="w-full">
                                <Play className="mr-2 h-5 w-5" /> Start Tracking
                            </Button>
                        </>
                    )}
                    {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                </div>
                
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground">Recent Activities</h3>
                    {activities.length === 0 && !isTracking && (
                         <p className="text-sm text-center text-muted-foreground py-4">No activities logged yet. Start tracking to see your history.</p>
                    )}
                    {activities.slice(0, 3).map((activity, index) => (
                        <div key={index} className="flex items-center justify-between rounded-lg border bg-card p-3">
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
                                <p className="font-semibold">{activity.distance.toFixed(2)} km</p>
                                <p className="text-xs text-muted-foreground">{formatDuration(activity.duration)}</p>
                            </div>
                             <div className="text-right pl-3 border-l ml-3">
                                <p className="font-semibold flex items-center gap-1"><Flame className="h-4 w-4 text-destructive"/> {activity.calories}</p>
                                <p className="text-xs text-muted-foreground">kcal</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
