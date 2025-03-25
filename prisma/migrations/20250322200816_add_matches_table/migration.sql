-- CreateTable
CREATE TABLE "Matches" (
    "matchId" TEXT NOT NULL,
    "teamA" TEXT NOT NULL,
    "teamB" TEXT NOT NULL,
    "matchStartDateTime" TIMESTAMP(3) NOT NULL,
    "result" TEXT NOT NULL,
    "matchLocation" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "isDrawNeeded" BOOLEAN NOT NULL,

    CONSTRAINT "Matches_pkey" PRIMARY KEY ("matchId")
);
