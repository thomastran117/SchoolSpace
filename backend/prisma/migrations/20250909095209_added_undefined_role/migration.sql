-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('notdefined', 'student', 'teacher', 'assistant', 'admin') NOT NULL DEFAULT 'notdefined';
