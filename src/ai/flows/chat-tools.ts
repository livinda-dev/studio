'use server';
/**
 * @fileOverview Tools for managing the chat itself.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const clearChatHistoryTool = ai.defineTool(
  {
    name: 'clearChatHistoryTool',
    description: 'Clears the entire chat history for the user.',
    inputSchema: z.void(),
    outputSchema: z.void(),
  },
  async () => {
    // This tool doesn't need to *do* anything on the server.
    // Its purpose is to signal the client to clear its state.
    console.log('AI signaled to clear chat history.');
  }
);
