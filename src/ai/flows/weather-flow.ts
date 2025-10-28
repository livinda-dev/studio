'use server';
/**
 * @fileOverview A flow to get the current weather for a given location.
 *
 * - getWeather - A function that gets the weather.
 * - GetWeatherInput - The input type for the getWeather function.
 * - GetWeatherOutput - The return type for the getWeather function.
 */

import {ai} from '@/ai/genkit';
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

const getWeatherTool = ai.defineTool(
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
    // For this example, we'll return mock data.
    const temperature = Math.floor(Math.random() * 20) + 10;
    const wind = Math.floor(Math.random() * 10) + 5;
    const humidity = Math.floor(Math.random() * 50) + 30;
    const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Windy'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return { temperature, wind, humidity, condition };
  }
);


const prompt = ai.definePrompt({
  name: 'weatherAdvicePrompt',
  input: { schema: GetWeatherInputSchema },
  output: { schema: GetWeatherOutputSchema },
  tools: [getWeatherTool],
  prompt: `You are a helpful weather and health assistant. Get the current weather for the user's location and provide a short, relevant health tip.

Location: {{{location}}}`,
});

const getWeatherFlow = ai.defineFlow(
  {
    name: 'getWeatherFlow',
    inputSchema: GetWeatherInputSchema,
    outputSchema: GetWeatherOutputSchema,
  },
  async input => {
    const llmResponse = await prompt(input);
    const toolResponse = llmResponse.toolRequest?.tool?.(getWeatherTool)?.output;

    if (!toolResponse) {
        throw new Error("The model did not call the weather tool as expected.");
    }
    
    const adviceResponse = await ai.generate({
        prompt: `The weather is: ${toolResponse.condition}, ${toolResponse.temperature}°C, ${toolResponse.wind} km/h wind, ${toolResponse.humidity}% humidity. Give one short health advice sentence.`,
        model: 'googleai/gemini-2.5-flash',
    });

    return {
        temperature: toolResponse.temperature,
        condition: toolResponse.condition,
        windSpeed: toolResponse.wind,
        humidity: toolResponse.humidity,
        advice: adviceResponse.text,
    }
  }
);
