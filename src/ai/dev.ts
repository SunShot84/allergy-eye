import { config } from 'dotenv';
config();

import '@/ai/flows/identify-allergens-from-image.ts';
import '@/ai/flows/prioritize-allergens-based-on-profile.ts';