/*
  Warnings:

  - Added the required column `status` to the `InternetAccess` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InternetAccessStatus" AS ENUM ('GRANTED', 'PROVISIONING', 'ACTIVE', 'EXPIRED', 'REVOKED', 'FAILED');

-- AlterTable
ALTER TABLE "InternetAccess" ADD COLUMN     "status" "InternetAccessStatus" NOT NULL;
