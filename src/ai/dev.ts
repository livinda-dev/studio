import { config } from 'dotenv';
config();

import '@/ai/flows/health-companion-flow.ts';
import '@/ai/flows/weather-flow.ts';
import '@/ai/flows/location-flow.ts';
import '@/ai/flows/reminder-flow.ts';
import '@/ai/flows/tts-flow.ts';
