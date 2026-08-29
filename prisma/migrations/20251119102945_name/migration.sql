/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `branches` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "appointments" ADD COLUMN "cancellationReason" TEXT;
ALTER TABLE "appointments" ADD COLUMN "cancelledAt" DATETIME;
ALTER TABLE "appointments" ADD COLUMN "completedAt" DATETIME;
ALTER TABLE "appointments" ADD COLUMN "confirmedAt" DATETIME;
ALTER TABLE "appointments" ADD COLUMN "confirmedBy" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "branches_name_key" ON "branches"("name");
