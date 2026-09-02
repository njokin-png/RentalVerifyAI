import type { ScanInput, ScanResult } from "@/lib/types";
import { analyzeText } from "@/services/listing/analyzer";
import { getPropertyProvider } from "@/services/property/factory";
import { propertyChecks } from "@/services/property/checks";
import { DemoContactProvider } from "@/services/contact/provider";
import { evaluateRent, getRentProvider } from "@/services/rent/provider";
import { DemoDuplicateProvider } from "@/services/duplicates/provider";
import { calculateScore } from "./engine";
import { analyzeImages } from "@/services/images/analyze";
import type { ImageProviders } from "@/services/images/provider";

export async function analyzeRental(
  input: ScanInput,
  id = crypto.randomUUID(),
  images: File[] = [],
  imageProviders?: ImageProviders,
): Promise<ScanResult> {
  const text = [input.listingText, input.conversation]
    .filter(Boolean)
    .join("\n");
  const signals = analyzeText(text);
  const imageAnalysis = await analyzeImages(images, imageProviders);
  signals.push(...imageAnalysis.signals);

  const propertyResult = await getPropertyProvider().verify(input);
  const property = propertyChecks(input, propertyResult);
  const contact = await new DemoContactProvider().verify(input);
  signals.push(...contact.signals);
  const duplicates = await new DemoDuplicateProvider().search(input);
  signals.push(...duplicates.signals);
  const estimated = await getRentProvider().estimate(input);
  const rent = evaluateRent(input.advertisedRent, estimated);
  if (rent.signal) signals.push(rent.signal);

  const checks = [
    ...property,
    ...contact.checks,
    ...duplicates.checks,
    rent.check,
    ...imageAnalysis.checks,
    {
      name: "Communication review",
      status: input.conversation
        ? ("analyzed" as const)
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
    estimatedRent:
      estimated.status === "available" ? estimated.monthly : undefined,
    rentDifferencePercent: rent.difference,
    createdAt: new Date().toISOString(),
    reverseImageAvailable: !imageAnalysis.checks.some(
      (check) =>
        check.name === "Reverse image verification" &&
        check.status === "unavailable",
    ),
  };
}
