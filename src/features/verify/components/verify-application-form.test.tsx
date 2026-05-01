import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return { ...actual };
});

vi.mock("@/lib/hooks/use-auth", () => ({
  useAuth: () => ({ userId: "test-user-id" }),
}));

const mockInsert = vi.fn(() => ({ error: null }));
vi.mock("@/lib/supabase/client", () => ({
  createBrowserSupabaseClient: () => ({
    from: vi.fn(() => ({
      insert: (...args: unknown[]) => mockInsert(...args),
    })),
  }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("VerifyApplicationForm", () => {
  beforeEach(() => {
    mockInsert.mockReturnValue({ error: null });
  });

  it("renders a submit form wired for verification fields", async () => {
    const { VerifyApplicationForm } = await import("@/features/verify/components/verify-application-form");

    render(<VerifyApplicationForm />, { wrapper });

    expect(screen.getByText("认证类型")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("https://github.com/your-repo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "提交认证申请" })).toBeInTheDocument();
  });

  it("disables submit when evidence URL is empty", async () => {
    const { VerifyApplicationForm } = await import("@/features/verify/components/verify-application-form");

    render(<VerifyApplicationForm />, { wrapper });

    const button = screen.getByRole("button", { name: "提交认证申请" });
    expect(button).toBeDisabled();
  });

  it("shows all verification type options", async () => {
    const { VerifyApplicationForm } = await import("@/features/verify/components/verify-application-form");

    render(<VerifyApplicationForm />, { wrapper });

    expect(screen.getByText("GitHub 500+ Stars")).toBeInTheDocument();
    expect(screen.getByText("大厂 AI 方向 3 年以上经历")).toBeInTheDocument();
    expect(screen.getByText("完成平台任务并获得高评分")).toBeInTheDocument();
  });

  it("shows success message after submission", async () => {
    const { VerifyApplicationForm } = await import("@/features/verify/components/verify-application-form");

    render(<VerifyApplicationForm />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText("https://github.com/your-repo"), {
      target: { value: "https://github.com/test/repo" },
    });
    fireEvent.click(screen.getByRole("button", { name: "提交认证申请" }));

    await waitFor(() => {
      expect(screen.getByText(/认证申请已提交/)).toBeInTheDocument();
    });
  });

  it("shows error message on failure", async () => {
    mockInsert.mockReturnValue({ error: { message: "已有待审核申请" } });

    const { VerifyApplicationForm } = await import("@/features/verify/components/verify-application-form");

    render(<VerifyApplicationForm />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText("https://github.com/your-repo"), {
      target: { value: "https://github.com/test/repo" },
    });
    fireEvent.click(screen.getByRole("button", { name: "提交认证申请" }));

    await waitFor(() => {
      expect(screen.getByText("已有待审核申请")).toBeInTheDocument();
    });
  });
});
