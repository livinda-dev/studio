
"use client"

import { Sun, Droplets, Wind, Cloud, Loader2, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWeather } from '@/context/weather-context';

const weatherIcons = {
    'Sunny': <Sun className="h-8 w-8 text-yellow-500 shrink-0" />,
    'Cloudy': <Cloud className="h-8 w-8 text-gray-500 shrink-0" />,
    'Rainy': <Droplets className="h-8 w-8 text-blue-500 shrink-0" />,
    'Windy': <Wind className="h-8 w-8 text-gray-400 shrink-0" />,
};

export default function WeatherAlert() {
    const { weatherData, location, loading, error } = useWeather();

    if (loading) {
        return (
            <Card className="shadow-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-950/50">
                <CardHeader>
                    <div className="flex items-center gap-3">
                         <MapPin className="h-6 w-6 text-primary" />
                         <CardTitle className="font-headline text-primary">Fetching Weather...</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex items-center justify-center gap-4 p-6">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                    <p className="text-muted-foreground">Getting your local weather</p>
                </CardContent>
            </Card>
        )
    }

     if (error) {
        return (
             <Card className="shadow-lg bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-950/50">
                <CardHeader>
                    <CardTitle className="font-headline text-destructive">Weather Unavailable</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-destructive">{error}</p>
                </CardContent>
            </Card>
        )
    }

    if (!weatherData) {
        return null; // Or a fallback UI if weather couldn't be fetched but there wasn't a hard error
    }

    const icon = weatherIcons[weatherData.condition as keyof typeof weatherIcons] || <Sun className="h-8 w-8 text-yellow-500 shrink-0" />;

    return (
        <Card className="shadow-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-950/50">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <MapPin className="h-6 w-6 text-primary" />
                    <CardTitle className="font-headline text-primary">Weather in {location}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                {icon}
                <div>
                    <p className="font-semibold">{weatherData.temperature}°C and {weatherData.condition}</p>
                    <p className="text-sm text-muted-foreground">{weatherData.advice}</p>
                </div>
            </CardContent>
        </Card>
    )
}
