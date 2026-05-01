/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_PRIVY_APP_ID: string;
  readonly VITE_PRIVY_CLIENT_ID: string;
  readonly VITE_BASE_CHAIN_ID: string;
  readonly VITE_BASE_RPC_URL: string;
  readonly VITE_USDC_TOKEN_ADDRESS: string;
  readonly VITE_PLATFORM_WALLET_ADDRESS: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID: string;
  readonly VITE_DEV_ACTOR_USER_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
