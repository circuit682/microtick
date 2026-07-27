/*
  Warnings:

  - You are about to drop the column `duration` on the `Plan` table. All the data in the column will be lost.
  - Added the required column `allowanceMinutes` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('TIME', 'USAGE');

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "duration",
ADD COLUMN     "allowanceMinutes" INTEGER NOT NULL,
ADD COLUMN     "type" "PlanType" NOT NULL;
