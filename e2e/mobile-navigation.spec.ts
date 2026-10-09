import { expect, test } from "@playwright/test";

test("phone users can reach every primary public destination", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeHidden();
  await page.getByText("Menu", { exact: true }).click();

  const navigation = page.getByRole("navigation", {
    name: "Mobile navigation",
  });
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Analyze" })).toBeVisible();
  await expect(
    navigation.getByRole("link", { name: "Safety tips" }),
  ).toBeVisible();
  await expect(
    navigation.getByRole("link", { name: "How it works" }),
  ).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Pricing" })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Log in" })).toBeVisible();

  await navigation.getByRole("link", { name: "Safety tips" }).click();
  await expect(page).toHaveURL(/\/safety$/);
  await expect(
    page.getByRole("heading", { name: /protect yourself/i }),
  ).toBeVisible();
  await expect(
    page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).resolves.toBe(true);
});

test("checkout return waits for confirmed access and opens the purchased report", async ({
  page,
}) => {
  let checks = 0;
  await page.route("**/api/checkout/status?*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        ++checks === 1
          ? { state: "pending", paid: true, plan: "report" }
          : {
              state: "ready",
              paid: true,
              plan: "report",
              destination: "/report/demo-rent",
            },
      ),
    }),
  );
  await page.goto("/checkout/success?session_id=cs_test_browser");
  await expect(page.getByRole("status")).toContainText("still being activated");
  await expect(
    page.getByRole("link", { name: "Open your report" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Open your report" }).click();
  await expect(page).toHaveURL(/\/report\/demo-rent$/);
  await expect(page.getByText("DEMO REPORT", { exact: true })).toBeVisible();
});
