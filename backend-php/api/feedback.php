<?php
/**
 * Smart Campus Connect - Feedback API
 * Syllabus: Unit 4 (PHP Server-Side Processing)
 * Handles grievance submission by students and administrator resolution.
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';

$currentStudentId = null;
if (isset($_SESSION['user']) && $_SESSION['user']['role'] === 'student') {
    $currentStudentId = (int)($_SESSION['user']['student_id'] ?? 0);
} elseif (isset($_GET['student_id'])) {
    $currentStudentId = (int)$_GET['student_id'];
}
if (!$currentStudentId) {
    $currentStudentId = 1;
}

if ($action === 'submit' && $method === 'POST') {
    $data = getRequestData();

    $studentId = (int)($data['student_id'] ?? $currentStudentId);
    $category  = trim((string)($data['category'] ?? 'General'));
    $subject   = trim((string)($data['subject'] ?? ''));
    $message   = trim((string)($data['message'] ?? ''));
    $rating    = (int)($data['rating'] ?? 5);

    $allowedCategories = ['Academics', 'Infrastructure', 'Canteen', 'Hostel', 'Library', 'General'];
    if (!in_array($category, $allowedCategories, true)) {
        $category = 'General';
    }

    if (empty($subject) || empty($message)) {
        sendError('Subject and message content are required.', 400);
    }
    if ($rating < 1 || $rating > 5) {
        $rating = 5;
    }

    $stmt = $pdo->prepare('
        INSERT INTO feedback (student_id, category, subject, message, rating, status)
        VALUES (:sid, :cat, :subj, :msg, :rating, "Pending")
    ');
    $stmt->execute([
        ':sid'    => $studentId,
        ':cat'    => $category,
        ':subj'   => $subject,
        ':msg'    => $message,
        ':rating' => $rating,
    ]);

    sendResponse(['feedback_id' => (int)$pdo->lastInsertId()], 'Thank you! Your feedback has been submitted to administration.', 201);

} elseif ($action === 'list' && $method === 'GET') {
    $role = $_SESSION['user']['role'] ?? ($_GET['role'] ?? 'admin');

    $query = '
        SELECT f.id, f.category, f.subject, f.message, f.rating, f.admin_response, f.status, f.created_at,
               s.roll_number, u.full_name AS student_name, u.email AS student_email
        FROM feedback f
        JOIN students s ON f.student_id = s.id
        JOIN users u ON s.user_id = u.id
    ';
    $params = [];

    if ($role === 'student') {
        $query .= ' WHERE f.student_id = :sid';
        $params[':sid'] = $currentStudentId;
    }

    $query .= ' ORDER BY f.created_at DESC';

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    sendResponse($stmt->fetchAll(), 'Feedback records retrieved.');

} elseif ($action === 'respond' && $method === 'POST') {
    $data = getRequestData();

    $feedbackId = (int)($data['feedback_id'] ?? 0);
    $response   = trim((string)($data['admin_response'] ?? ''));
    $status     = in_array($data['status'] ?? '', ['Pending', 'Reviewed', 'Resolved'], true) ? $data['status'] : 'Resolved';

    if ($feedbackId <= 0 || empty($response)) {
        sendError('Feedback ID and admin response text are required.', 400);
    }

    $stmt = $pdo->prepare('
        UPDATE feedback
        SET admin_response = :resp,
            status = :st
        WHERE id = :fid
    ');
    $stmt->execute([
        ':resp' => $response,
        ':st'   => $status,
        ':fid'  => $feedbackId,
    ]);

    sendResponse(['feedback_id' => $feedbackId], 'Feedback response recorded and marked ' . $status);

} else {
    sendError('Invalid action or method.', 400);
}
