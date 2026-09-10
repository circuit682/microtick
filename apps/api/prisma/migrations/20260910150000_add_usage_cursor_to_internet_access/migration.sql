-- AlterTable
ALTER TABLE "InternetAccess"
ADD COLUMN "usageSessionId" TEXT,
ADD COLUMN "usageRecordedThrough" TIMESTAMP(3);
