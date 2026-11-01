/*
  Warnings:

  - You are about to drop the column `createdAt` on the `addons` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `addons` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `menu_items` table. All the data in the column will be lost.
  - You are about to drop the column `isDelete` on the `menu_items` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `menu_items` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `orders` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `addons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "addons" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "categoryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "menu_items" DROP COLUMN "createdAt",
DROP COLUMN "isDelete",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "updatedAt";

-- AddForeignKey
ALTER TABLE "addons" ADD CONSTRAINT "addons_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "menu_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
