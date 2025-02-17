-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "budget" DOUBLE PRECISION NOT NULL,
    "launchDate" TIMESTAMP(3) NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "assignedChannels" TEXT[],

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Creator" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "followers" INTEGER NOT NULL,
    "platforms" TEXT[],

    CONSTRAINT "Creator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitedCreator" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "InvitedCreator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvitedCreator_campaignId_creatorId_key" ON "InvitedCreator"("campaignId", "creatorId");

-- AddForeignKey
ALTER TABLE "InvitedCreator" ADD CONSTRAINT "InvitedCreator_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitedCreator" ADD CONSTRAINT "InvitedCreator_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
