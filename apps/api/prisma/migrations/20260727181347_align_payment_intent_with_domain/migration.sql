/*
  Warnings:

  - You are about to drop the column `email` on the `PaymentIntent` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reference]` on the table `PaymentIntent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reference` to the `PaymentIntent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaymentIntent" DROP COLUMN "email",
ADD COLUMN     "reference" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PaymentIntent_reference_key" ON "PaymentIntent"("reference");
