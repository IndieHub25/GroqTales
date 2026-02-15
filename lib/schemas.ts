import { z } from 'zod';

export const generateStorySchema = z.object({
  prompt: z.string()
    .min(10, "Prompt must be at least 10 characters")
    .max(300, "Prompt cannot exceed 300 characters")
    .regex(/^[a-zA-Z0-9 .,!?'"-]+$/, "Contains invalid characters"),
  genre: z.enum(['fantasy', 'scifi', 'horror', 'adventure', 'mystery']),
  tone: z.enum(['dark', 'humorous', 'epic', 'whimsical']).optional(),
});

export const mintRequestSchema = z.object({
  userWallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  storyId: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid Story ID"),
  signature: z.string().optional(), 
});