import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.afterAll(async () => {
  await prisma.rentalScan.deleteMany({
    where: { user: { email: { endsWith: "@e2e.rentalverifyai.com" } } },
  });
  await prisma.user.deleteMany({
    where: { email: { endsWith: "@e2e.rentalverifyai.com" } },
  });
  await prisma.$disconnect();
});

test("renter can create an account, scan, reopen, and delete an investigation", async ({
  page,
}) => {
  const email = `browser-${Date.now()}@e2e.rentalverifyai.com`;
  const password = "Safe-Test-Password-42";
  const address = "5500 Grand Lake Dr, San Antonio, TX 78244";

  await page.goto("/signup");
  await page.getByLabel("Name").fill("Browser Test Renter");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  const signupResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/auth/signup") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Create secure account" }).click();
  const signupResponse = await signupResponsePromise;
  const signupBody = await signupResponse.text();
  expect(signupResponse.status(), signupBody).toBe(200);
  await expect(page).toHaveURL(/\/check-email$/);

  await prisma.user.update({
    where: { email },
    data: { emailVerifiedAt: new Date() },
  });

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(
    page.getByRole("link", { name: "Log in" }).first(),
  ).toBeVisible();

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/analyze");
  await page.getByLabel("Property address *").fill(address);
  await page.getByLabel("Advertised monthly rent *").fill("1500");
  await page.getByLabel("Bedrooms").fill("3");
  await page.getByLabel("Bathrooms").fill("2");
  await page
    .getByLabel("Conversation text or emails")
    .fill("The landlord wants payment before a tour.");
  await page.getByRole("button", { name: "CHECK THIS RENTAL" }).click();
  await expect(page).toHaveURL(/\/results\/[^/]+$/);
  await expect(
    page.getByText("RENTAL TRUST SCORE", { exact: true }),
  ).toBeVisible();

  await page.goto("/history");
  const investigation = page.getByRole("row", { name: new RegExp(address) });
  await expect(investigation).toBeVisible();
  await investigation.getByRole("link", { name: "Reopen" }).click();
  await expect(page).toHaveURL(/\/results\/[^/]+$/);

  await page.goto("/history");
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("row", { name: new RegExp(address) })
    .getByRole("button", { name: "Delete" })
    .click();
  await expect(page.getByText("No saved rental scans yet")).toBeVisible();
});
