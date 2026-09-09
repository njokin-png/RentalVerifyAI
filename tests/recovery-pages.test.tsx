import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ErrorPage from "@/app/error";
import GlobalError from "@/app/global-error";
import NotFound from "@/app/not-found";

describe("customer recovery pages", () => {
  it("offers useful navigation for an unknown route", () => {
    const html = renderToStaticMarkup(<NotFound />);

    expect(html).toContain("We couldn&#x27;t find that page");
    expect(html).toContain('href="/analyze"');
    expect(html).toContain('href="/"');
  });

  it("offers retry and home actions without exposing an error", () => {
    const html = renderToStaticMarkup(<ErrorPage reset={vi.fn()} />);

    expect(html).toContain("This page couldn&#x27;t be loaded");
    expect(html).toContain("Try again");
    expect(html).toContain('href="/"');
    expect(html).not.toContain("stack");
    expect(html).not.toContain("digest");
  });

  it("renders a complete root fallback document", () => {
    const html = renderToStaticMarkup(<GlobalError reset={vi.fn()} />);

    expect(html).toContain("<html");
    expect(html).toContain("<body");
    expect(html).toContain("We hit a temporary problem");
    expect(html).not.toContain("stack");
    expect(html).not.toContain("digest");
  });
});
