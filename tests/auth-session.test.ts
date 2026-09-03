import { describe, expect, it } from "vitest";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import { POST as logout } from "@/app/api/auth/logout/route";
import { verifySessionToken } from "@/lib/auth";
import { middleware } from "@/middleware";

describe("session handling", () => {
  it("treats an invalid session as logged out", async () => {
    await expect(verifySessionToken("not-a-valid-session")).resolves.toBeNull();
  });

  it("clears the session cookie and redirects logout to a public page", async () => {
    const response = await logout(
      new NextRequest("http://localhost/api/auth/logout", { method: "POST" }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://localhost/");
    expect(response.headers.get("set-cookie")).toMatch(/rv_session=;/);
    expect(response.headers.get("set-cookie")).toMatch(/Max-Age=0/);
    expect(response.headers.get("set-cookie")).toMatch(/HttpOnly/);
    expect(response.headers.get("set-cookie")).toMatch(/SameSite=lax/i);
  });

  it.each([undefined, "not-a-valid-session"])(
    "redirects a protected route when its session is %s",
    async (token) => {
      const headers = token ? { cookie: `rv_session=${token}` } : undefined;
      const response = await middleware(
        new NextRequest("http://localhost/dashboard", { headers }),
      );

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "http://localhost/login?next=%2Fdashboard",
      );
    },
  );

  it("allows a protected route with a valid session", async () => {
    const token = await new SignJWT({
      email: "user@example.com",
      sessionVersion: 0,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("user-1")
      .setExpirationTime("5m")
      .sign(
        new TextEncoder().encode(
          process.env.AUTH_SECRET || "development-secret-change-this-now-32",
        ),
      );
    const response = await middleware(
      new NextRequest("http://localhost/dashboard", {
        headers: { cookie: `rv_session=${token}` },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
