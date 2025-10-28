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

  const rawHistory: any[] = validatedFields.data.history ? JSON.parse(validatedFields.data.history) : [];

  const historyForAI: Message[] = rawHistory
    .map((msg: any) => {
        // Only process messages before the current one being sent
        if (msg.sender === 'user') {
            return {
                message: msg.content,
                type: 'conversational', // User messages are always conversational for history
            };
        } else if (msg.sender === 'ai' && typeof msg.content === 'object') {
            // This is a structured AI response
            return msg.content as Message;
        } else if (msg.sender === 'system') {
            // We can ignore system messages for the AI's context
            return null;
        }
        // Fallback for other message types, though they shouldn't exist in history
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
