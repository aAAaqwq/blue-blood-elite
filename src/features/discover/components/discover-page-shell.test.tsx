import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-router", () => ({
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
  useLocation: () => ({ pathname: "/discover" }),
}));

vi.mock("@/components/layout/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/features/connections/components/connect-button", () => ({
  ConnectButton: () => <button>Connect</button>,
}));

import { DiscoverPageShell } from "@/features/discover/components/discover-page-shell";

describe("DiscoverPageShell", () => {
  it("renders an empty state", () => {
    render(<DiscoverPageShell users={[]} connections={{}} />);
    expect(screen.getByText("探索精英社区")).toBeInTheDocument();
  });

  it("renders verified users", () => {
    render(
      <DiscoverPageShell
        users={[
          {
            id: "user-1",
            nickname: "张云飞",
            school: "清华大学",
            company: "独立开发者",
            direction: "AI模型",
            avatarUrl: null,
            isVerified: true,
            skills: ["Python", "RAG"],
          },
        ]}
        connections={{}}
      />,
    );

    expect(screen.getAllByText("张云飞").length).toBeGreaterThanOrEqual(1);
  });
});
