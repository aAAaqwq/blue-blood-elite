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

const mockUpdate = vi.fn(() => ({ error: null }));
vi.mock("@/lib/supabase/client", () => ({
  createBrowserSupabaseClient: () => ({
    from: vi.fn(() => ({
      update: (...args: unknown[]) => ({
        eq: vi.fn(() => mockUpdate(...args)),
      }),
    })),
  }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("ProfileEditForm", () => {
  beforeEach(() => {
    mockUpdate.mockReturnValue({ error: null });
  });

  it("renders a submit form wired for profile fields", async () => {
    const { ProfileEditForm } = await import("@/features/profile/components/profile-edit-form");

    render(<ProfileEditForm />, { wrapper });

    expect(screen.getByText("昵称")).toBeInTheDocument();
    expect(screen.getByText("个人简介")).toBeInTheDocument();
    expect(screen.getByText("学校")).toBeInTheDocument();
    expect(screen.getByText("公司 / 团队")).toBeInTheDocument();
    expect(screen.getByText("技术方向")).toBeInTheDocument();
    expect(screen.getByText("技能标签")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存资料" })).toBeInTheDocument();
  });

  it("pre-populates fields from initialData", async () => {
    const { ProfileEditForm } = await import("@/features/profile/components/profile-edit-form");

    render(
      <ProfileEditForm
        initialData={{
          nickname: "张云飞",
          bio: "AI工程师",
          school: "清华大学",
          company: "独立开发者",
          direction: "AI模型",
          githubUrl: "https://github.com/test",
          linkedinUrl: "https://linkedin.com/in/test",
          skills: ["Python", "RAG"],
        }}
      />,
      { wrapper },
    );

    expect(screen.getByDisplayValue("张云飞")).toBeInTheDocument();
    expect(screen.getByDisplayValue("AI工程师")).toBeInTheDocument();
    expect(screen.getByDisplayValue("清华大学")).toBeInTheDocument();
    expect(screen.getByDisplayValue("独立开发者")).toBeInTheDocument();
    expect(screen.getByDisplayValue("AI模型")).toBeInTheDocument();
    expect(screen.getByDisplayValue("https://github.com/test")).toBeInTheDocument();
    expect(screen.getByDisplayValue("https://linkedin.com/in/test")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Python, RAG")).toBeInTheDocument();
  });

  it("shows success message after save", async () => {
    const { ProfileEditForm } = await import("@/features/profile/components/profile-edit-form");

    render(<ProfileEditForm />, { wrapper });

    fireEvent.click(screen.getByRole("button", { name: "保存资料" }));

    await waitFor(() => {
      expect(screen.getByText("资料已保存")).toBeInTheDocument();
    });
  });

  it("shows error message on failure", async () => {
    mockUpdate.mockReturnValue({ error: { message: "保存失败：网络错误" } });

    const { ProfileEditForm } = await import("@/features/profile/components/profile-edit-form");

    render(<ProfileEditForm />, { wrapper });

    fireEvent.click(screen.getByRole("button", { name: "保存资料" }));

    await waitFor(() => {
      expect(screen.getByText("保存失败：网络错误")).toBeInTheDocument();
    });
  });

  it("updates field values on input change", async () => {
    const { ProfileEditForm } = await import("@/features/profile/components/profile-edit-form");

    render(<ProfileEditForm />, { wrapper });

    const nicknameInput = screen.getByPlaceholderText("张云飞");
    fireEvent.change(nicknameInput, { target: { value: "新昵称" } });

    expect(screen.getByDisplayValue("新昵称")).toBeInTheDocument();
  });

  it("shows pending state during submission", async () => {
    let resolveMutation!: () => void;
    mockUpdate.mockReturnValue(new Promise<void>((resolve) => { resolveMutation = resolve; }));

    const { ProfileEditForm } = await import("@/features/profile/components/profile-edit-form");

    render(<ProfileEditForm />, { wrapper });

    fireEvent.click(screen.getByRole("button", { name: "保存资料" }));

    await waitFor(() => {
      expect(screen.getByText("保存中...")).toBeInTheDocument();
    });

    resolveMutation();

    await waitFor(() => {
      expect(screen.getByText("保存资料")).toBeInTheDocument();
    });
  });
});
