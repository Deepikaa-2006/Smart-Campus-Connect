-- =========================================================
-- Smart Campus Connect - Sample Seed Data
-- Passwords: All accounts default to 'Password@123'
-- BCrypt Hash: $2y$10$NskKgcANNgKWiLnXm3t.be6PT.L/2.M2mQAUm.DprgpFFJ1XrFH2u
-- =========================================================

USE `smart_campus_connect`;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `feedback`;
TRUNCATE TABLE `announcements`;
TRUNCATE TABLE `event_registrations`;
TRUNCATE TABLE `events`;
TRUNCATE TABLE `submissions`;
TRUNCATE TABLE `assignments`;
TRUNCATE TABLE `attendance`;
TRUNCATE TABLE `courses`;
TRUNCATE TABLE `faculty`;
TRUNCATE TABLE `students`;
TRUNCATE TABLE `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------
-- 1. Insert Users (Admin, Faculty, Students)
-- ---------------------------------------------------------
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role`, `full_name`) VALUES
(1, 'admin', 'admin@smartcampus.edu', '$2y$10$NskKgcANNgKWiLnXm3t.be6PT.L/2.M2mQAUm.DprgpFFJ1XrFH2u', 'admin', 'Dr. Ramesh Kumar (Principal)'),
(2, 'prof_sharma', 'sharma@smartcampus.edu', '$2y$10$NskKgcANNgKWiLnXm3t.be6PT.L/2.M2mQAUm.DprgpFFJ1XrFH2u', 'faculty', 'Prof. Rajesh Sharma'),
(3, 'dr_anita', 'anita.deshmukh@smartcampus.edu', '$2y$10$NskKgcANNgKWiLnXm3t.be6PT.L/2.M2mQAUm.DprgpFFJ1XrFH2u', 'faculty', 'Dr. Anita Deshmukh'),
(4, 'rahul_v', 'rahul.verma@smartcampus.edu', '$2y$10$NskKgcANNgKWiLnXm3t.be6PT.L/2.M2mQAUm.DprgpFFJ1XrFH2u', 'student', 'Rahul Verma'),
(5, 'priya_s', 'priya.sharma@smartcampus.edu', '$2y$10$NskKgcANNgKWiLnXm3t.be6PT.L/2.M2mQAUm.DprgpFFJ1XrFH2u', 'student', 'Priya Sharma'),
(6, 'arjun_m', 'arjun.mehta@smartcampus.edu', '$2y$10$NskKgcANNgKWiLnXm3t.be6PT.L/2.M2mQAUm.DprgpFFJ1XrFH2u', 'student', 'Arjun Mehta'),
(7, 'sneha_r', 'sneha.reddy@smartcampus.edu', '$2y$10$NskKgcANNgKWiLnXm3t.be6PT.L/2.M2mQAUm.DprgpFFJ1XrFH2u', 'student', 'Sneha Reddy');

-- ---------------------------------------------------------
-- 2. Insert Faculty Profiles
-- ---------------------------------------------------------
INSERT INTO `faculty` (`id`, `user_id`, `employee_id`, `department`, `designation`, `phone`) VALUES
(1, 2, 'FAC-CS-101', 'Computer Science & Engineering', 'Associate Professor', '9876543210'),
(2, 3, 'FAC-CS-102', 'Computer Science & Engineering', 'Assistant Professor', '9876543211');

-- ---------------------------------------------------------
-- 3. Insert Student Profiles
-- ---------------------------------------------------------
INSERT INTO `students` (`id`, `user_id`, `roll_number`, `department`, `semester`, `phone`, `cgpa`) VALUES
(1, 4, 'CS2023-001', 'Computer Science & Engineering', 6, '9123456780', 8.85),
(2, 5, 'CS2023-002', 'Computer Science & Engineering', 6, '9123456781', 9.15),
(3, 6, 'CS2023-003', 'Computer Science & Engineering', 6, '9123456782', 7.90),
(4, 7, 'CS2023-004', 'Computer Science & Engineering', 6, '9123456783', 8.40);

