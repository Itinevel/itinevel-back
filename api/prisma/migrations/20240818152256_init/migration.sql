/*
  Warnings:

  - You are about to drop the column `nbr_of_days` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Plan` table. All the data in the column will be lost.
  - Added the required column `totalDays` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "nbr_of_days",
DROP COLUMN "title",
ADD COLUMN     "name" TEXT,
ADD COLUMN     "totalDays" INTEGER NOT NULL;
