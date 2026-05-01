import { describe, expect, it } from "vitest";

import { validateClientEnv } from "@/lib/env";

const validEnv = {
  VITE_APP_URL: "http://localhost:3000",
  VITE_PRIVY_APP_ID: "privy-app-id",
  VITE_PRIVY_CLIENT_ID: "privy-client-id",
  VITE_BASE_CHAIN_ID: "84532",
  VITE_BASE_RPC_URL: "https://sepolia.base.org",
  VITE_USDC_TOKEN_ADDRESS: "0x1234567890abcdef1234567890abcdef12345678",
  VITE_PLATFORM_WALLET_ADDRESS: "0xabcdef1234567890abcdef1234567890abcdef12",
  VITE_WALLETCONNECT_PROJECT_ID: "wallet-connect-project",
  VITE_SUPABASE_URL: "https://example.supabase.co",
  VITE_SUPABASE_ANON_KEY: "anon-key",
};

describe("validateClientEnv", () => {
  it("accepts a complete valid client env shape", () => {
    expect(validateClientEnv(validEnv)).toEqual(validEnv);
  });

  it("rejects when a required env key is missing", () => {
    expect(() =>
      validateClientEnv({
        ...validEnv,
        VITE_PRIVY_APP_ID: "",
      }),
    ).toThrow();
  });

  it("rejects invalid URLs", () => {
    expect(() =>
      validateClientEnv({
        ...validEnv,
        VITE_BASE_RPC_URL: "not-a-url",
      }),
    ).toThrow();
  });
});