-- ---------------------------------------------------------
-- 4. Insert Courses
-- ---------------------------------------------------------
INSERT INTO `courses` (`id`, `course_code`, `course_name`, `department`, `credits`, `faculty_id`) VALUES
(1, 'CS601', 'Web Programming', 'Computer Science & Engineering', 4, 1),
(2, 'CS602', 'Database Management Systems', 'Computer Science & Engineering', 4, 2),
(3, 'CS603', 'Computer Networks', 'Computer Science & Engineering', 3, 1);

-- ---------------------------------------------------------
-- 5. Insert Attendance Records
-- ---------------------------------------------------------
INSERT INTO `attendance` (`student_id`, `faculty_id`, `subject`, `attendance_date`, `status`, `remarks`) VALUES
(1, 1, 'Web Programming', '2026-10-01', 'Present', 'On time'),
(1, 1, 'Web Programming', '2026-10-03', 'Present', 'Active in lab'),
(1, 1, 'Web Programming', '2026-10-05', 'Present', 'Good participation'),
(1, 1, 'Web Programming', '2026-10-08', 'Absent', 'Medical leave'),
(1, 2, 'Database Management Systems', '2026-10-02', 'Present', 'SQL query test'),
(1, 2, 'Database Management Systems', '2026-10-04', 'Present', 'Normal lecture'),
(1, 2, 'Database Management Systems', '2026-10-06', 'Present', 'Lab assignment 2'),
(1, 2, 'Database Management Systems', '2026-10-09', 'Present', 'Normal lecture'),

(2, 1, 'Web Programming', '2026-10-01', 'Present', 'On time'),
(2, 1, 'Web Programming', '2026-10-03', 'Present', 'On time'),
(2, 1, 'Web Programming', '2026-10-05', 'Present', 'On time'),
(2, 1, 'Web Programming', '2026-10-08', 'Present', 'On time'),
(2, 2, 'Database Management Systems', '2026-10-02', 'Present', 'On time'),
(2, 2, 'Database Management Systems', '2026-10-04', 'Present', 'On time'),
(2, 2, 'Database Management Systems', '2026-10-06', 'Present', 'On time'),
(2, 2, 'Database Management Systems', '2026-10-09', 'Present', 'On time'),

(3, 1, 'Web Programming', '2026-10-01', 'Absent', 'No prior notice'),
(3, 1, 'Web Programming', '2026-10-03', 'Present', 'Late by 10 mins'),
(3, 1, 'Web Programming', '2026-10-05', 'Present', 'On time'),
(3, 1, 'Web Programming', '2026-10-08', 'Absent', 'Sports tournament');

-- ---------------------------------------------------------
-- 6. Insert Assignments
-- ---------------------------------------------------------
INSERT INTO `assignments` (`id`, `faculty_id`, `subject`, `title`, `description`, `due_date`, `max_marks`) VALUES
(1, 1, 'Web Programming', 'Assignment 1: Responsive Layout with HTML5 & CSS3', 'Create a modern responsive landing page using semantic HTML5 tags and CSS Grid/Flexbox layouts.', '2026-10-25', 100),
(2, 1, 'Web Programming', 'Assignment 2: PHP Form Processing & XML Integration', 'Build a server-side PHP form processor with session validation and export student summaries to an XML file.', '2026-11-05', 100),
(3, 2, 'Database Management Systems', 'Assignment 1: Normalization & Complex SQL Queries', 'Design a 3NF relational schema and write SQL queries for reporting using GROUP BY, JOINs, and subqueries.', '2026-10-20', 50);

-- ---------------------------------------------------------
-- 7. Insert Submissions
-- ---------------------------------------------------------
INSERT INTO `submissions` (`assignment_id`, `student_id`, `submission_text`, `status`, `marks_obtained`, `feedback_remarks`) VALUES
(1, 1, 'https://github.com/rahulverma/web-portal-assignment-1.git - Completed all responsive breakpoints.', 'Graded', 95, 'Excellent clean CSS architecture and accessibility.'),
(1, 2, 'https://github.com/priyasharma/responsive-web-design.git - Tested on Chrome, Firefox, and Safari.', 'Graded', 98, 'Flawless styling and responsive execution.'),
(3, 1, 'Submitted normalization paper and SQL queries text file.', 'Submitted', NULL, NULL);

