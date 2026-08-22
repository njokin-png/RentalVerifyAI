import type { Check, ScanInput } from "@/lib/types";
import type { PropertyVerificationResult } from "./types";

function unavailable(name: string, detail: string): Check {
  return { name, status: "unavailable", detail, category: "property" };
}

export function propertyChecks(
  input: ScanInput,
  result: PropertyVerificationResult,
): Check[] {
  if (result.error || !result.record) {
    const detail = result.error || "Property data was unavailable.";
    return [
      unavailable("Address validation", detail),
      unavailable("Ownership records", detail),
      unavailable("Parcel / APN", detail),
      unavailable("Property characteristics", detail),
      unavailable("Sale history", detail),
    ];
  }

  const r = result.record;
  const normalizedInput = input.address.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalizedFound = (r.formattedAddress || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const addressMatches =
    !!normalizedFound &&
    (normalizedFound.includes(normalizedInput) || normalizedInput.includes(normalizedFound));

  const characteristics = [
    r.propertyType,
    r.bedrooms != null ? `${r.bedrooms} bd` : undefined,
    r.bathrooms != null ? `${r.bathrooms} ba` : undefined,
    r.squareFootage != null ? `${r.squareFootage.toLocaleString()} sq ft` : undefined,
    r.yearBuilt != null ? `built ${r.yearBuilt}` : undefined,
  ].filter(Boolean);

  return [
    {
      name: "Address validation",
      status: addressMatches ? "verified" : "mismatch",
      detail: r.formattedAddress
        ? `${result.source === "rentcast" ? "Live" : "Demo"} property record: ${r.formattedAddress}`
        : "No formatted address was returned.",
      category: "property",
    },
    r.ownerNames?.length
      ? {
          name: "Ownership records",
          status: "verified",
          detail: `Public record owner: ${r.ownerNames.join(", ")}.`,
          category: "property",
        }
      : unavailable("Ownership records", "Owner information was not returned by the provider."),
    r.parcelId
      ? {
          name: "Parcel / APN",
          status: "verified",
          detail: `Parcel/APN: ${r.parcelId}.`,
          category: "property",
        }
      : unavailable("Parcel / APN", "Parcel/APN data was not returned by the provider."),
    characteristics.length
      ? {
          name: "Property characteristics",
          status: "verified",
          detail: characteristics.join(" · "),
          category: "property",
        }
      : unavailable(
          "Property characteristics",
          "Property characteristics were not returned by the provider.",
        ),
    r.lastSaleDate || r.lastSalePrice != null
      ? {
          name: "Sale history",
          status: "verified",
          detail: [
            r.lastSaleDate ? `Last sale: ${r.lastSaleDate}` : undefined,
            r.lastSalePrice != null ? `$${r.lastSalePrice.toLocaleString()}` : undefined,
          ]
            .filter(Boolean)
            .join(" · "),
          category: "property",
        }
      : unavailable("Sale history", "Sale history was not returned by the provider."),
  ];
}
