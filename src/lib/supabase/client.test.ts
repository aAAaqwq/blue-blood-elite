import { beforeEach, describe, expect, it, vi } from "vitest";

const createClient = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient,
}));

describe("createBrowserSupabaseClientSafely", () => {
  beforeEach(() => {
    vi.resetModules();
    createClient.mockReset();
    vi.unstubAllEnvs();
  });

  it("returns null when client env is missing", async () => {
    const { createBrowserSupabaseClientSafely } = await import("@/lib/supabase/client");

    expect(createBrowserSupabaseClientSafely()).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });

  it("creates a browser supabase client when env is valid", async () => {
    vi.stubEnv("VITE_APP_URL", "http://localhost:3000");
    vi.stubEnv("VITE_PRIVY_APP_ID", "privy-app-id");
    vi.stubEnv("VITE_PRIVY_CLIENT_ID", "privy-client-id");
    vi.stubEnv("VITE_BASE_CHAIN_ID", "84532");
    vi.stubEnv("VITE_BASE_RPC_URL", "https://sepolia.base.org");
    vi.stubEnv("VITE_USDC_TOKEN_ADDRESS", "0x1234567890abcdef1234567890abcdef12345678");
    vi.stubEnv("VITE_PLATFORM_WALLET_ADDRESS", "0xabcdef1234567890abcdef1234567890abcdef12");
    vi.stubEnv("VITE_WALLETCONNECT_PROJECT_ID", "wallet-connect-project");
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "anon-key");
    createClient.mockReturnValue({ ok: true });

    const { createBrowserSupabaseClientSafely } = await import("@/lib/supabase/client");

    expect(createBrowserSupabaseClientSafely()).toEqual({ ok: true });
    expect(createClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
    );
  });
});
