-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "serviceLevel" TEXT NOT NULL DEFAULT 'Standard';

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "serviceLevel" TEXT NOT NULL DEFAULT 'Standard';
