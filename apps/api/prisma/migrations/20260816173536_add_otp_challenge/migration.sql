-- CreateTable
CREATE TABLE "OtpChallenge" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtpChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OtpChallenge_phoneNumber_idx" ON "OtpChallenge"("phoneNumber");

-- CreateIndex
CREATE INDEX "OtpChallenge_phoneNumber_expiresAt_idx" ON "OtpChallenge"("phoneNumber", "expiresAt");
