/*
  Warnings:

  - Added the required column `creatorId` to the `business_hours` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "business_hours" ADD COLUMN     "creatorId" TEXT NOT NULL,
ADD COLUMN     "isDelete" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "business_hours" ADD CONSTRAINT "business_hours_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
