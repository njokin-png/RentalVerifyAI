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
  source: "demo" | "rentcast";
  record?: PropertyRecord;
  error?: string;
};
