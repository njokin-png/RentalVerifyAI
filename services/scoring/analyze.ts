import type { ScanInput, ScanResult } from "@/lib/types";
import { analyzeText } from "@/services/listing/analyzer";
import { DemoPropertyProvider } from "@/services/property/provider";
import { DemoContactProvider } from "@/services/contact/provider";
import { DemoRentProvider, evaluateRent } from "@/services/rent/provider";
import { DemoDuplicateProvider } from "@/services/duplicates/provider";
import { calculateScore } from "./engine";
export async function analyzeRental(
  input: ScanInput,
  id = crypto.randomUUID(),
): Promise<ScanResult> {
  const text = [input.listingText, input.conversation]
    .filter(Boolean)
    .join("\n");
  const signals = analyzeText(text);
  const property = await new DemoPropertyProvider().verify(input);
  const contact = await new DemoContactProvider().verify(input);
  signals.push(...contact.signals);
  const duplicates = await new DemoDuplicateProvider().search(input);
  signals.push(...duplicates.signals);
  const estimated = await new DemoRentProvider().estimate(input);
  const rent = evaluateRent(input.advertisedRent, estimated);
  if (rent.signal) signals.push(rent.signal);
  const checks = [
    ...property,
    ...contact.checks,
    ...duplicates.checks,
    rent.check,
    {
      name: "Reverse image verification",
      status: "unavailable" as const,
      detail: "Unavailable until a reverse-image provider API is configured.",
      category: "image",
    },
    {
      name: "Communication review",
      status: input.conversation
        ? ("verified" as const)
        : ("unverified" as const),
      detail: input.conversation
        ? "Messages were checked against explainable risk rules."
        : "No conversation was supplied.",
      category: "communication",
    },
  ];
  const scored = calculateScore(signals, checks);
  return {
    id,
    input,
    ...scored,
    signals,
    checks,
    recommendations: [
      "Verify ownership independently using local property records.",
      "Tour the property before paying or sharing sensitive information.",
      "Call the company using a number found on its official website.",
      "Avoid irreversible payment methods.",
      "Compare the listing on multiple established websites.",
    ],
    estimatedRent: estimated || undefined,
    rentDifferencePercent: rent.difference,
    createdAt: new Date().toISOString(),
    reverseImageAvailable: false,
  };
}
