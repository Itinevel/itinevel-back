-- AlterTable
ALTER TABLE "users" ADD COLUMN     "confirmationToken" TEXT,
ADD COLUMN     "emailConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tokenExpiry" TIMESTAMP(3);
