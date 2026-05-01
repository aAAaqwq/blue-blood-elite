import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { AuthCard } from "@/components/auth/auth-card";
import { ProfileEditForm } from "@/features/profile/components/profile-edit-form";
import { useAuth } from "@/lib/hooks/use-auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getUserProfile } from "@/repositories/users.repository";

export default function ProfileEditPage() {
  const { userId, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  const { data: initialData } = useQuery({
    queryKey: ["profile-edit", userId],
    queryFn: async () => {
      const supabase = createBrowserSupabaseClient();
      const profile = await getUserProfile(supabase, userId!);
      return profile ?? undefined;
    },
    enabled: !!userId,
  });

  return (
    <AppShell>
      <AuthCard
        title="完善你的精英资料"
        description="编辑你的个人资料和技能信息"
      >
        <ProfileEditForm initialData={initialData} />
      </AuthCard>
    </AppShell>
  );
}
