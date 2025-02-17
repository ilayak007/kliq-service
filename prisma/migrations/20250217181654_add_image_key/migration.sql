/*
  Warnings:

  - You are about to alter the column `budget` on the `Campaign` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Made the column `description` on table `Campaign` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "imageKey" TEXT,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "budget" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Creator" ADD COLUMN     "imageKey" TEXT;
