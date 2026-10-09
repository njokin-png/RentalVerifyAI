export type PropertyRecord = {
  formattedAddress?: string;
  ownerNames?: string[];
  parcelId?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  lotSize?: number;
  yearBuilt?: number;
  lastSaleDate?: string;
  lastSalePrice?: number;
};

export type PropertyVerificationResult = {
  source: "demo" | "rentcast" | "none";
  record?: PropertyRecord;
  error?: string;
};
