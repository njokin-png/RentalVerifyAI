export interface PaymentProvider {
  createCheckout(
    plan: "report" | "pro",
    userId: string,
  ): Promise<{ url: string | null; demo: boolean }>;
}
export class StripePaymentProvider implements PaymentProvider {
  async createCheckout() {
    if (!process.env.STRIPE_SECRET_KEY) return { url: null, demo: true };
    return { url: null, demo: true };
  }
}
