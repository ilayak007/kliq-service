/*
  Warnings:

  - The primary key for the `Matches` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `matchId` on the `Matches` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Matches" DROP CONSTRAINT "Matches_pkey",
DROP COLUMN "matchId",
ADD COLUMN     "matchId" INTEGER NOT NULL,
ADD CONSTRAINT "Matches_pkey" PRIMARY KEY ("matchId");
