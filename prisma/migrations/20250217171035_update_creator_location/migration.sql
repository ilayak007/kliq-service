/*
  Warnings:

  - You are about to drop the column `location` on the `Creator` table. All the data in the column will be lost.
  - Added the required column `city` to the `Creator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Creator` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Creator" DROP COLUMN "location",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL;
