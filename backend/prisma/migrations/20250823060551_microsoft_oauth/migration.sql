/*
  Warnings:

  - You are about to alter the column `provider` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - A unique constraint covering the columns `[microsoftId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `microsoftId` VARCHAR(191) NULL,
    ADD COLUMN `msIssuer` VARCHAR(191) NULL,
    ADD COLUMN `msTenantId` VARCHAR(191) NULL,
    MODIFY `provider` ENUM('local', 'google', 'microsoft') NOT NULL DEFAULT 'local';

-- CreateIndex
CREATE UNIQUE INDEX `User_microsoftId_key` ON `User`(`microsoftId`);
