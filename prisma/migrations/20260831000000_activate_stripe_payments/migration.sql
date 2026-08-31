ALTER TABLE "User" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "checkoutSessionId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "checkoutSessionId" TEXT,
ADD COLUMN "reportScanId" TEXT;

CREATE TABLE "StripeEvent" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StripeEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
CREATE UNIQUE INDEX "Subscription_providerId_key" ON "Subscription"("providerId");
CREATE UNIQUE INDEX "Subscription_checkoutSessionId_key" ON "Subscription"("checkoutSessionId");
CREATE UNIQUE INDEX "Payment_providerId_key" ON "Payment"("providerId");
CREATE UNIQUE INDEX "Payment_checkoutSessionId_key" ON "Payment"("checkoutSessionId");
