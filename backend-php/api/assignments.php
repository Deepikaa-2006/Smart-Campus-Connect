<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';
if ($action === 'list' && $method === 'GET') {
    $facultyId = isset($_GET['faculty_id']) ? (int)$_GET['faculty_id'] : null;
    $query = '
        SELECT a.id, a.subject, a.title, a.description, a.due_date, a.max_marks, a.created_at,
               u.full_name AS faculty_name, f.department,
               COUNT(sub.id) AS total_submissions,
               SUM(CASE WHEN sub.status = "Graded" THEN 1 ELSE 0 END) AS graded_submissions
        FROM assignments a
        JOIN faculty f ON a.faculty_id = f.id
        JOIN users u ON f.user_id = u.id
        LEFT JOIN submissions sub ON sub.assignment_id = a.id
    ';
    $params = [];
    if ($facultyId) {
        $query .= ' WHERE a.faculty_id = :fid';
        $params[':fid'] = $facultyId;
    }
    $query .= ' GROUP BY a.id ORDER BY a.due_date DESC';
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    sendResponse($stmt->fetchAll(), 'Assignments list retrieved.');
} elseif ($action === 'create' && $method === 'POST') {
    $data = getRequestData();
    $facultyId   = (int)($data['faculty_id'] ?? ($_SESSION['user']['faculty_id'] ?? 1));
    $subject     = trim((string)($data['subject'] ?? ''));
    $title       = trim((string)($data['title'] ?? ''));
    $description = trim((string)($data['description'] ?? ''));
    $dueDate     = trim((string)($data['due_date'] ?? ''));
    $maxMarks    = (int)($data['max_marks'] ?? 100);
    $errors = [];
    if (empty($subject)) $errors['subject'] = 'Subject is required.';
    if (strlen($title) < 3) $errors['title'] = 'Title must be at least 3 characters.';
    if (empty($description)) $errors['description'] = 'Description is required.';
    if (empty($dueDate) || !strtotime($dueDate)) $errors['due_date'] = 'Valid due date is required.';
    if ($maxMarks <= 0) $errors['max_marks'] = 'Maximum marks must be greater than 0.';
    if (!empty($errors)) {
        sendError('Please correct the validation errors.', 422, $errors);
    }
    $stmt = $pdo->prepare('
        INSERT INTO assignments (faculty_id, subject, title, description, due_date, max_marks)
        VALUES (:fid, :subj, :title, :descr, :due, :marks)
    ');
    $stmt->execute([
        ':fid'   => $facultyId,
        ':subj'  => $subject,
        ':title' => $title,
        ':descr' => $description,
        ':due'   => $dueDate,
        ':marks' => $maxMarks,
    ]);
    $newId = (int)$pdo->lastInsertId();
    sendResponse(['assignment_id' => $newId], 'Assignment created successfully!', 201);
} elseif ($action === 'submissions' && $method === 'GET') {
    $assignmentId = (int)($_GET['assignment_id'] ?? 0);
    if ($assignmentId <= 0) {
        sendError('Assignment ID is required.', 400);
    }
    $stmt = $pdo->prepare('
        SELECT sub.id AS submission_id, sub.assignment_id, sub.student_id,
               sub.submission_text, sub.submission_date, sub.status,
               sub.marks_obtained, sub.feedback_remarks,
               s.roll_number, u.full_name AS student_name, u.email AS student_email
        FROM submissions sub
        JOIN students s ON sub.student_id = s.id
        JOIN users u ON s.user_id = u.id
        WHERE sub.assignment_id = :aid
        ORDER BY sub.submission_date DESC
    ');
    $stmt->execute([':aid' => $assignmentId]);
    sendResponse($stmt->fetchAll(), 'Assignment submissions retrieved.');
} elseif ($action === 'grade' && $method === 'POST') {
    $data = getRequestData();
    $submissionId = (int)($data['submission_id'] ?? 0);
    $marks        = isset($data['marks_obtained']) ? (int)$data['marks_obtained'] : null;
    $remarks      = trim((string)($data['feedback_remarks'] ?? ''));
    if ($submissionId <= 0 || $marks === null) {
        sendError('Submission ID and Marks obtained are required.', 400);
    }
    $stmt = $pdo->prepare('
        UPDATE submissions
        SET marks_obtained = :marks,
            feedback_remarks = :remarks,
            status = "Graded"
        WHERE id = :sub_id
    ');
    $stmt->execute([
        ':marks'   => $marks,
        ':remarks' => $remarks,
        ':sub_id'  => $submissionId,
    ]);
    sendResponse(['submission_id' => $submissionId], 'Submission graded successfully!');
} elseif ($action === 'delete' && $method === 'POST') {
    $data = getRequestData();
    $assignmentId = (int)($data['assignment_id'] ?? 0);
    if ($assignmentId <= 0) {
        sendError('Assignment ID is required.', 400);
    }
    $stmt = $pdo->prepare('DELETE FROM assignments WHERE id = :aid');
    $stmt->execute([':aid' => $assignmentId]);
    sendResponse(['deleted_id' => $assignmentId], 'Assignment deleted successfully.');
} else {
    sendError('Invalid action or method.', 400);
}
