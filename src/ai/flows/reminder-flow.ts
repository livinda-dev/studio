'use server';
/**
 * @fileOverview A flow for setting reminders.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ReminderSchema = z.object({
  symptom: z.string().describe('The symptom the user is experiencing (e.g., "headache").'),
  advice: z.string().describe('A short, actionable piece of advice for the user (e.g., "drink plenty of water").'),
});

export const setReminderTool = ai.defineTool(
  {
    name: 'setReminderTool',
    description: 'Sets a daily reminder for the user to help them manage a health symptom.',
    inputSchema: ReminderSchema,
    outputSchema: z.void(),
  },
  async (reminder) => {
    // This tool doesn't need to *do* anything on the server.
    // Its purpose is to structure the data for the client.
    // The client-side code will see that this tool was called and handle the actual reminder logic.
    console.log(`AI suggested a reminder for ${reminder.symptom}: ${reminder.advice}`);
  }
);
