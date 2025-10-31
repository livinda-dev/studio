import {genkit, type Genkit} from 'genkit';
import {googleAI, type GoogleAIGenAI} from '@genkit-ai/google-genai';
import {config} from 'dotenv';

config(); // Load environment variables from .env file

let aiInstance: Genkit<[GoogleAIGenAI]> | null = null;

/**
 * Gets a configured Genkit AI instance.
 * Initializes the instance on first call.
 * This delayed initialization ensures the API key is read at runtime.
 */
export function getAi(): Genkit<[GoogleAIGenAI]> {
  if (aiInstance) {
    return aiInstance;
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable not set');
  }

  const googleAiPlugin = googleAI({apiKey: process.env.GEMINI_API_KEY});

  aiInstance = genkit({
    plugins: [googleAiPlugin],
  });

  return aiInstance;
}
