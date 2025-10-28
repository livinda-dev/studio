import {z} from 'zod';

const MessageSchema = z.object({
  message: z.string(),
  type: z.enum(['symptom_analysis', 'conversational']),
  analysis: z.any().optional(),
  textResponse: z.string().optional(),
});

export const HealthCompanionInputSchema = z.object({
  message: z.string().describe('The message from the user.'),
  history: z.array(MessageSchema).optional().describe('The conversation history.'),
});
export type HealthCompanionInput = z.infer<typeof HealthCompanionInputSchema>;

export const SymptomAnalysisSchema = z.object({
  symptom: z.string().describe('The main symptom identified.'),
  possible_causes: z.array(z.string()).describe('Possible causes for the symptom.'),
  advice: z.string().describe('General advice related to the symptom, including a disclaimer.'),
});

export const HealthCompanionOutputSchema = z.object({
    type: z.enum(['symptom_analysis', 'conversational']).describe("The type of response."),
    analysis: SymptomAnalysisSchema.optional().describe("The symptom analysis, if applicable."),
    textResponse: z.string().optional().describe("The conversational response, if applicable.")
});
export type HealthCompanionOutput = z.infer<typeof HealthCompanionOutputSchema>;

