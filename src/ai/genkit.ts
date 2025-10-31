import {genkit} from 'genkit';
import {googleAI as googleAIFactory} from '@genkit-ai/google-genai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable not set');
}

export const googleAI = googleAIFactory({apiKey: process.env.GEMINI_API_KEY});

export const ai = genkit({
  plugins: [googleAI],
  model: 'googleai/gemini-2.5-flash',
});
