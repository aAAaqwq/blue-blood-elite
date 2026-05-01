import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

describe("AppProviders", () => {
  it("renders children with QueryClientProvider", async () => {
    vi.resetModules();

    const { AppProviders } = await import("@/components/providers/app-providers");

    render(
      <AppProviders>
        <div>content</div>
      </AppProviders>,
    );

    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("provides React Query context to children", async () => {
    vi.resetModules();

    const { AppProviders } = await import("@/components/providers/app-providers");

    render(
      <AppProviders>
        <div data-testid="child">test content</div>
      </AppProviders>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("test content")).toBeInTheDocument();
  });
});