-- ---------------------------------------------------------
-- 8. Insert Events
-- ---------------------------------------------------------
INSERT INTO `events` (`id`, `title`, `category`, `event_date`, `location`, `description`, `max_participants`, `created_by`) VALUES
(1, 'Smart Campus Hackathon 2026', 'Technical', '2026-10-28 09:00:00', 'Central Computing Center, Block A', '24-hour inter-departmental coding hackathon focusing on Campus Innovation, AI, and Sustainability.', 120, 1),
(2, 'Cloud Native Architecture Workshop', 'Technical', '2026-11-02 14:00:00', 'Seminar Hall 3', 'Hands-on session with industry experts on Docker, Kubernetes, and Serverless architectures.', 80, 2),
(3, 'Tarang 2026 - Annual Cultural Fest', 'Cultural', '2026-11-15 17:00:00', 'College Main Amphitheater', 'Annual cultural festival with musical nights, dance battles, dramatics, and celebrity performances.', 500, 1),
(4, 'Inter-College Sports Meet', 'Sports', '2026-11-20 08:30:00', 'College Sports Complex', 'Football, Basketball, Cricket, and Athletics championship with over 20 participating institutions.', 300, 1);

-- ---------------------------------------------------------
-- 9. Insert Event Registrations
-- ---------------------------------------------------------
INSERT INTO `event_registrations` (`event_id`, `student_id`) VALUES
(1, 1),
(1, 2),
(2, 1),
(3, 1),
(3, 2),
(3, 3);

-- ---------------------------------------------------------
-- 10. Insert Announcements
-- ---------------------------------------------------------
INSERT INTO `announcements` (`id`, `title`, `content`, `target_role`, `priority`, `created_by`) VALUES
(1, 'Mid-Term Semester Examination Schedule', 'The mid-term examination timetable for Semester 6 has been released. Exams commence on November 10th. Check the department notice board or portal for details.', 'all', 'high', 1),
(2, 'Campus Wi-Fi Maintenance Window', 'Central ICT will undergo scheduled maintenance on Saturday between 11:00 PM and 04:00 AM. Internet access may be temporarily interrupted.', 'all', 'low', 1),
(3, 'Web Programming Lab Submission Guidelines', 'Students must submit their GitHub repo links and zip archives via the portal before the deadline. Late submissions incur a 10% penalty.', 'student', 'medium', 2),
(4, 'Faculty Meeting: NAAC Accreditation Review', 'All department heads and faculty members are requested to attend the NAAC review meeting in Conference Room 1 on Friday at 3:00 PM.', 'faculty', 'high', 1);

-- ---------------------------------------------------------
-- 11. Insert Feedback
-- ---------------------------------------------------------
INSERT INTO `feedback` (`id`, `student_id`, `category`, `subject`, `message`, `rating`, `admin_response`, `status`) VALUES
(1, 1, 'Infrastructure', 'Request for additional plug points in Lab 3', 'Many laptops run out of charge during the afternoon 3-hour practical sessions. Additional extension boards or charging docks would help greatly.', 4, 'Electrician team has surveyed Lab 3 and 12 new modular sockets will be installed this Saturday.', 'Resolved'),
(2, 2, 'Library', 'Extended library reading room hours during exam week', 'Could the Central Library reading hall remain open until midnight during the mid-term examination fortnight?', 5, 'Approved. Extended hours till 11:30 PM will take effect starting next Monday.', 'Resolved'),
(3, 3, 'Canteen', 'Improve healthy food options in lunch menu', 'Requesting more fresh fruit salads and millet-based lunch options in the cafeteria.', 3, NULL, 'Pending');
