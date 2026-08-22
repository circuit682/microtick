/*
  Warnings:

  - Added the required column `customerId` to the `PaymentIntent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaymentIntent" ADD COLUMN     "customerId" TEXT NOT NULL;
