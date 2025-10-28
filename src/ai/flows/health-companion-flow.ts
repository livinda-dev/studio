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

const symptomCheckPrompt = ai.definePrompt({
    name: 'symptomCheckPrompt',
    input: { schema: HealthCompanionInputSchema },
    output: { schema: HealthCompanionOutputSchema },
    prompt: `You are an AI medical assistant designed to provide general, educational guidance. You are not a substitute for a real doctor.

Your role is to have a conversation with the user about their health concerns.

Analyze the user's message and the conversation history.

1.  **If the user is describing a medical symptom for the first time or providing new information:**
    *   Your primary goal is to gather more information. Ask clarifying questions about the symptom.
    *   For example, if they say "I have a headache," ask about the location, severity, duration, what makes it better or worse, and any associated symptoms.
    *   Your response should be a question to get more details. Set the 'type' to 'conversational'.
    *   Do not provide any analysis or advice at this stage.

2.  **If the user is providing answers to your questions and you have enough information to provide a general analysis:**
    *   Identify the main symptom.
    *   List possible, general causes (do not diagnose).
    *   Provide brief, safe, general advice (e.g., "Consider resting," "Stay hydrated").
    *   Crucially, always include a disclaimer: "This is not a medical diagnosis. Please consult a healthcare professional for any medical concerns."
    *   Structure the output as JSON with the 'type' set to 'symptom_analysis'.

3.  **If the conversation is not about a medical symptom (e.g., "Hi", "Thank you"):**
    *   Respond in a friendly, conversational manner.
    *   Set the 'type' to 'conversational'.

Conversation History:
{{#if history~}}
{{#each history}}
User: {{this.message}}
AI: {{#if (eq this.type 'symptom_analysis')}}Symptom: {{this.analysis.symptom}}, Possible Causes: {{join this.analysis.possible_causes ", "}}, Advice: {{this.analysis.advice}}{{else}}{{this.textResponse}}{{/if}}
{{/each}}
{{~/if}}

Current User Message:
"{{{message}}}"

Based on the rules above, generate your response.`,
});


const healthCompanionFlow = ai.defineFlow(
  {
    name: 'healthCompanionFlow',
    inputSchema: HealthCompanionInputSchema,
    outputSchema: HealthCompanionOutputSchema,
  },
  async (input) => {
    const { output } = await symptomCheckPrompt(input);
    return output!;
  }
);
