import { randomUUID } from "crypto";
import { PrismaClient, RiskLevel } from "@prisma/client";
const db = new PrismaClient();
 const demos = [
 ["48 Harbor Way, San Francisco, CA 94107", 96, RiskLevel.LOW],
  ["810 Cedar Ave, Chicago, IL 60614", 51, RiskLevel.MODERATE],
  ["220 Pine St, Austin, TX 78701", 63, RiskLevel.MODERATE],
  ["15 West 72nd St, New York, NY 10023", 39, RiskLevel.HIGH],
  ["901 Lakeview Blvd, Seattle, WA 98101", 24, RiskLevel.HIGH],
] as const;
async function main() {
  for (const [address, score, riskLevel] of demos) {
    await db.rentalScan.create({
      data: {
       id: randomUUID(),
 score,
        riskLevel,
        confidence: "High",
        property: {
          create: { address, advertisedRent: score > 90 ? 2800 : 1200 },
        },
        listing: { create: { source: "Demo seed" } },
        contact: { create: {} },
        report: { create: { content: { demo: true, address, score } } },
      },
    });
  }
}
main().finally(() => db.$disconnect());
