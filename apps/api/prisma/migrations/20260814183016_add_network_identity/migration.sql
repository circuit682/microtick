-- CreateEnum
CREATE TYPE "AuthenticationMethod" AS ENUM ('HOTSPOT');

-- CreateTable
CREATE TABLE "NetworkIdentity" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "encryptedCredential" TEXT NOT NULL,
    "authenticationMethod" "AuthenticationMethod" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NetworkIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NetworkIdentity_username_key" ON "NetworkIdentity"("username");

-- CreateIndex
CREATE INDEX "NetworkIdentity_customerId_idx" ON "NetworkIdentity"("customerId");
