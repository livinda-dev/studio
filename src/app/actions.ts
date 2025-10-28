'use server';

import { healthCompanion } from '@/ai/flows/health-companion-flow';
import { HealthCompanionOutput, HealthCompanionInput, type Message } from '@/ai/flows/schemas';
import { z } from 'zod';

const MessageSchema = z.object({
  message: z.string().min(1, 'Please enter a message.'),
  history: z.string().optional(), // history is a JSON string
});

type State = {
  data: HealthCompanionOutput | null;
  error: string | null;
};

export async function handleChatMessage(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = MessageSchema.safeParse({
    message: formData.get('message'),
    history: formData.get('history'),
  });

  if (!validatedFields.success) {
    return {
      data: null,
      error: validatedFields.error.flatten().fieldErrors.message?.[0] || 'Invalid input.',
    };
  }
  
  const rawHistory = validatedFields.data.history ? JSON.parse(validatedFields.data.history) : [];

  // Transform the raw history to match the expected `Message` schema for the AI flow.
  const historyForAI: Message[] = rawHistory
    .filter((msg: any) => msg.sender !== 'system') // Exclude system messages
    .map((msg: any) => {
      // Handle user messages (which are plain strings)
      if (msg.sender === 'user' && typeof msg.content === 'string') {
        return {
          message: msg.content,
          type: 'conversational' as const,
        };
      }
      // Handle AI messages (which are objects)
      if (msg.sender === 'ai' && typeof msg.content === 'object') {
        return msg.content;
      }
      return null;
    })
    .filter((item: Message | null): item is Message => item !== null);


  try {
    const input: HealthCompanionInput = {
      message: validatedFields.data.message,
      history: historyForAI,
    };
    const result = await healthCompanion(input);
    return {
      data: result,
      error: null,
    };
  } catch (error) {
    console.error('AI Chat Error:', error);
    return {
      data: null,
      error: 'The AI assistant is currently unavailable. Please try again later.',
    };
  }
}