<?php
/**
 * Smart Campus Connect - Student API Endpoint
 * Handles student dashboard analytics, attendance history, assignments, and submissions.
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'dashboard';

// Determine student_id from session or parameter (if admin/faculty inspecting)
$studentId = null;
if (isset($_SESSION['user']) && $_SESSION['user']['role'] === 'student') {
    $studentId = (int)($_SESSION['user']['student_id'] ?? 0);
} elseif (isset($_GET['student_id'])) {
    $studentId = (int)$_GET['student_id'];
}

// Fallback to default student #1 (Rahul Verma) if test/demo mode without active session cookie
if (!$studentId) {
    $studentId = 1;
}

if ($action === 'dashboard' && $method === 'GET') {
    // 1. Fetch Student Profile
    $stmtProfile = $pdo->prepare('
        SELECT s.id AS student_id, s.roll_number, s.department, s.semester, s.phone, s.cgpa,
               u.id AS user_id, u.full_name, u.email, u.username
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = :sid
        LIMIT 1
    ');
    $stmtProfile->execute([':sid' => $studentId]);
    $profile = $stmtProfile->fetch();

    if (!$profile) {
        sendError('Student record not found.', 404);
    }

    // 2. Attendance Summary
    $stmtAttTotal = $pdo->prepare('SELECT COUNT(*) FROM attendance WHERE student_id = :sid');
    $stmtAttTotal->execute([':sid' => $studentId]);
    $totalClasses = (int)$stmtAttTotal->fetchColumn();

    $stmtAttPresent = $pdo->prepare('SELECT COUNT(*) FROM attendance WHERE student_id = :sid AND status IN ("Present", "Late")');
    $stmtAttPresent->execute([':sid' => $studentId]);
    $attendedClasses = (int)$stmtAttPresent->fetchColumn();

    $attendancePercentage = $totalClasses > 0 ? round(($attendedClasses / $totalClasses) * 100, 1) : 0;

    // 3. Subject-wise Attendance Breakdown
    $stmtSubjectAtt = $pdo->prepare('
        SELECT subject,
               COUNT(*) AS total_lectures,
               SUM(CASE WHEN status IN ("Present", "Late") THEN 1 ELSE 0 END) AS attended,
               ROUND((SUM(CASE WHEN status IN ("Present", "Late") THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1) AS percentage
        FROM attendance
        WHERE student_id = :sid
        GROUP BY subject
    ');
    $stmtSubjectAtt->execute([':sid' => $studentId]);
    $subjectAttendance = $stmtSubjectAtt->fetchAll();

    // 4. Assignments & Submission Status
    $stmtAssignments = $pdo->prepare('
        SELECT a.id AS assignment_id, a.subject, a.title, a.description, a.due_date, a.max_marks,
               u.full_name AS faculty_name,
               sub.id AS submission_id, sub.status AS submission_status, sub.submission_date,
               sub.marks_obtained, sub.feedback_remarks
        FROM assignments a
        JOIN faculty f ON a.faculty_id = f.id
        JOIN users u ON f.user_id = u.id
        LEFT JOIN submissions sub ON sub.assignment_id = a.id AND sub.student_id = :sid
        ORDER BY a.due_date ASC
    ');
    $stmtAssignments->execute([':sid' => $studentId]);
    $assignments = $stmtAssignments->fetchAll();

    // 5. Recent Announcements
    $stmtAnnouncements = $pdo->query('
        SELECT a.id, a.title, a.content, a.priority, a.created_at, u.full_name AS author_name
        FROM announcements a
        LEFT JOIN users u ON a.created_by = u.id
        WHERE a.target_role IN ("all", "student")
        ORDER BY a.created_at DESC
        LIMIT 5
    ');
    $announcements = $stmtAnnouncements->fetchAll();

    // 6. Upcoming Events & Registration Status
    $stmtEvents = $pdo->prepare('
        SELECT e.id, e.title, e.category, e.event_date, e.location, e.description,
               (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id) AS registered_count,
               CASE WHEN my_reg.id IS NOT NULL THEN 1 ELSE 0 END AS is_registered
        FROM events e
        LEFT JOIN event_registrations my_reg ON my_reg.event_id = e.id AND my_reg.student_id = :sid
        ORDER BY e.event_date ASC
        LIMIT 4
    ');
    $stmtEvents->execute([':sid' => $studentId]);
    $events = $stmtEvents->fetchAll();

    sendResponse([
        'profile'             => $profile,
        'attendance_summary'  => [
            'total_classes'    => $totalClasses,
            'attended_classes' => $attendedClasses,
            'percentage'       => $attendancePercentage,
            'status'           => $attendancePercentage >= 75 ? 'Safe' : 'Low Attendance Warning'
        ],
        'subject_attendance'  => $subjectAttendance,
        'assignments'         => $assignments,
        'announcements'       => $announcements,
        'events'              => $events,
    ], 'Student dashboard loaded successfully.');

} elseif ($action === 'attendance' && $method === 'GET') {
    // Detailed Attendance Log
    $stmt = $pdo->prepare('
        SELECT a.id, a.subject, a.attendance_date, a.status, a.remarks,
               u.full_name AS faculty_name
        FROM attendance a
        JOIN faculty f ON a.faculty_id = f.id
        JOIN users u ON f.user_id = u.id
        WHERE a.student_id = :sid
        ORDER BY a.attendance_date DESC
    ');
    $stmt->execute([':sid' => $studentId]);
    sendResponse($stmt->fetchAll(), 'Attendance history retrieved.');

} elseif ($action === 'assignments' && $method === 'GET') {
    $stmt = $pdo->prepare('
        SELECT a.id, a.subject, a.title, a.description, a.due_date, a.max_marks,
               u.full_name AS faculty_name,
               sub.id AS submission_id, sub.status AS submission_status, sub.submission_text,
               sub.submission_date, sub.marks_obtained, sub.feedback_remarks
        FROM assignments a
        JOIN faculty f ON a.faculty_id = f.id
        JOIN users u ON f.user_id = u.id
        LEFT JOIN submissions sub ON sub.assignment_id = a.id AND sub.student_id = :sid
        ORDER BY a.due_date ASC
    ');
    $stmt->execute([':sid' => $studentId]);
    sendResponse($stmt->fetchAll(), 'Assignments retrieved.');

} elseif ($action === 'submit_assignment' && $method === 'POST') {
    $data = getRequestData();
    $assignmentId = (int)($data['assignment_id'] ?? 0);
    $submissionText = trim((string)($data['submission_text'] ?? ''));

    if ($assignmentId <= 0 || empty($submissionText)) {
        sendError('Assignment ID and submission content/link are required.', 400);
    }

    $stmt = $pdo->prepare('
        INSERT INTO submissions (assignment_id, student_id, submission_text, status, submission_date)
        VALUES (:aid, :sid, :stext, "Submitted", NOW())
        ON DUPLICATE KEY UPDATE
            submission_text = VALUES(submission_text),
            submission_date = NOW(),
            status = "Submitted"
    ');
    $stmt->execute([
        ':aid'   => $assignmentId,
        ':sid'   => $studentId,
        ':stext' => $submissionText,
    ]);

    sendResponse(['assignment_id' => $assignmentId], 'Assignment submitted successfully!');

} else {
    sendError('Invalid action or method.', 400);
}
