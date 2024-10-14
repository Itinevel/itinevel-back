/*
  Warnings:

  - You are about to drop the column `totalCost` on the `Itinerary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Itinerary" DROP COLUMN "totalCost";

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "totalCost" DOUBLE PRECISION;
