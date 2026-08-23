CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'SOME_CONCERNS', 'MODERATE', 'HIGH', 'VERY_HIGH', 'UNABLE_TO_VERIFY');
CREATE TYPE "CheckStatus" AS ENUM ('VERIFIED', 'ANALYZED', 'UNVERIFIED', 'UNAVAILABLE', 'MISMATCH');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RentalScan" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "score" INTEGER NOT NULL,
  "riskLevel" "RiskLevel" NOT NULL,
  "confidence" TEXT NOT NULL,
  "checksCompleted" INTEGER NOT NULL DEFAULT 0,
  "checksUnavailable" INTEGER NOT NULL DEFAULT 0,
  "verificationGapDeduction" INTEGER NOT NULL DEFAULT 0,
  "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RentalScan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Property" (
  "id" TEXT NOT NULL,
  "scanId" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "zip" TEXT,
  "bedrooms" DOUBLE PRECISION,
  "bathrooms" DOUBLE PRECISION,
  "advertisedRent" DECIMAL(10,2) NOT NULL,
  "estimatedRent" DECIMAL(10,2),
  "parcelId" TEXT,
  "ownerName" TEXT,
  CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Listing" (
  "id" TEXT NOT NULL,
  "scanId" TEXT NOT NULL,
  "url" TEXT,
  "text" TEXT,
  "source" TEXT,
  "descriptionHash" TEXT,
  CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Contact" (
  "id" TEXT NOT NULL,
  "scanId" TEXT NOT NULL,
  "name" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "company" TEXT,
  CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RiskSignal" (
  "id" TEXT NOT NULL,
  "scanId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "explanation" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "evidence" TEXT,
  "deduction" INTEGER NOT NULL,
  CONSTRAINT "RiskSignal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VerificationCheck" (
  "id" TEXT NOT NULL,
  "scanId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" "CheckStatus" NOT NULL,
  "detail" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "provider" TEXT,
  CONSTRAINT "VerificationCheck_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ConversationAnalysis" (
  "id" TEXT NOT NULL,
  "scanId" TEXT NOT NULL,
  "redactedText" TEXT,
  "summary" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  CONSTRAINT "ConversationAnalysis_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UploadedImage" (
  "id" TEXT NOT NULL,
  "scanId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "storageKey" TEXT,
  "extractedText" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UploadedImage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Report" (
  "id" TEXT NOT NULL,
  "scanId" TEXT NOT NULL,
  "content" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Subscription" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "plan" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "providerId" TEXT,
  "currentPeriodEnd" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Payment" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'usd',
  "status" TEXT NOT NULL,
  "providerId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Property_scanId_key" ON "Property"("scanId");
CREATE UNIQUE INDEX "Listing_scanId_key" ON "Listing"("scanId");
CREATE UNIQUE INDEX "Contact_scanId_key" ON "Contact"("scanId");
CREATE UNIQUE INDEX "ConversationAnalysis_scanId_key" ON "ConversationAnalysis"("scanId");
CREATE UNIQUE INDEX "Report_scanId_key" ON "Report"("scanId");
CREATE INDEX "RentalScan_userId_createdAt_idx" ON "RentalScan"("userId", "createdAt");

ALTER TABLE "RentalScan" ADD CONSTRAINT "RentalScan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Property" ADD CONSTRAINT "Property_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "RentalScan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "RentalScan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "RentalScan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RiskSignal" ADD CONSTRAINT "RiskSignal_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "RentalScan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VerificationCheck" ADD CONSTRAINT "VerificationCheck_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "RentalScan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConversationAnalysis" ADD CONSTRAINT "ConversationAnalysis_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "RentalScan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UploadedImage" ADD CONSTRAINT "UploadedImage_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "RentalScan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "RentalScan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
