import { afterEach, describe, expect, it, vi } from "vitest";
import { recordSecurityEvent } from "@/lib/security-audit";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("security audit events", () => {
  it("writes a bounded structured event without sensitive request data", () => {
    vi.stubEnv("NODE_ENV", "production");
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);

    recordSecurityEvent({
      action: "login",
      outcome: "success",
      actorId: "user-1",
    });

    expect(info).toHaveBeenCalledOnce();
    const output = String(info.mock.calls[0][0]);
    expect(JSON.parse(output)).toMatchObject({
      event: "security_audit",
      action: "login",
      outcome: "success",
      actorId: "user-1",
    });
    expect(output).not.toContain("password");
    expect(output).not.toContain("email");
    expect(output).not.toContain("token");
  });

  it("does not pollute test output", () => {
    vi.stubEnv("NODE_ENV", "test");
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    recordSecurityEvent({ action: "login", outcome: "rejected" });
    expect(info).not.toHaveBeenCalled();
  });

  it("never changes an application outcome if logging fails", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.spyOn(console, "info").mockImplementation(() => {
      throw new Error("logging unavailable");
    });
    expect(() =>
      recordSecurityEvent({ action: "login", outcome: "success" }),
    ).not.toThrow();
  });
});
