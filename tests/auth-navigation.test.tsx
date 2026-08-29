import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock("@/lib/auth", () => ({ getSession: mocks.getSession }));

import { Header } from "@/components/Header";

beforeEach(() => vi.clearAllMocks());

describe("authenticated navigation", () => {
  it("shows login navigation to logged-out visitors", async () => {
    mocks.getSession.mockResolvedValue(null);

    const html = renderToStaticMarkup(await Header());

    expect(html).toContain('href="/login"');
    expect(html).toContain("Log in");
    expect(html).not.toContain("Log out");
  });

  it("shows dashboard and logout navigation to logged-in visitors", async () => {
    mocks.getSession.mockResolvedValue({
      userId: "user-1",
      email: "user@example.com",
    });

    const html = renderToStaticMarkup(await Header());

    expect(html).toContain('href="/dashboard"');
    expect(html).toContain("Dashboard");
    expect(html).toContain('action="/api/auth/logout"');
    expect(html).toContain('method="post"');
    expect(html).toContain("Log out");
    expect(html).not.toContain('href="/login"');
  });
});
