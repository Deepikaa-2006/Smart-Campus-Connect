<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'history';
if ($action === 'students' && $method === 'GET') {
    $department = $_GET['department'] ?? 'Computer Science & Engineering';
    $semester   = isset($_GET['semester']) ? (int)$_GET['semester'] : 6;
    $stmt = $pdo->prepare('
        SELECT s.id AS student_id, s.roll_number, s.department, s.semester,
               u.full_name, u.email
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE s.department = :dept AND s.semester = :sem
        ORDER BY s.roll_number ASC
    ');
    $stmt->execute([':dept' => $department, ':sem' => $semester]);
    sendResponse($stmt->fetchAll(), 'Student roster retrieved.');
} elseif ($action === 'mark' && $method === 'POST') {
    $data = getRequestData();
    $facultyId = (int)($data['faculty_id'] ?? ($_SESSION['user']['faculty_id'] ?? 1));
    $subject   = trim((string)($data['subject'] ?? ''));
    $date      = trim((string)($data['attendance_date'] ?? date('Y-m-d')));
    $records   = $data['records'] ?? [];
    if (empty($subject)) {
        sendError('Subject is required.', 400);
    }
    if (empty($date) || !strtotime($date)) {
        sendError('Valid attendance date is required (YYYY-MM-DD).', 400);
    }
    if (!is_array($records) || empty($records)) {
        sendError('Attendance records array is required.', 400);
    }
    try {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare('
            INSERT INTO attendance (student_id, faculty_id, subject, attendance_date, status, remarks)
            VALUES (:sid, :fid, :subj, :adate, :status, :rem)
            ON DUPLICATE KEY UPDATE
                status = VALUES(status),
                remarks = VALUES(remarks)
        ');
        $insertedCount = 0;
        foreach ($records as $row) {
            $sid    = (int)($row['student_id'] ?? 0);
            $status = in_array($row['status'] ?? '', ['Present', 'Absent', 'Late'], true) ? $row['status'] : 'Present';
            $remark = trim((string)($row['remarks'] ?? ''));
            if ($sid > 0) {
                $stmt->execute([
                    ':sid'    => $sid,
                    ':fid'    => $facultyId,
                    ':subj'   => $subject,
                    ':adate'  => $date,
                    ':status' => $status,
                    ':rem'    => $remark,
                ]);
                $insertedCount++;
            }
        }
        $pdo->commit();
        sendResponse(['records_saved' => $insertedCount, 'date' => $date, 'subject' => $subject], "Attendance successfully recorded for $insertedCount student(s).");
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        sendError('Failed to record attendance: ' . $e->getMessage(), 500);
    }
} elseif ($action === 'history' && $method === 'GET') {
    $subject = $_GET['subject'] ?? null;
    $date    = $_GET['date'] ?? null;
    $sid     = isset($_GET['student_id']) ? (int)$_GET['student_id'] : null;
    $query = '
        SELECT a.id, a.attendance_date, a.subject, a.status, a.remarks,
               s.roll_number, u.full_name AS student_name,
               fu.full_name AS faculty_name
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        JOIN users u ON s.user_id = u.id
        JOIN faculty f ON a.faculty_id = f.id
        JOIN users fu ON f.user_id = fu.id
        WHERE 1=1
    ';
    $params = [];
    if (!empty($subject)) {
        $query .= ' AND a.subject = :subj';
        $params[':subj'] = $subject;
    }
    if (!empty($date)) {
        $query .= ' AND a.attendance_date = :adate';
        $params[':adate'] = $date;
    }
    if ($sid) {
        $query .= ' AND a.student_id = :sid';
        $params[':sid'] = $sid;
    }
    $query .= ' ORDER BY a.attendance_date DESC, s.roll_number ASC LIMIT 100';
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    sendResponse($stmt->fetchAll(), 'Attendance history retrieved.');
} else {
    sendError('Invalid action or method.', 400);
}
