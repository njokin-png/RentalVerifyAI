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
