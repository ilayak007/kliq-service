-- AlterTable
ALTER TABLE "Matches" ALTER COLUMN "result" DROP NOT NULL,
ALTER COLUMN "matchLocation" DROP NOT NULL,
ALTER COLUMN "isActive" SET DEFAULT false,
ALTER COLUMN "isDrawNeeded" SET DEFAULT false;
