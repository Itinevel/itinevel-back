-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "imageUrls" TEXT[],
ADD COLUMN     "selectedCountries" TEXT[],
ADD COLUMN     "totalPrice" DOUBLE PRECISION;
