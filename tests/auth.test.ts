import { describe, it, expect } from "vitest";
import { credentialsSchema } from "@/lib/validation";
describe("authentication protection", () => {
  it("requires strong-enough passwords", () =>
    expect(
      credentialsSchema.safeParse({
        email: "user@example.com",
        password: "short",
      }).success,
    ).toBe(false));
  it("accepts normalized credentials", () =>
    expect(
      credentialsSchema.parse({
        email: "USER@EXAMPLE.COM",
        password: "a-secure-password",
      }).email,
    ).toBe("user@example.com"));
});
