import {z} from 'zod';

export const HistoryMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type HistoryMessage = z.infer<typeof HistoryMessageSchema>;


export const HealthCompanionInputSchema = z.object({
  message: z.string().describe('The message from the user.'),
  history: z.array(HistoryMessageSchema).optional().describe('The conversation history.'),
});
export type HealthCompanionInput = z.infer<typeof HealthCompanionInputSchema>;

export const HealthCompanionOutputSchema = z.object({
    textResponse: z.string().describe("The conversational response from the AI."),
});
export type HealthCompanionOutput = z.infer<typeof HealthCompanionOutputSchema>;
