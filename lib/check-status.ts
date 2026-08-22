import type { Check } from "./types";

const statusLabels: Record<Check["status"], string> = {
  verified: "Verified",
  analyzed: "Analyzed",
  unverified: "Unverified",
  unavailable: "Unavailable",
  mismatch: "Mismatch",
};

export function checkStatusLabel(status: Check["status"]) {
  return statusLabels[status];
}
