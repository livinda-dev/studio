'use server';

import { healthCompanion } from '@/ai/flows/health-companion-flow';
import { HealthCompanionOutput, HealthCompanionInput, type HistoryMessage } from '@/ai/flows/schemas';
import { z } from 'zod';

const MessageSchema = z.object({
  message: z.string().min(1, 'Please enter a message.'),
  history: z.string().optional(), // history is a JSON string
});

type State = {
  data: HealthCompanionOutput | null;
  error: string | null;
};

type FrontendMessage = {
  id: number;
  sender: "user" | "ai" | "system";
  content: string | { textResponse: string }; // AI response can now be simpler
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
  
  const rawHistory: FrontendMessage[] = validatedFields.data.history ? JSON.parse(validatedFields.data.history) : [];

  const historyForAI: HistoryMessage[] = rawHistory
    .map((msg) => {
        if (msg.sender === 'user') {
            return { role: 'user', content: msg.content as string };
        }
        if (msg.sender === 'ai') {
            const content = typeof msg.content === 'string' ? msg.content : msg.content.textResponse;
            return { role: 'model', content: content };
        }
        return null;
    })
    .filter((item): item is HistoryMessage => item !== null);


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
