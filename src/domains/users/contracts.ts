import { z } from "zod";

export const loginMethodValues = ["email", "phone"] as const;
export const verifyTypeValues = [
  "github_500stars",
  "company_proof",
  "platform_tasks",
] as const;

export const registrationInputSchema = z.object({
  identifier: z.string().trim().min(1),
  loginMethod: z.enum(loginMethodValues),
});

export const profileUpdateInputSchema = z.object({
  nickname: z.string().trim().min(1).max(50),
  bio: z.string().trim().min(1).max(500),
  school: z.string().trim().min(1).max(100),
  company: z.string().trim().min(1).max(100),
  direction: z.string().trim().min(1).max(50),
  githubUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  skills: z.array(z.string().trim().min(1).max(50)).min(1).max(8),
});

export const verifyApplicationInputSchema = z.object({
  verifyType: z.enum(verifyTypeValues),
  evidenceUrl: z.string().url(),
});

export type RegistrationInput = z.infer<typeof registrationInputSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateInputSchema>;
export type VerifyApplicationInput = z.infer<typeof verifyApplicationInputSchema>;
