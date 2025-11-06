/*
  Warnings:

  - You are about to drop the column `School` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `School`,
    ADD COLUMN `school` VARCHAR(191) NULL;
