import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { validateClientEnv } from "@/lib/env";

function readClientEnv() {
  return validateClientEnv({
    VITE_APP_URL: import.meta.env.VITE_APP_URL,
    VITE_PRIVY_APP_ID: import.meta.env.VITE_PRIVY_APP_ID,
    VITE_PRIVY_CLIENT_ID: import.meta.env.VITE_PRIVY_CLIENT_ID,
    VITE_BASE_CHAIN_ID: import.meta.env.VITE_BASE_CHAIN_ID,
    VITE_BASE_RPC_URL: import.meta.env.VITE_BASE_RPC_URL,
    VITE_USDC_TOKEN_ADDRESS: import.meta.env.VITE_USDC_TOKEN_ADDRESS,
    VITE_PLATFORM_WALLET_ADDRESS: import.meta.env.VITE_PLATFORM_WALLET_ADDRESS,
    VITE_WALLETCONNECT_PROJECT_ID: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  });
}

export function createBrowserSupabaseClient(): SupabaseClient {
  const clientEnv = readClientEnv();
  return createClient(clientEnv.VITE_SUPABASE_URL, clientEnv.VITE_SUPABASE_ANON_KEY);
}

export function createBrowserSupabaseClientSafely(): SupabaseClient | null {
  try {
    return createBrowserSupabaseClient();
  } catch {
    return null;
  }
}

let singletonClient: SupabaseClient | null = null;

export function getBrowserSupabaseClient(): SupabaseClient | null {
  if (!singletonClient) {
    singletonClient = createBrowserSupabaseClientSafely();
  }
  return singletonClient;
}
