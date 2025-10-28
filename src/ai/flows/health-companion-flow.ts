'use server';

/**
 * @fileOverview A multi-purpose health companion AI flow.
 *
 * - healthCompanion - A function that handles both symptom checking and general conversation.
 */

import {ai} from '@/ai/genkit';
import { HealthCompanionInputSchema, HealthCompanionOutputSchema, SymptomAnalysisSchema, type HealthCompanionInput, type HealthCompanionOutput } from './schemas';


export async function healthCompanion(input: HealthCompanionInput): Promise<HealthCompanionOutput> {
  return healthCompanionFlow(input);
}


const healthCompanionFlow = ai.defineFlow(
  {
    name: 'healthCompanionFlow',
    inputSchema: HealthCompanionInputSchema,
    outputSchema: HealthCompanionOutputSchema,
  },
  async (input) => {
    const isSymptomRelated = await ai.generate({
        prompt: `Does the following user message appear to be describing a medical symptom? Answer with only "yes" or "no".\n\nUser message: "${input.message}"`,
        model: 'googleai/gemini-2.5-flash',
        output: {
            format: 'text'
        }
    });

    if (isSymptomRelated.text.toLowerCase().includes('yes')) {
        const symptomPrompt = ai.definePrompt({
            name: 'aiSymptomCheckPrompt',
            input: {schema: HealthCompanionInputSchema},
            output: {schema: SymptomAnalysisSchema},
            prompt: `You are a medical assistant that provides general, educational guidance only. Analyze the symptom and respond with JSON:\n{ symptom, possible_causes, advice (<=30 words, no diagnosis) }\n\nUser Symptom Description: {{{message}}}`,
        });

        const { output } = await symptomPrompt(input);
        return {
            type: 'symptom_analysis',
            analysis: output!,
        };
    } else {
        const conversationalPrompt = await ai.generate({
            prompt: `You are a friendly and helpful AI Health Companion. The user said: "${input.message}". Respond in a conversational and friendly tone.`,
            model: 'googleai/gemini-2.5-flash'
        });

        return {
            type: 'conversational',
            textResponse: conversationalPrompt.text,
        };
    }
  }
);
