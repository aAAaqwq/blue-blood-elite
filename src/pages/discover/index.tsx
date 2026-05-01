import { useQuery } from "@tanstack/react-query";
import { DiscoverPageShell } from "@/features/discover/components/discover-page-shell";
import { createBrowserSupabaseClientSafely } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/use-auth";
import { listDiscoverUsers } from "@/repositories/discover.repository";
import { getUserConnections } from "@/repositories/connections.repository";

export default function DiscoverPage() {
  const { userId } = useAuth();
  const supabase = createBrowserSupabaseClientSafely();

  const { data: users = [] } = useQuery({
    queryKey: ["discover-users"],
    queryFn: () => {
      if (!supabase) return [];
      return listDiscoverUsers(supabase);
    },
    enabled: !!supabase,
  });

  const { data: connections = {} } = useQuery({
    queryKey: ["connections", userId],
    queryFn: async () => {
      if (!supabase || !userId) return {};
      const userConnections = await getUserConnections(supabase, userId);
      const map: Record<string, { status: "pending" | "accepted" | "rejected"; isIncoming: boolean }> = {};
      for (const conn of userConnections) {
        const otherUserId = conn.fromUserId === userId ? conn.toUserId : conn.fromUserId;
        map[otherUserId] = { status: conn.status, isIncoming: conn.toUserId === userId };
      }
      return map;
    },
    enabled: !!supabase && !!userId,
  });

  return <DiscoverPageShell users={users} connections={connections} currentUserId={userId ?? undefined} />;
}
