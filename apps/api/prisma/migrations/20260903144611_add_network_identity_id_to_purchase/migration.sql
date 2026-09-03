/*
  Warnings:

  - A unique constraint covering the columns `[networkIdentityId]` on the table `Purchase` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `networkIdentityId` to the `Purchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "networkIdentityId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_networkIdentityId_key" ON "Purchase"("networkIdentityId");
