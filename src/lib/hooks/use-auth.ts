import { useState, useEffect, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { createBrowserSupabaseClientSafely, getBrowserSupabaseClient } from "../supabase/client";
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithPhone,
  signOut,
  getCurrentUser,
  onAuthStateChange,
  type AuthCredentials,
  type PhoneAuthCredentials,
} from "../supabase/auth";

interface UseAuthReturn {
  user: User | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDevMode: boolean;
  error: string | null;
  signUp: (credentials: AuthCredentials) => Promise<{ success: boolean; error?: string }>;
  signIn: (credentials: AuthCredentials) => Promise<{ success: boolean; error?: string }>;
  signInWithPhone: (credentials: PhoneAuthCredentials) => Promise<{ success: boolean; requiresOtp?: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = getBrowserSupabaseClient();

  // 检查是否有开发模式配置
  const devUserId = import.meta.env.VITE_DEV_ACTOR_USER_ID?.trim();
  const isDevMode = !!devUserId && !supabase;

  // 刷新当前用户
  const refreshUser = useCallback(async () => {
    if (!supabase) return;

    setIsLoading(true);
    const { user: currentUser, error: userError } = await getCurrentUser(supabase);

    if (userError) {
      setError(userError);
    } else {
      setUser(currentUser);
      setError(null);
    }

    setIsLoading(false);
  }, [supabase]);

  // 初始化时获取当前用户
  useEffect(() => {
    // 开发模式：使用环境变量中的用户ID
    if (isDevMode && devUserId) {
      setUser({ id: devUserId } as User);
      setIsLoading(false);
      return;
    }

    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // 获取当前用户
    refreshUser();

    // 监听认证状态变化
    const { unsubscribe } = onAuthStateChange(supabase, (event, newUser) => {
      setUser(newUser);

      if (event === "SIGNED_IN") {
        setError(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [supabase, isDevMode, devUserId, refreshUser]);

  // 邮箱注册
  const handleSignUp = useCallback(
    async (credentials: AuthCredentials): Promise<{ success: boolean; error?: string }> => {
      if (!supabase) {
        return { success: false, error: "Supabase 客户端未初始化" };
      }

      setIsLoading(true);
      setError(null);

      const { user: newUser, error: signUpError } = await signUpWithEmail(supabase, credentials);

      setIsLoading(false);

      if (signUpError) {
        setError(signUpError);
        return { success: false, error: signUpError };
      }

      setUser(newUser);
      return { success: true };
    },
    [supabase],
  );

  // 邮箱登录
  const handleSignIn = useCallback(
    async (credentials: AuthCredentials): Promise<{ success: boolean; error?: string }> => {
      if (!supabase) {
        return { success: false, error: "Supabase 客户端未初始化" };
      }

      setIsLoading(true);
      setError(null);

      const { user: loggedInUser, error: signInError } = await signInWithEmail(supabase, credentials);

      setIsLoading(false);

      if (signInError) {
        setError(signInError);
        return { success: false, error: signInError };
      }

      setUser(loggedInUser);
      return { success: true };
    },
    [supabase],
  );

  // 手机号登录
  const handleSignInWithPhone = useCallback(
    async (credentials: PhoneAuthCredentials): Promise<{ success: boolean; requiresOtp?: boolean; error?: string }> => {
      if (!supabase) {
        return { success: false, error: "Supabase 客户端未初始化" };
      }

      setIsLoading(true);
      setError(null);

      const { user: loggedInUser, error: signInError, requiresOtp } = await signInWithPhone(
        supabase,
        credentials,
      );

      setIsLoading(false);

      if (signInError) {
        setError(signInError);
        return { success: false, error: signInError };
      }

      if (loggedInUser) {
        setUser(loggedInUser);
      }

      return { success: true, requiresOtp };
    },
    [supabase],
  );

  // 登出
  const handleLogout = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) {
      return { success: false, error: "Supabase 客户端未初始化" };
    }

    setIsLoading(true);
    setError(null);

    const { success, error: logoutError } = await signOut(supabase);

    setIsLoading(false);

    if (!success) {
      setError(logoutError ?? null);
      return { success: false, error: logoutError };
    }

    setUser(null);
    return { success: true };
  }, [supabase]);

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    userId: user?.id ?? devUserId ?? null,
    isAuthenticated: !!user || isDevMode,
    isLoading,
    isDevMode,
    error,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signInWithPhone: handleSignInWithPhone,
    logout: handleLogout,
    refreshUser,
    clearError,
  };
}
