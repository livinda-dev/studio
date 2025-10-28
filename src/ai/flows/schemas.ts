import {z} from 'zod';

export const SymptomAnalysisSchema = z.object({
  symptom: z.string().describe('The main symptom identified.'),
  possible_causes: z.array(z.string()).describe('Possible causes for the symptom.'),
  advice: z.string().describe('General advice related to the symptom, including a disclaimer.'),
});

export const MessageSchema = z.object({
  type: z.enum(['symptom_analysis', 'conversational']).describe("The type of response."),
  analysis: SymptomAnalysisSchema.optional().describe("The symptom analysis, if applicable."),
  textResponse: z.string().optional().describe("The conversational response, if applicable."),
  // Adding the user message to the schema for history
  message: z.string().optional().describe('The message from the user.'), 
});
export type Message = z.infer<typeof MessageSchema>;


export const HealthCompanionInputSchema = z.object({
  message: z.string().describe('The message from the user.'),
  history: z.array(MessageSchema).optional().describe('The conversation history.'),
});
export type HealthCompanionInput = z.infer<typeof HealthCompanionInputSchema>;

export const HealthCompanionOutputSchema = MessageSchema;
export type HealthCompanionOutput = z.infer<typeof HealthCompanionOutputSchema>;