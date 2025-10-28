'use server';

import { aiSymptomCheck, AiSymptomCheckOutput, AiSymptomCheckInput } from '@/ai/flows/ai-symptom-check';
import { z } from 'zod';

const SymptomSchema = z.object({
  symptomDescription: z.string().min(3, 'Please describe your symptom in more detail.'),
});

type State = {
  data: AiSymptomCheckOutput | null;
  error: string | null;
};

export async function handleSymptomCheck(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = SymptomSchema.safeParse({
    symptomDescription: formData.get('symptomDescription'),
  });

  if (!validatedFields.success) {
    return {
      data: null,
      error: validatedFields.error.flatten().fieldErrors.symptomDescription?.[0] || 'Invalid input.',
    };
  }

  try {
    const input: AiSymptomCheckInput = {
      symptomDescription: validatedFields.data.symptomDescription,
    };
    const result = await aiSymptomCheck(input);
    return {
      data: result,
      error: null,
    };
  } catch (error) {
    console.error('AI Symptom Check Error:', error);
    return {
      data: null,
      error: 'The AI assistant is currently unavailable. Please try again later.',
    };
  }
}
