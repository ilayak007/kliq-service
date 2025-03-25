-- CreateEnum
CREATE TYPE "Result" AS ENUM ('WON', 'LOST');

-- CreateTable
CREATE TABLE "CustomerPrediction" (
    "predictionId" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerSelected" TEXT NOT NULL,
    "result" "Result" NOT NULL,
    "pointsEarned" INTEGER,
    "isPointsUpdated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerPrediction_pkey" PRIMARY KEY ("predictionId")
);

-- CreateIndex
CREATE INDEX "CustomerPrediction_matchId_customerId_idx" ON "CustomerPrediction"("matchId", "customerId");

-- AddForeignKey
ALTER TABLE "CustomerPrediction" ADD CONSTRAINT "CustomerPrediction_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Matches"("matchId") ON DELETE RESTRICT ON UPDATE CASCADE;
