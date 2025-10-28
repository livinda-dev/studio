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

  // The history from the client includes the latest user message, which we don't want to send as history
  const historyForAI: Message[] = rawHistory
    // Filter out system messages and the message that is currently being sent
    .filter((msg: any) => msg.sender === 'ai' || (msg.sender === 'user' && msg.content !== validatedFields.data.message))
    .map((msg: any) => {
        if (msg.sender === 'user') {
            return {
                // This is a user message for the history
                message: msg.content,
                type: 'conversational',
            }
        }
        // This is an AI message from the history
        return msg.content;
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
