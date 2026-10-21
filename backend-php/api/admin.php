<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'stats';
if ($action === 'stats' && $method === 'GET') {
    $totalStudents = (int)$pdo->query('SELECT COUNT(*) FROM students')->fetchColumn();
    $totalFaculty  = (int)$pdo->query('SELECT COUNT(*) FROM faculty')->fetchColumn();
    $totalCourses  = (int)$pdo->query('SELECT COUNT(*) FROM courses')->fetchColumn();
    $totalEvents   = (int)$pdo->query('SELECT COUNT(*) FROM events')->fetchColumn();
    $pendingFeedback = (int)$pdo->query('SELECT COUNT(*) FROM feedback WHERE status = "Pending"')->fetchColumn();
    $stmtAttRate = $pdo->query('
        SELECT ROUND(
            (SUM(CASE WHEN status IN ("Present", "Late") THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1
        ) FROM attendance
    ');
    $avgAttendance = (float)($stmtAttRate->fetchColumn() ?: 85.0);
    sendResponse([
        'total_students'   => $totalStudents,
        'total_faculty'    => $totalFaculty,
        'total_courses'    => $totalCourses,
        'total_events'     => $totalEvents,
        'pending_feedback' => $pendingFeedback,
        'avg_attendance'   => $avgAttendance,
    ], 'Admin stats retrieved.');
} elseif ($action === 'students' && $method === 'GET') {
    $stmt = $pdo->query('
        SELECT s.id AS student_id, s.roll_number, s.department, s.semester, s.phone, s.cgpa,
               u.id AS user_id, u.full_name, u.email, u.username, u.created_at
        FROM students s
        JOIN users u ON s.user_id = u.id
        ORDER BY s.roll_number ASC
    ');
    sendResponse($stmt->fetchAll(), 'Student list retrieved.');
} elseif ($action === 'add_student' && $method === 'POST') {
    $data = getRequestData();
    $username    = trim((string)($data['username'] ?? ''));
    $email       = trim((string)($data['email'] ?? ''));
    $password    = (string)($data['password'] ?? 'Password@123');
    $fullName    = trim((string)($data['full_name'] ?? ''));
    $rollNumber  = trim((string)($data['roll_number'] ?? ''));
    $department  = trim((string)($data['department'] ?? 'Computer Science & Engineering'));
    $semester    = (int)($data['semester'] ?? 1);
    $phone       = trim((string)($data['phone'] ?? ''));
    $cgpa        = (float)($data['cgpa'] ?? 8.00);
    if (empty($username) || empty($email) || empty($fullName) || empty($rollNumber)) {
        sendError('Username, email, full name, and roll number are required.', 400);
    }
    $hash = password_hash($password, PASSWORD_BCRYPT);
    try {
        $pdo->beginTransaction();
        $stmtUser = $pdo->prepare('INSERT INTO users (username, email, password_hash, role, full_name) VALUES (:un, :em, :ph, "student", :fn)');
        $stmtUser->execute([':un' => $username, ':em' => $email, ':ph' => $hash, ':fn' => $fullName]);
        $userId = (int)$pdo->lastInsertId();
        $stmtStudent = $pdo->prepare('INSERT INTO students (user_id, roll_number, department, semester, phone, cgpa) VALUES (:uid, :roll, :dept, :sem, :phn, :cg)');
        $stmtStudent->execute([
            ':uid'  => $userId,
            ':roll' => $rollNumber,
            ':dept' => $department,
            ':sem'  => $semester,
            ':phn'  => $phone,
            ':cg'   => $cgpa,
        ]);
        $studentId = (int)$pdo->lastInsertId();
        $pdo->commit();
        sendResponse(['student_id' => $studentId, 'user_id' => $userId], 'Student created successfully!', 201);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        sendError('Failed to create student: ' . $e->getMessage(), 409);
    }
} elseif ($action === 'update_student' && $method === 'POST') {
    $data = getRequestData();
    $studentId   = (int)($data['student_id'] ?? 0);
    $fullName    = trim((string)($data['full_name'] ?? ''));
    $email       = trim((string)($data['email'] ?? ''));
    $department  = trim((string)($data['department'] ?? ''));
    $semester    = (int)($data['semester'] ?? 1);
    $phone       = trim((string)($data['phone'] ?? ''));
    $cgpa        = (float)($data['cgpa'] ?? 8.00);
    if ($studentId <= 0) {
        sendError('Student ID is required.', 400);
    }
    $stmtUid = $pdo->prepare('SELECT user_id FROM students WHERE id = :sid');
    $stmtUid->execute([':sid' => $studentId]);
    $userId = (int)$stmtUid->fetchColumn();
    if (!$userId) {
        sendError('Student record not found.', 404);
    }
    try {
        $pdo->beginTransaction();
        if (!empty($fullName) || !empty($email)) {
            $stmtU = $pdo->prepare('UPDATE users SET full_name = :fn, email = :em WHERE id = :uid');
            $stmtU->execute([':fn' => $fullName, ':em' => $email, ':uid' => $userId]);
        }
        $stmtS = $pdo->prepare('UPDATE students SET department = :dept, semester = :sem, phone = :ph, cgpa = :cg WHERE id = :sid');
        $stmtS->execute([':dept' => $department, ':sem' => $semester, ':ph' => $phone, ':cg' => $cgpa, ':sid' => $studentId]);
        $pdo->commit();
        sendResponse(['student_id' => $studentId], 'Student record updated successfully.');
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        sendError('Update failed: ' . $e->getMessage(), 500);
    }
} elseif ($action === 'delete_student' && $method === 'POST') {
    $data = getRequestData();
    $studentId = (int)($data['student_id'] ?? 0);
    if ($studentId <= 0) {
        sendError('Student ID is required.', 400);
    }
    $stmtUid = $pdo->prepare('SELECT user_id FROM students WHERE id = :sid');
    $stmtUid->execute([':sid' => $studentId]);
    $userId = (int)$stmtUid->fetchColumn();
    if ($userId) {
        $stmtDel = $pdo->prepare('DELETE FROM users WHERE id = :uid');
        $stmtDel->execute([':uid' => $userId]);
        sendResponse(['deleted_student_id' => $studentId], 'Student record deleted successfully.');
    } else {
        sendError('Student not found.', 404);
    }
} elseif ($action === 'faculty' && $method === 'GET') {
    $stmt = $pdo->query('
        SELECT f.id AS faculty_id, f.employee_id, f.department, f.designation, f.phone,
               u.id AS user_id, u.full_name, u.email, u.username, u.created_at
        FROM faculty f
        JOIN users u ON f.user_id = u.id
        ORDER BY f.employee_id ASC
    ');
    sendResponse($stmt->fetchAll(), 'Faculty list retrieved.');
} elseif ($action === 'add_faculty' && $method === 'POST') {
    $data = getRequestData();
    $username    = trim((string)($data['username'] ?? ''));
    $email       = trim((string)($data['email'] ?? ''));
    $password    = (string)($data['password'] ?? 'Password@123');
    $fullName    = trim((string)($data['full_name'] ?? ''));
    $employeeId  = trim((string)($data['employee_id'] ?? ''));
    $department  = trim((string)($data['department'] ?? 'Computer Science & Engineering'));
    $designation = trim((string)($data['designation'] ?? 'Assistant Professor'));
    $phone       = trim((string)($data['phone'] ?? ''));
    if (empty($username) || empty($email) || empty($fullName) || empty($employeeId)) {
        sendError('Username, email, full name, and employee ID are required.', 400);
    }
    $hash = password_hash($password, PASSWORD_BCRYPT);
    try {
        $pdo->beginTransaction();
        $stmtUser = $pdo->prepare('INSERT INTO users (username, email, password_hash, role, full_name) VALUES (:un, :em, :ph, "faculty", :fn)');
        $stmtUser->execute([':un' => $username, ':em' => $email, ':ph' => $hash, ':fn' => $fullName]);
        $userId = (int)$pdo->lastInsertId();
        $stmtFac = $pdo->prepare('INSERT INTO faculty (user_id, employee_id, department, designation, phone) VALUES (:uid, :empid, :dept, :desig, :phn)');
        $stmtFac->execute([
            ':uid'   => $userId,
            ':empid' => $employeeId,
            ':dept'  => $department,
            ':desig' => $designation,
            ':phn'   => $phone,
        ]);
        $facultyId = (int)$pdo->lastInsertId();
        $pdo->commit();
        sendResponse(['faculty_id' => $facultyId, 'user_id' => $userId], 'Faculty member registered successfully!', 201);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        sendError('Failed to register faculty: ' . $e->getMessage(), 409);
    }
} elseif ($action === 'delete_faculty' && $method === 'POST') {
    $data = getRequestData();
    $facultyId = (int)($data['faculty_id'] ?? 0);
    if ($facultyId <= 0) {
        sendError('Faculty ID is required.', 400);
    }
    $stmtUid = $pdo->prepare('SELECT user_id FROM faculty WHERE id = :fid');
    $stmtUid->execute([':fid' => $facultyId]);
    $userId = (int)$stmtUid->fetchColumn();
    if ($userId) {
        $stmtDel = $pdo->prepare('DELETE FROM users WHERE id = :uid');
        $stmtDel->execute([':uid' => $userId]);
        sendResponse(['deleted_faculty_id' => $facultyId], 'Faculty member deleted successfully.');
    } else {
        sendError('Faculty record not found.', 404);
    }
} else {
    sendError('Invalid action or method.', 400);
}
