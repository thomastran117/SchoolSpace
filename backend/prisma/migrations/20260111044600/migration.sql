/*
  Warnings:

  - You are about to drop the column `version` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[section]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `section` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `course` ADD COLUMN `annoucementNumber` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `assignmentNumber` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `assistantNumber` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `enrollmentNumber` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `lectureNumber` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `maxEnrollmentNumber` INTEGER NOT NULL DEFAULT 300,
    ADD COLUMN `section` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `version`;

-- CreateIndex
CREATE UNIQUE INDEX `Course_section_key` ON `Course`(`section`);
