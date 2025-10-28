'use server';

/**
 * @fileOverview An AI symptom checker flow that provides educational, non-diagnostic guidance.
 *
 * - aiSymptomCheck - A function that handles the symptom checking process.
 * - AiSymptomCheckInput - The input type for the aiSymptomCheck function.
 * - AiSymptomCheckOutput - The return type for the aiSymptomCheck function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiSymptomCheckInputSchema = z.object({
  symptomDescription: z
    .string()
    .describe('The description of the symptoms provided by the user.'),
});
export type AiSymptomCheckInput = z.infer<typeof AiSymptomCheckInputSchema>;

const AiSymptomCheckOutputSchema = z.object({
  symptom: z.string().describe('The main symptom identified.'),
  possible_causes: z.array(z.string()).describe('Possible causes for the symptom.'),
  advice: z.string().describe('General advice related to the symptom (<=30 words, no diagnosis).'),
});
export type AiSymptomCheckOutput = z.infer<typeof AiSymptomCheckOutputSchema>;

export async function aiSymptomCheck(input: AiSymptomCheckInput): Promise<AiSymptomCheckOutput> {
  return aiSymptomCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSymptomCheckPrompt',
  input: {schema: AiSymptomCheckInputSchema},
  output: {schema: AiSymptomCheckOutputSchema},
  prompt: `You are a medical assistant that provides general, educational guidance only. Analyze the symptom and respond with JSON:\n{ symptom, possible_causes, advice (<=30 words, no diagnosis) }\n\nUser Symptom Description: {{{symptomDescription}}}`,
});

const aiSymptomCheckFlow = ai.defineFlow(
  {
    name: 'aiSymptomCheckFlow',
    inputSchema: AiSymptomCheckInputSchema,
    outputSchema: AiSymptomCheckOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
