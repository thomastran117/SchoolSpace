/*
  Warnings:

  - A unique constraint covering the columns `[microsoftId,msIssuer,msTenantId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `User_microsoftId_key` ON `user`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `version` INTEGER NOT NULL DEFAULT 1,
    MODIFY `password` VARCHAR(255) NULL;

-- CreateTable
CREATE TABLE `Catalogue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `course_name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `available` BOOLEAN NOT NULL DEFAULT true,
    `course_code` VARCHAR(191) NOT NULL,
    `term` ENUM('SUMMER', 'WINTER', 'FALL') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Catalogue_course_code_key`(`course_code`),
    INDEX `Catalogue_term_idx`(`term`),
    INDEX `Catalogue_available_idx`(`available`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Course` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `catalogue_id` INTEGER NOT NULL,
    `teacher_id` INTEGER NOT NULL,
    `image_url` VARCHAR(191) NULL,
    `year` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Course_catalogue_id_idx`(`catalogue_id`),
    INDEX `Course_teacher_id_idx`(`teacher_id`),
    INDEX `Course_year_idx`(`year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Enrollment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `course_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Enrollment_course_id_idx`(`course_id`),
    INDEX `Enrollment_user_id_idx`(`user_id`),
    UNIQUE INDEX `Enrollment_course_id_user_id_key`(`course_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assignment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `course_id` INTEGER NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` VARCHAR(5000) NOT NULL,
    `file_url` VARCHAR(191) NULL,
    `dueDate` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Assignment_course_id_idx`(`course_id`),
    INDEX `Assignment_course_id_dueDate_idx`(`course_id`, `dueDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Grade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `course_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `weight` DOUBLE NOT NULL,
    `obtained` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,
    `isFinalGrade` BOOLEAN NOT NULL DEFAULT false,
    `assignment_id` INTEGER NULL,
    `test_id` VARCHAR(191) NULL,
    `quiz_id` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Grade_course_id_idx`(`course_id`),
    INDEX `Grade_user_id_idx`(`user_id`),
    INDEX `Grade_assignment_id_idx`(`assignment_id`),
    INDEX `Grade_test_id_idx`(`test_id`),
    INDEX `Grade_quiz_id_idx`(`quiz_id`),
    UNIQUE INDEX `Grade_course_id_user_id_assignment_id_key`(`course_id`, `user_id`, `assignment_id`),
    UNIQUE INDEX `Grade_course_id_user_id_test_id_key`(`course_id`, `user_id`, `test_id`),
    UNIQUE INDEX `Grade_course_id_user_id_quiz_id_key`(`course_id`, `user_id`, `quiz_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `User_role_idx` ON `User`(`role`);

-- CreateIndex
CREATE INDEX `User_provider_idx` ON `User`(`provider`);

-- CreateIndex
CREATE INDEX `User_username_idx` ON `User`(`username`);

-- CreateIndex
CREATE UNIQUE INDEX `User_microsoftId_msIssuer_msTenantId_key` ON `User`(`microsoftId`, `msIssuer`, `msTenantId`);

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_catalogue_id_fkey` FOREIGN KEY (`catalogue_id`) REFERENCES `Catalogue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assignment` ADD CONSTRAINT `Assignment_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Grade` ADD CONSTRAINT `Grade_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Grade` ADD CONSTRAINT `Grade_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Grade` ADD CONSTRAINT `Grade_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `Assignment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
