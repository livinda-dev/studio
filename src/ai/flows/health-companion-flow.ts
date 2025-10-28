'use server';

/**
 * @fileOverview A multi-purpose health companion AI flow.
 *
 * - healthCompanion - A function that handles a health-related conversation.
 */

import {ai} from '@/ai/genkit';
import { HealthCompanionInputSchema, HealthCompanionOutputSchema, type HealthCompanionInput, type HealthCompanionOutput } from './schemas';


export async function healthCompanion(input: HealthCompanionInput): Promise<HealthCompanionOutput> {
  return healthCompanionFlow(input);
}

const conversationalPrompt = ai.definePrompt({
    name: 'conversationalPrompt',
    input: { schema: HealthCompanionInputSchema },
    output: { schema: HealthCompanionOutputSchema },
    prompt: `You are a friendly and helpful AI Health Companion. Your role is to have a natural, supportive conversation with the user about their health and wellness questions.

Keep your responses concise and easy to understand. Avoid making medical diagnoses. If the user asks for a diagnosis, gently remind them to consult a healthcare professional.

Conversation History:
{{#if history}}
{{#each history}}
{{this.role}}: {{this.content}}
{{/each}}
{{/if}}

Current User Message:
"{{{message}}}"

Based on the conversation, provide a helpful and conversational response.`,
});


const healthCompanionFlow = ai.defineFlow(
  {
    name: 'healthCompanionFlow',
    inputSchema: HealthCompanionInputSchema,
    outputSchema: HealthCompanionOutputSchema,
  },
  async (input) => {
    const { output } = await conversationalPrompt(input);
    return output!;
  }
);
