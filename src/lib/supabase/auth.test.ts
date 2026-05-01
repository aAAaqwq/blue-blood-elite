import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithPhone,
  signOut,
  getCurrentUser,
  getCurrentSession,
  onAuthStateChange,
  resetPassword,
  updatePassword,
  updateEmail,
  signInWithOAuth,
  type AuthCredentials,
  type PhoneAuthCredentials,
} from "./auth";

describe("auth", () => {
  const mockSupabase = {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOtp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ error: null })),
    })),
  } as unknown as SupabaseClient;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("signUpWithEmail", () => {
    it("should sign up user with email and password", async () => {
      const mockUser = { id: "user-123", email: "test@example.com" } as User;
      mockSupabase.auth.signUp = vi.fn().mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const credentials: AuthCredentials = {
        email: "test@example.com",
        password: "password123",
      };

      const result = await signUpWithEmail(mockSupabase, credentials);

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            nickname: "test",
          },
        },
      });
      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it("should create user profile after successful sign up", async () => {
      const mockUser = { id: "user-123", email: "test@example.com" } as User;
      mockSupabase.auth.signUp = vi.fn().mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const credentials: AuthCredentials = {
        email: "test@example.com",
        password: "password123",
        nickname: "Test User",
      };

      await signUpWithEmail(mockSupabase, credentials);

      expect(mockSupabase.from).toHaveBeenCalledWith("users");
    });

    it("should return error when sign up fails", async () => {
      mockSupabase.auth.signUp = vi.fn().mockResolvedValue({
        data: { user: null },
        error: { message: "Email already registered" },
      });

      const credentials: AuthCredentials = {
        email: "existing@example.com",
        password: "password123",
      };

      const result = await signUpWithEmail(mockSupabase, credentials);

      expect(result.user).toBeNull();
      expect(result.error).toBe("Email already registered");
    });

    it("should validate email format", async () => {
      const credentials: AuthCredentials = {
        email: "invalid-email",
        password: "password123",
      };

      const result = await signUpWithEmail(mockSupabase, credentials);

      expect(result.error).toBe("请输入有效的邮箱地址");
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
    });

    it("should validate password length", async () => {
      const credentials: AuthCredentials = {
        email: "test@example.com",
        password: "12345",
      };

      const result = await signUpWithEmail(mockSupabase, credentials);

      expect(result.error).toBe("密码至少需要6个字符");
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
    });
  });

  describe("signInWithEmail", () => {
    it("should sign in user with email and password", async () => {
      const mockUser = { id: "user-123", email: "test@example.com" } as User;
      mockSupabase.auth.signInWithPassword = vi.fn().mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const credentials: AuthCredentials = {
        email: "test@example.com",
        password: "password123",
      };

      const result = await signInWithEmail(mockSupabase, credentials);

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: credentials.email,
        password: credentials.password,
      });
      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it("should return error when credentials are invalid", async () => {
      mockSupabase.auth.signInWithPassword = vi.fn().mockResolvedValue({
        data: { user: null },
        error: { message: "Invalid login credentials" },
      });

      const credentials: AuthCredentials = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const result = await signInWithEmail(mockSupabase, credentials);

      expect(result.user).toBeNull();
      expect(result.error).toBe("Invalid login credentials");
    });

    it("should validate required fields", async () => {
      const credentials: AuthCredentials = {
        email: "",
        password: "",
      };

      const result = await signInWithEmail(mockSupabase, credentials);

      expect(result.error).toBe("请输入邮箱和密码");
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });
  });

  describe("signInWithPhone", () => {
    it("should send OTP to phone number", async () => {
      mockSupabase.auth.signInWithOtp = vi.fn().mockResolvedValue({
        data: {},
        error: null,
      });

      const credentials: PhoneAuthCredentials = {
        phone: "+8613800138000",
      };

      const result = await signInWithPhone(mockSupabase, credentials);

      expect(mockSupabase.auth.signInWithOtp).toHaveBeenCalledWith({
        phone: credentials.phone,
      });
      expect(result.error).toBeNull();
      expect(result.requiresOtp).toBe(true);
    });

    it("should verify OTP code", async () => {
      const mockUser = { id: "user-123", phone: "+8613800138000" } as User;
      mockSupabase.auth.verifyOtp = vi.fn().mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: { id: "user-123" } }),
          })),
        })),
        insert: vi.fn().mockResolvedValue({ error: null }),
      }));

      const credentials: PhoneAuthCredentials = {
        phone: "+8613800138000",
        otp: "123456",
      };

      const result = await signInWithPhone(mockSupabase, credentials);

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it("should validate phone format", async () => {
      const credentials: PhoneAuthCredentials = {
        phone: "invalid-phone",
      };

      const result = await signInWithPhone(mockSupabase, credentials);

      expect(result.error).toBe("请输入有效的手机号（国际格式，如 +8613800138000）");
    });
  });

  describe("signOut", () => {
    it("should sign out user", async () => {
      mockSupabase.auth.signOut = vi.fn().mockResolvedValue({ error: null });

      const result = await signOut(mockSupabase);

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it("should handle sign out error", async () => {
      mockSupabase.auth.signOut = vi.fn().mockResolvedValue({
        error: { message: "Sign out failed" },
      });

      const result = await signOut(mockSupabase);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Sign out failed");
    });
  });

  describe("getCurrentUser", () => {
    it("should return current user when authenticated", async () => {
      const mockUser = { id: "user-123", email: "test@example.com" } as User;
      mockSupabase.auth.getUser = vi.fn().mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await getCurrentUser(mockSupabase);

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it("should return null when not authenticated", async () => {
      mockSupabase.auth.getUser = vi.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await getCurrentUser(mockSupabase);

      expect(result.user).toBeNull();
      expect(result.error).toBeNull();
    });
  });

  describe("onAuthStateChange", () => {
    it("should subscribe to auth state changes", () => {
      const callback = vi.fn();
      const unsubscribe = vi.fn();

      mockSupabase.auth.onAuthStateChange = vi.fn((handler) => {
        handler("SIGNED_IN", { user: { id: "user-123" } as User });
        return { data: { subscription: { unsubscribe } } };
      });

      onAuthStateChange(mockSupabase, callback);

      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith("SIGNED_IN", { id: "user-123" });
    });

    it("should return unsubscribe function", () => {
      const callback = vi.fn();
      const unsubscribe = vi.fn();

      mockSupabase.auth.onAuthStateChange = vi.fn(() => ({
        data: { subscription: { unsubscribe } },
      }));

      const result = onAuthStateChange(mockSupabase, callback);

      result.unsubscribe();
      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  describe("getCurrentSession", () => {
    it("should return session when available", async () => {
      const mockSession = { access_token: "token-123", user: { id: "user-123" } };
      (mockSupabase.auth as Record<string, unknown>).getSession = vi.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await getCurrentSession(mockSupabase);

      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it("should return error when session fetch fails", async () => {
      (mockSupabase.auth as Record<string, unknown>).getSession = vi.fn().mockResolvedValue({
        data: { session: null },
        error: { message: "Session expired" },
      });

      const result = await getCurrentSession(mockSupabase);

      expect(result.session).toBeNull();
      expect(result.error).toBe("Session expired");
    });
  });

  describe("resetPassword", () => {
    it("should send reset password email", async () => {
      (mockSupabase.auth as Record<string, unknown>).resetPasswordForEmail = vi.fn().mockResolvedValue({
        error: null,
      });

      const result = await resetPassword(mockSupabase, "test@example.com");

      expect(result.success).toBe(true);
    });

    it("should validate email format", async () => {
      const result = await resetPassword(mockSupabase, "invalid-email");

      expect(result.success).toBe(false);
      expect(result.error).toBe("请输入有效的邮箱地址");
    });

    it("should return error when reset fails", async () => {
      (mockSupabase.auth as Record<string, unknown>).resetPasswordForEmail = vi.fn().mockResolvedValue({
        error: { message: "Rate limit exceeded" },
      });

      const result = await resetPassword(mockSupabase, "test@example.com");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Rate limit exceeded");
    });
  });

  describe("updatePassword", () => {
    it("should update password successfully", async () => {
      (mockSupabase.auth as Record<string, unknown>).updateUser = vi.fn().mockResolvedValue({
        error: null,
      });

      const result = await updatePassword(mockSupabase, "newpassword123");

      expect(result.success).toBe(true);
    });

    it("should validate password length", async () => {
      const result = await updatePassword(mockSupabase, "12345");

      expect(result.success).toBe(false);
      expect(result.error).toBe("密码至少需要6个字符");
    });

    it("should return error when update fails", async () => {
      (mockSupabase.auth as Record<string, unknown>).updateUser = vi.fn().mockResolvedValue({
        error: { message: "Update failed" },
      });

      const result = await updatePassword(mockSupabase, "newpassword123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Update failed");
    });
  });

  describe("updateEmail", () => {
    it("should update email successfully", async () => {
      (mockSupabase.auth as Record<string, unknown>).updateUser = vi.fn().mockResolvedValue({
        error: null,
      });

      const result = await updateEmail(mockSupabase, "new@example.com");

      expect(result.success).toBe(true);
    });

    it("should validate email format", async () => {
      const result = await updateEmail(mockSupabase, "bad-email");

      expect(result.success).toBe(false);
      expect(result.error).toBe("请输入有效的邮箱地址");
    });

    it("should return error when update fails", async () => {
      (mockSupabase.auth as Record<string, unknown>).updateUser = vi.fn().mockResolvedValue({
        error: { message: "Email already in use" },
      });

      const result = await updateEmail(mockSupabase, "new@example.com");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Email already in use");
    });
  });

  describe("signInWithOAuth", () => {
    it("should return OAuth URL on success", async () => {
      (mockSupabase.auth as Record<string, unknown>).signInWithOAuth = vi.fn().mockResolvedValue({
        data: { url: "https://accounts.google.com/auth?..." },
        error: null,
      });

      const result = await signInWithOAuth(mockSupabase, "google");

      expect(result.url).toBe("https://accounts.google.com/auth?...");
      expect(result.error).toBeUndefined();
    });

    it("should return error when OAuth fails", async () => {
      (mockSupabase.auth as Record<string, unknown>).signInWithOAuth = vi.fn().mockResolvedValue({
        data: { url: null },
        error: { message: "OAuth provider error" },
      });

      const result = await signInWithOAuth(mockSupabase, "github");

      expect(result.url).toBeNull();
      expect(result.error).toBe("OAuth provider error");
    });
  });

  describe("signUpWithEmail edge cases", () => {
    it("should use email prefix as nickname when not provided", async () => {
      const mockUser = { id: "user-123", email: "john@example.com" } as User;
      mockSupabase.auth.signUp = vi.fn().mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      (mockSupabase as unknown as Record<string, unknown>).from = vi.fn(() => ({
        insert: vi.fn().mockResolvedValue({ error: null }),
      }));

      const result = await signUpWithEmail(mockSupabase, {
        email: "john@example.com",
        password: "password123",
      });

      expect(result.user).toEqual(mockUser);
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: { data: { nickname: "john" } },
        })
      );
    });

    it("should handle profile creation failure", async () => {
      const mockUser = { id: "user-123", email: "test@example.com" } as User;
      mockSupabase.auth.signUp = vi.fn().mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      (mockSupabase as unknown as Record<string, unknown>).from = vi.fn(() => ({
        insert: vi.fn().mockResolvedValue({ error: { message: "Insert failed" } }),
      }));

      const result = await signUpWithEmail(mockSupabase, {
        email: "test@example.com",
        password: "password123",
      });

      expect(result.user).toEqual(mockUser);
      expect(result.error).toContain("资料初始化失败");
    });
  });

  describe("signInWithPhone edge cases", () => {
    it("should create profile for new user after OTP verification", async () => {
      const mockUser = { id: "user-new", phone: "+8613800138000" } as User;
      mockSupabase.auth.verifyOtp = vi.fn().mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      let fromCallCount = 0;
      (mockSupabase as unknown as Record<string, unknown>).from = vi.fn((table: string) => {
        fromCallCount++;
        if (fromCallCount === 1) {
          // select to check existing user
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: null }),
              })),
            })),
          };
        }
        // insert new user
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      });

      const result = await signInWithPhone(mockSupabase, {
        phone: "+8613800138000",
        otp: "123456",
      });

      expect(result.user).toEqual(mockUser);
    });

    it("should return error when OTP verification fails", async () => {
      mockSupabase.auth.verifyOtp = vi.fn().mockResolvedValue({
        data: { user: null },
        error: { message: "Invalid OTP" },
      });

      const result = await signInWithPhone(mockSupabase, {
        phone: "+8613800138000",
        otp: "wrong",
      });

      expect(result.user).toBeNull();
      expect(result.error).toBe("Invalid OTP");
    });

    it("should return error when OTP send fails", async () => {
      mockSupabase.auth.signInWithOtp = vi.fn().mockResolvedValue({
        error: { message: "SMS service unavailable" },
      });

      const result = await signInWithPhone(mockSupabase, {
        phone: "+8613800138000",
      });

      expect(result.error).toBe("SMS service unavailable");
    });
  });

  describe("getCurrentUser edge cases", () => {
    it("should return error when getUser fails", async () => {
      mockSupabase.auth.getUser = vi.fn().mockResolvedValue({
        data: { user: null },
        error: { message: "Token expired" },
      });

      const result = await getCurrentUser(mockSupabase);

      expect(result.user).toBeNull();
      expect(result.error).toBe("Token expired");
    });
  });
});
