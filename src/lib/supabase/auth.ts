import type { SupabaseClient, User } from "@supabase/supabase-js";

export interface AuthCredentials {
  email: string;
  password: string;
  nickname?: string;
}

export interface PhoneAuthCredentials {
  phone: string;
  otp?: string;
}

export interface AuthResult {
  user: User | null;
  error: string | null;
  requiresOtp?: boolean;
}

export interface SignOutResult {
  success: boolean;
  error?: string;
}

/**
 * 验证邮箱格式
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号格式（支持国际格式）
 */
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

/**
 * 邮箱注册
 */
export async function signUpWithEmail(
  supabase: SupabaseClient,
  credentials: AuthCredentials,
): Promise<AuthResult> {
  const { email, password, nickname } = credentials;

  // 验证输入
  if (!isValidEmail(email)) {
    return { user: null, error: "请输入有效的邮箱地址" };
  }

  if (password.length < 6) {
    return { user: null, error: "密码至少需要6个字符" };
  }

  const displayName = nickname?.trim() || email.split("@")[0];

  // 调用 Supabase Auth 注册
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname: displayName,
      },
    },
  });

  if (error) {
    return { user: null, error: error.message };
  }

  // 创建用户资料
  if (data.user) {
    const { error: profileError } = await supabase.from("users").insert({
      id: data.user.id,
      email: data.user.email,
      nickname: displayName,
    });

    if (profileError) {
      return { user: data.user, error: `用户创建成功，但资料初始化失败: ${profileError.message}` };
    }
  }

  return { user: data.user, error: null };
}

/**
 * 邮箱登录
 */
export async function signInWithEmail(
  supabase: SupabaseClient,
  credentials: AuthCredentials,
): Promise<AuthResult> {
  const { email, password } = credentials;

  if (!email.trim() || !password.trim()) {
    return { user: null, error: "请输入邮箱和密码" };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
}

/**
 * 手机号登录/注册（OTP）
 */
export async function signInWithPhone(
  supabase: SupabaseClient,
  credentials: PhoneAuthCredentials,
): Promise<AuthResult> {
  const { phone, otp } = credentials;

  if (!isValidPhone(phone)) {
    return { user: null, error: "请输入有效的手机号（国际格式，如 +8613800138000）" };
  }

  // 如果提供了 OTP，验证它
  if (otp) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });

    if (error) {
      return { user: null, error: error.message };
    }

    // 如果是新用户，创建用户资料
    if (data.user) {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!existingUser) {
        await supabase.from("users").insert({
          id: data.user.id,
          phone: data.user.phone,
          nickname: `用户${phone.slice(-4)}`,
        });
      }
    }

    return { user: data.user, error: null };
  }

  // 发送 OTP
  const { error } = await supabase.auth.signInWithOtp({
    phone,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  return { user: null, error: null, requiresOtp: true };
}

/**
 * 登出
 */
export async function signOut(supabase: SupabaseClient): Promise<SignOutResult> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * 获取当前用户
 */
export async function getCurrentUser(
  supabase: SupabaseClient,
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
}

/**
 * 获取当前会话
 */
export async function getCurrentSession(supabase: SupabaseClient) {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return { session: null, error: error.message };
  }

  return { session: data.session, error: null };
}

/**
 * 监听认证状态变化
 */
export function onAuthStateChange(
  supabase: SupabaseClient,
  callback: (event: string, user: User | null) => void,
): { unsubscribe: () => void } {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session?.user ?? null);
  });

  return {
    unsubscribe: () => data.subscription.unsubscribe(),
  };
}

/**
 * 重置密码（发送重置邮件）
 */
export async function resetPassword(
  supabase: SupabaseClient,
  email: string,
): Promise<{ success: boolean; error?: string }> {
  if (!isValidEmail(email)) {
    return { success: false, error: "请输入有效的邮箱地址" };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * 更新密码
 */
export async function updatePassword(
  supabase: SupabaseClient,
  newPassword: string,
): Promise<{ success: boolean; error?: string }> {
  if (newPassword.length < 6) {
    return { success: false, error: "密码至少需要6个字符" };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * 更新用户邮箱
 */
export async function updateEmail(
  supabase: SupabaseClient,
  newEmail: string,
): Promise<{ success: boolean; error?: string }> {
  if (!isValidEmail(newEmail)) {
    return { success: false, error: "请输入有效的邮箱地址" };
  }

  const { error } = await supabase.auth.updateUser({
    email: newEmail,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * 第三方 OAuth 登录
 */
export async function signInWithOAuth(
  supabase: SupabaseClient,
  provider: "google" | "github" | "twitter",
): Promise<{ url: string | null; error?: string }> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    return { url: null, error: error.message };
  }

  return { url: data.url };
}
