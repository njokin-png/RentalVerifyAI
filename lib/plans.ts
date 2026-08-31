export const PLANS = {
  free: { name: "FREE", price: "$0", monthlyScanLimit: 3 },
  report: { name: "RENTAL VERIFY REPORT", price: "$4.99", amount: 499 },
  pro: {
    name: "PRO",
    price: "$9.99/month",
    amount: 999,
    monthlyScanLimit: null,
  },
} as const;

export type PaidPlan = "report" | "pro";
