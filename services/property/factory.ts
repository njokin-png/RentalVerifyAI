import type { PropertyProvider } from "./provider-interface";
import { DemoPropertyProvider } from "./provider";
import { RentCastPropertyProvider } from "./rentcast";

export function getPropertyProvider(): PropertyProvider {
  const selected = (process.env.PROPERTY_PROVIDER || "demo").toLowerCase();
  const apiKey = process.env.RENTCAST_API_KEY?.trim();
  if (selected === "rentcast" && apiKey) {
    return new RentCastPropertyProvider(apiKey);
  }
  return new DemoPropertyProvider();
}
