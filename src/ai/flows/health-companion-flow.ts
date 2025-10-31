'use server';

/**
 * @fileOverview A multi-purpose health companion AI flow.
 *
 * - healthCompanion - A function that handles a health-related conversation.
 */

import { getAi } from '@/ai/genkit';
import { HealthCompanionInputSchema, HealthCompanionOutputSchema, type HealthCompanionInput, type HealthCompanionOutput } from './schemas';
import { setReminderTool } from './reminder-flow';
import { generateAudio } from './tts-flow';
import { z } from 'zod';
import { clearChatHistoryTool } from './chat-tools';


export async function healthCompanion(input: HealthCompanionInput): Promise<HealthCompanionOutput> {
  return healthCompanionFlow(input);
}

const getConversationalPrompt = () => {
    const ai = getAi();
    return ai.definePrompt({
        name: 'conversationalPrompt',
        input: { schema: HealthCompanionInputSchema },
        output: { schema: z.object({ textResponse: z.string().describe("The conversational response from the AI.") }) },
        tools: [setReminderTool, clearChatHistoryTool],
        prompt: `You are a friendly and helpful AI Health Companion. Your role is to have a natural, supportive conversation with the user about their health and wellness questions.

Keep your responses concise and easy to understand. Avoid making medical diagnoses. If the user asks for a diagnosis, gently remind them to consult a healthcare professional.

If the user asks to "clear the chat", "delete the history", "start over", or a similar request, you MUST use the 'clearChatHistoryTool'.

If the user mentions a specific, ongoing symptom (like a "headache", "nausea", or "back pain"), you should offer to set a daily reminder to help them manage it. Use the 'setReminderTool' for this. For example, if they mention a headache, suggest a reminder to "drink plenty of water".

Conversation History:
{{#if history}}
{{#each history}}
{{this.role}}: {{this.content}}
{{/each}}
{{/if}}

Current User Message:
"{{{message}}}"

Based on the conversation, provide a helpful and conversational response. If you decide to use a tool, your main textResponse should still be a conversational message informing the user of your action (e.g., "Okay, I've cleared our conversation history.").`,
    });
}


const healthCompanionFlow = getAi().defineFlow(
  {
    name: 'healthCompanionFlow',
    inputSchema: HealthCompanionInputSchema,
    outputSchema: HealthCompanionOutputSchema,
  },
  async (input) => {
    const conversationalPrompt = getConversationalPrompt();
    const promptResponse = await conversationalPrompt(input);
    const textResponse = promptResponse.output?.textResponse || "I'm not sure how to respond to that.";

    let audioData: string | undefined;
    try {
        const ttsResult = await generateAudio(textResponse);
        audioData = ttsResult.media;
    } catch (e) {
        console.error("TTS flow failed:", e);
    }
    
    return {
        textResponse,
        audioData,
        toolRequests: promptResponse.toolRequests,
    };
  }
);
