import { z } from "zod";

export const bountyCategoryValues = [
  "本地化部署",
  "AI模型",
  "Agent开发",
  "Web3",
  "数据分析",
  "其他",
] as const;

const minimumDeadlineMs = 1000 * 60 * 60 * 24 * 3;
const usdcAmountPattern = /^\d+(\.\d{1,6})?$/;

export const createBountyInputSchema = z.object({
  title: z.string().trim().min(1).max(50),
  description: z.string().trim().min(1),
  category: z.enum(bountyCategoryValues),
  techTags: z.array(z.string().trim().min(1)).min(1),
  rewardUsdc: z
    .string()
    .regex(usdcAmountPattern)
    .refine((value) => Number(value) >= 50, "Reward must be at least 50 USDC"),
  deadline: z.string().datetime().refine((value) => {
    return new Date(value).getTime() - Date.now() >= minimumDeadlineMs;
  }, "Deadline must be at least three days in the future"),
  deliveryStandard: z.string().trim().min(1),
});

export type CreateBountyInput = z.infer<typeof createBountyInputSchema>;
