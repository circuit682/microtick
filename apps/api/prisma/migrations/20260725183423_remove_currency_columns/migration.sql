/*
  Warnings:

  - You are about to drop the column `currency` on the `PaymentIntent` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PaymentIntent" DROP COLUMN "currency";

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "currency";
