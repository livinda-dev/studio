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
    audioData: z.string().optional().describe("A data URI of the spoken text response."),
});
export type HealthCompanionOutput = z.infer<typeof HealthCompanionOutputSchema>;
