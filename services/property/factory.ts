import type { PropertyProvider } from "./provider-interface";
import { DemoPropertyProvider, UnavailablePropertyProvider } from "./provider";
import { RentCastPropertyProvider } from "./rentcast";

export function getPropertyProvider(): PropertyProvider {
  if (process.env.DEMO_MODE === "true") return new DemoPropertyProvider();
  const selected = (process.env.PROPERTY_PROVIDER || "demo").toLowerCase();
  const apiKey = process.env.RENTCAST_API_KEY?.trim();
  if (selected === "rentcast" && apiKey) {
    return new RentCastPropertyProvider(apiKey);
  }
  return new UnavailablePropertyProvider();
}
