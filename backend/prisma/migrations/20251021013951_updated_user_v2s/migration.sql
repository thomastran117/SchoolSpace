/*
  Warnings:

  - You are about to drop the column `Faculty` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `Faculty`,
    ADD COLUMN `faculty` VARCHAR(191) NULL;
