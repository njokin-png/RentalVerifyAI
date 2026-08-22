export const scoringConfig = {
  baseScore: 100,
  unavailableCheckDeduction: 4,
  maximumUnavailableDeduction: 20,
  severityCaps: { low: 4, medium: 9, high: 16, critical: 25 },
  classification: [
    { min: 90, label: "Low Risk" },
    { min: 70, label: "Some Concerns" },
    { min: 45, label: "Moderate Risk" },
    { min: 20, label: "High Risk" },
    { min: 0, label: "Very High Risk" },
  ],
  categoryWeights: {
    identity: 12,
    property: 14,
    listing: 12,
    rent: 12,
    communication: 14,
    payment: 18,
    duplicate: 10,
    image: 8,
    contact: 10,
  },
} as const;
