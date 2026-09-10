const baseUrl = (
  process.env.PRODUCTION_BASE_URL ?? "https://rentalverifyai.vercel.app"
).replace(/\/$/, "");

const checks = [
  {
    name: "homepage",
    path: "/",
    verify: (body) => body.includes("Check the warning signs before you pay"),
  },
  {
    name: "configuration health",
    path: "/api/health",
    verify: (body) => {
      const payload = JSON.parse(body);
      return payload.status === "ok" && payload.configuration === "valid";
    },
  },
  {
    name: "database readiness",
    path: "/api/ready",
    verify: (body) => JSON.parse(body).status === "ready",
  },
  {
    name: "Stripe pricing",
    path: "/pricing",
    verify: (body) =>
      body.includes("Secure test checkout is provided by Stripe") &&
      body.includes("$9.99/month"),
  },
];

async function runCheck(check) {
  const response = await fetch(`${baseUrl}${check.path}`, {
    headers: { "user-agent": "RentalVerifyAI-production-smoke/1.0" },
    redirect: "follow",
    signal: AbortSignal.timeout(10_000),
  });
  const body = await response.text();

  if (!response.ok) {
    throw new Error(`${check.name} returned HTTP ${response.status}`);
  }

  let valid = false;
  try {
    valid = check.verify(body);
  } catch {
    valid = false;
  }

  if (!valid) {
    throw new Error(`${check.name} returned an unexpected response`);
  }

  console.log(`PASS ${check.name} (${response.status})`);
}

for (const check of checks) {
  try {
    await runCheck(check);
  } catch (error) {
    console.error(
      `FAIL ${error instanceof Error ? error.message : check.name}`,
    );
    process.exitCode = 1;
  }
}

if (process.exitCode) {
  throw new Error("Production smoke check failed");
}

console.log("Production smoke check passed");
