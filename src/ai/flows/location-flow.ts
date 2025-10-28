'use server';
/**
 * @fileOverview A flow to determine a location city from latitude and longitude.
 *
 * - getLocationFromCoords - A function that gets the city.
 * - GetLocationFromCoordsInput - The input type for the function.
 * - GetLocationFromCoordsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetLocationFromCoordsInputSchema = z.object({
  latitude: z.number().describe('The latitude.'),
  longitude: z.number().describe('The longitude.'),
});
export type GetLocationFromCoordsInput = z.infer<typeof GetLocationFromCoordsInputSchema>;

const GetLocationFromCoordsOutputSchema = z.object({
  city: z.string().describe('The city name for the given coordinates.'),
});
export type GetLocationFromCoordsOutput = z.infer<typeof GetLocationFromCoordsOutputSchema>;

export async function getLocationFromCoords(input: GetLocationFromCoordsInput): Promise<GetLocationFromCoordsOutput> {
  return getLocationFromCoordsFlow(input);
}

const getLocationFromCoordsFlow = ai.defineFlow(
  {
    name: 'getLocationFromCoordsFlow',
    inputSchema: GetLocationFromCoordsInputSchema,
    outputSchema: GetLocationFromCoordsOutputSchema,
  },
  async ({ latitude, longitude }) => {
    
    const llmResponse = await ai.generate({
        prompt: `What is the city for the following coordinates: latitude ${latitude}, longitude ${longitude}? Respond with only the city name.`,
        model: 'googleai/gemini-2.5-flash',
    });

    return {
        city: llmResponse.text,
    }
  }
);
