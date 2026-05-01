import { Link } from "react-router";
import { AlertTriangle, Home } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

export default function NotFoundPage() {
  return (
    <AppShell>
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
            <AlertTriangle className="h-8 w-8 text-yellow-400" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white">404</h1>
          <p className="mb-6 text-gray-400">页面不存在或已被移除</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Home className="h-4 w-4" />
            返回首页
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
