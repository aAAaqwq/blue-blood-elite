import { useEffect } from "react";
import { useNavigate } from "react-router";
import { AppShell } from "@/components/layout/app-shell";
import { AuthCard } from "@/components/auth/auth-card";
import { CreateBountyForm } from "@/features/tasks/components/create-bounty-form";
import { useAuth } from "@/lib/hooks/use-auth";
import { PlusCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router";

export default function CreateBountyPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 pt-2">
        <Link to="/tasks" className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-600 bg-blue-800 text-text-secondary transition-all hover:border-blue-500 hover:text-text-primary">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary">发布悬赏任务</h1>
          <p className="text-sm text-text-secondary">创建悬赏，吸引顶尖人才</p>
        </div>
      </div>

      <AuthCard
        title="任务信息"
        description="填写详细的任务信息，让认领者更好地理解您的需求。"
      >
        <CreateBountyForm />
      </AuthCard>
    </AppShell>
  );
}
