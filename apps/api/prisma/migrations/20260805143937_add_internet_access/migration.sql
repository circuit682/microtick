-- CreateTable
CREATE TABLE "InternetAccess" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternetAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InternetAccess_purchaseId_key" ON "InternetAccess"("purchaseId");

-- AddForeignKey
ALTER TABLE "InternetAccess" ADD CONSTRAINT "InternetAccess_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
