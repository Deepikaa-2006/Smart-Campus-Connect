-- =========================================================
-- Smart Campus Connect - College Management System
-- Database Schema Definition (MySQL / MariaDB)
-- Course: Web Programming Academic Project
-- =========================================================

CREATE DATABASE IF NOT EXISTS `smart_campus_connect` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `smart_campus_connect`;

-- Disable foreign key checks during schema creation
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------
-- 1. Table: users
-- Core authentication table for Students, Faculty, and Admin.
-- Passwords stored exclusively as secure BCrypt hashes.
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('student', 'faculty', 'admin') NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_users_role` (`role`),
    INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 2. Table: students
-- Profile information linked 1-to-1 with `users`.
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `roll_number` VARCHAR(30) NOT NULL UNIQUE,
    `department` VARCHAR(60) NOT NULL,
    `semester` INT NOT NULL DEFAULT 1,
    `phone` VARCHAR(20),
    `cgpa` DECIMAL(3,2) DEFAULT 8.50,
    CONSTRAINT `fk_students_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 3. Table: faculty
-- Faculty profile linked 1-to-1 with `users`.
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `faculty`;
CREATE TABLE `faculty` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `employee_id` VARCHAR(30) NOT NULL UNIQUE,
    `department` VARCHAR(60) NOT NULL,
    `designation` VARCHAR(60) NOT NULL,
    `phone` VARCHAR(20),
    CONSTRAINT `fk_faculty_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 4. Table: courses
-- Courses offered in departments with assigned faculty.
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `course_code` VARCHAR(20) NOT NULL UNIQUE,
    `course_name` VARCHAR(120) NOT NULL,
    `department` VARCHAR(60) NOT NULL,
    `credits` INT NOT NULL DEFAULT 3,
    `faculty_id` INT,
    CONSTRAINT `fk_courses_faculty` FOREIGN KEY (`faculty_id`) 
        REFERENCES `faculty` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 5. Table: attendance
-- Records class attendance marked by faculty.
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `attendance`;
CREATE TABLE `attendance` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT NOT NULL,
    `faculty_id` INT NOT NULL,
    `subject` VARCHAR(100) NOT NULL,
    `attendance_date` DATE NOT NULL,
    `status` ENUM('Present', 'Absent', 'Late') NOT NULL DEFAULT 'Present',
    `remarks` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_attendance_student` FOREIGN KEY (`student_id`) 
        REFERENCES `students` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_attendance_faculty` FOREIGN KEY (`faculty_id`) 
        REFERENCES `faculty` (`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_student_date_subject` (`student_id`, `subject`, `attendance_date`),
    INDEX `idx_att_date` (`attendance_date`),
    INDEX `idx_att_subject` (`subject`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 6. Table: assignments
-- Assignments created by faculty members.
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `assignments`;
CREATE TABLE `assignments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `faculty_id` INT NOT NULL,
    `subject` VARCHAR(100) NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `description` TEXT NOT NULL,
    `due_date` DATE NOT NULL,
    `max_marks` INT NOT NULL DEFAULT 100,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_assignments_faculty` FOREIGN KEY (`faculty_id`) 
        REFERENCES `faculty` (`id`) ON DELETE CASCADE,
    INDEX `idx_assignments_due` (`due_date`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 7. Table: submissions
-- Student homework submissions and grading status.
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `submissions`;
CREATE TABLE `submissions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `assignment_id` INT NOT NULL,
    `student_id` INT NOT NULL,
    `submission_text` TEXT,
    `submission_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `status` ENUM('Submitted', 'Graded', 'Late') DEFAULT 'Submitted',
    `marks_obtained` INT DEFAULT NULL,
    `feedback_remarks` TEXT,
    CONSTRAINT `fk_submissions_assignment` FOREIGN KEY (`assignment_id`) 
        REFERENCES `assignments` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_submissions_student` FOREIGN KEY (`student_id`) 
        REFERENCES `students` (`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_submission` (`assignment_id`, `student_id`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 8. Table: events
-- College academic, cultural, and sports events.
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(150) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `event_date` DATETIME NOT NULL,
    `location` VARCHAR(120) NOT NULL,
    `description` TEXT NOT NULL,
    `max_participants` INT DEFAULT 150,
    `created_by` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_events_creator` FOREIGN KEY (`created_by`) 
        REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 9. Table: event_registrations
-- Student registrations for college events.
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `event_registrations`;
CREATE TABLE `event_registrations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `event_id` INT NOT NULL,
    `student_id` INT NOT NULL,
    `registered_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_reg_event` FOREIGN KEY (`event_id`) 
        REFERENCES `events` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_reg_student` FOREIGN KEY (`student_id`) 
        REFERENCES `students` (`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_registration` (`event_id`, `student_id`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 10. Table: announcements
-- Campus-wide circulars and departmental notifications.
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `announcements`;
CREATE TABLE `announcements` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(150) NOT NULL,
    `content` TEXT NOT NULL,
    `target_role` ENUM('all', 'student', 'faculty') DEFAULT 'all',
    `priority` ENUM('low', 'medium', 'high') DEFAULT 'medium',
    `created_by` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_announcements_creator` FOREIGN KEY (`created_by`) 
        REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 11. Table: feedback
-- Student grievances and suggestions for administration.
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `feedback`;
CREATE TABLE `feedback` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT NOT NULL,
    `category` ENUM('Academics', 'Infrastructure', 'Canteen', 'Hostel', 'Library', 'General') NOT NULL,
    `subject` VARCHAR(150) NOT NULL,
    `message` TEXT NOT NULL,
    `rating` INT CHECK (`rating` BETWEEN 1 AND 5),
    `admin_response` TEXT,
    `status` ENUM('Pending', 'Reviewed', 'Resolved') DEFAULT 'Pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_feedback_student` FOREIGN KEY (`student_id`) 
        REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
