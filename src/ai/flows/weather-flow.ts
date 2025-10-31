
'use server';
/**
 * @fileOverview A flow to get the current weather for a given location.
 *
 * - getWeather - A function that gets the weather.
 * - GetWeatherInput - The input type for the getWeather function.
 * - GetWeatherOutput - The return type for the getWeather function.
 */

import {getAi} from '@/ai/genkit';
import {z} from 'genkit';

const GetWeatherInputSchema = z.object({
  location: z.string().describe('The location to get the weather for.'),
});
export type GetWeatherInput = z.infer<typeof GetWeatherInputSchema>;

const GetWeatherOutputSchema = z.object({
  temperature: z.number().describe('The current temperature in Celsius.'),
  condition: z.string().describe('A brief description of the weather condition (e.g., "Sunny", "Cloudy").'),
  windSpeed: z.number().describe('The wind speed in km/h.'),
  humidity: z.number().describe('The humidity percentage.'),
  advice: z.string().describe('A short health advice based on the weather (e.g., "Stay hydrated").'),
});
export type GetWeatherOutput = z.infer<typeof GetWeatherOutputSchema>;

export async function getWeather(input: GetWeatherInput): Promise<GetWeatherOutput> {
  return getWeatherFlow(input);
}

const getWeatherTool = getAi().defineTool(
  {
    name: 'getCurrentWeather',
    description: 'Get the current weather in a given location.',
    inputSchema: z.object({ location: z.string() }),
    outputSchema: z.object({
        temperature: z.number(),
        wind: z.number(),
        humidity: z.number(),
        condition: z.string(),
    }),
  },
  async ({ location }) => {
    // In a real app, you'd call a weather API here.
    // For this example, we'll return more realistic mock data.
    const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Windy'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];

    let temperature;
    if (condition === 'Rainy') {
        // Cooler temps for rain
        temperature = Math.floor(Math.random() * 8) + 15; // 15°C to 22°C
    } else {
        // Warmer temps for other conditions
        temperature = Math.floor(Math.random() * 13) + 18; // 18°C to 30°C
    }
    
    const wind = Math.floor(Math.random() * 15) + 5; // 5 to 20 km/h
    const humidity = Math.floor(Math.random() * 40) + 50; // 50% to 90%
    
    return { temperature, wind, humidity, condition };
  }
);

const getWeatherFlow = getAi().defineFlow(
  {
    name: 'getWeatherFlow',
    inputSchema: GetWeatherInputSchema,
    outputSchema: GetWeatherOutputSchema,
  },
  async input => {
    const ai = getAi();
    // First, explicitly call the tool to get the weather data.
    const weatherData = await getWeatherTool(input);

    if (!weatherData) {
        throw new Error("Could not retrieve weather data from the tool.");
    }
    
    let advice = "AI health advice is temporarily unavailable.";
    try {
        // Then, use the weather data to generate health advice.
        const adviceResponse = await ai.generate({
            prompt: `The weather is: ${weatherData.condition}, ${weatherData.temperature}°C, ${weatherData.wind} km/h wind, ${weatherData.humidity}% humidity. Give one short health advice sentence.`,
            model: 'googleai/gemini-2.5-flash',
        });
        advice = adviceResponse.text;
    } catch (e: any) {
        console.warn("Could not generate weather advice from AI. This may be due to a temporary service overload.", e.message);
        // If the AI fails (e.g., overload), we'll use a default advice but still return the weather data.
    }


    return {
        temperature: weatherData.temperature,
        condition: weatherData.condition,
        windSpeed: weatherData.wind,
        humidity: weatherData.humidity,
        advice: advice,
    }
  }
);
