
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getWeather, GetWeatherOutput } from '@/ai/flows/weather-flow';
import { getLocationFromCoords } from '@/ai/flows/location-flow';

interface WeatherContextType {
    weatherData: GetWeatherOutput | null;
    location: string | null;
    loading: boolean;
    error: string | null;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export function WeatherProvider({ children }: { children: ReactNode }) {
    const [weatherData, setWeatherData] = useState<GetWeatherOutput | null>(null);
    const [location, setLocation] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWeatherData = () => {
            if (!navigator.geolocation) {
                setError("Geolocation is not supported by your browser.");
                setLoading(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const locationResult = await getLocationFromCoords({ latitude, longitude });
                    setLocation(locationResult.city);
                    
                    if (locationResult.city) {
                        const weatherResult = await getWeather({ location: locationResult.city });
                        setWeatherData(weatherResult);
                    } else {
                        setError("Could not determine your location.");
                    }
                } catch (err: any) {
                    console.error("Weather/Location fetch error:", err);
                    let errorMessage = "Failed to fetch weather data. Please check your connection or API key.";
                    // Check for specific Genkit/Google AI overload error
                    if (err.message && (err.message.includes('503') || err.message.includes('overloaded'))) {
                        errorMessage = "The AI service is temporarily overloaded. Please try again in a few moments.";
                    }
                    setError(errorMessage);
                } finally {
                    setLoading(false);
                }
            }, () => {
                setError("Geolocation permission denied. Please enable it in your browser settings to see local weather.");
                setLoading(false);
            });
        };

        fetchWeatherData();
    }, []); // Empty dependency array ensures this runs only once

    const value = { weatherData, location, loading, error };

    return (
        <WeatherContext.Provider value={value}>
            {children}
        </WeatherContext.Provider>
    );
}

export function useWeather() {
    const context = useContext(WeatherContext);
    if (context === undefined) {
        throw new Error('useWeather must be used within a WeatherProvider');
    }
    return context;
}
