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
  
  let historyForAI: HistoryMessage[] = [];
  if (validatedFields.data.history) {
    const rawHistory = JSON.parse(validatedFields.data.history);
    historyForAI = rawHistory.map((msg: any) => {
      if (msg.sender === 'user') {
        return { role: 'user', content: msg.content };
      }
      // For AI messages, we need to extract the text part.
      // The content can be a string (for system messages) or an object (for AI responses).
      if (msg.sender === 'ai' && typeof msg.content === 'object' && msg.content !== null) {
        return { role: 'model', content: msg.content.textResponse || '' };
      }
      return null;
    }).filter((item: HistoryMessage | null): item is HistoryMessage => item !== null && item.content.trim() !== '');
  }


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

const ReminderSchema = z.object({
  symptom: z.string(),
  advice: z.string(),
});

type Reminder = z.infer<typeof ReminderSchema>;

// This server action is a bit of a placeholder in this prototype.
// In a real app, this is where you'd save the reminder to a database.
// For now, the client will also write to localStorage.
export async function handleReminder(reminder: Reminder) {
  console.log('Reminder received on server:', reminder);

  // In a real application, you would save this to Firestore for the user.
  // For example:
  // const { userId } = auth();
  // if (!userId) throw new Error("Not authenticated");
  // await setDoc(doc(db, 'users', userId, 'reminders', reminder.symptom), { ...reminder, createdAt: serverTimestamp() });
  
  // We are returning the data so the client knows it was "successful"
  // and can then proceed to save it to localStorage.
  return { success: true, reminder };
}
