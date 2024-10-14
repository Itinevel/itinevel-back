/*
  Warnings:

  - You are about to drop the `Itinerary` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Itinerary";

-- CreateTable
CREATE TABLE "Plan" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "nbr_of_days" INTEGER,
    "itineraries" TEXT[],

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);
