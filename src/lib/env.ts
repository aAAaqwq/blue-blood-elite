import { z } from "zod";

const clientEnvSchema = z.object({
  VITE_APP_URL: z.string().min(1),
  VITE_PRIVY_APP_ID: z.string().min(1),
  VITE_PRIVY_CLIENT_ID: z.string().min(1),
  VITE_BASE_CHAIN_ID: z.string().min(1),
  VITE_BASE_RPC_URL: z.string().min(1).url(),
  VITE_USDC_TOKEN_ADDRESS: z.string().min(1),
  VITE_PLATFORM_WALLET_ADDRESS: z.string().min(1),
  VITE_WALLETCONNECT_PROJECT_ID: z.string().min(1),
  VITE_SUPABASE_URL: z.string().min(1),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

export function validateClientEnv(input: Record<string, string | undefined>): ClientEnv {
  return clientEnvSchema.parse(input);
}
