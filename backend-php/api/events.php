<?php
/**
 * Smart Campus Connect - College Events API
 * Syllabus: Unit 4 (PHP Server-Side Processing)
 * Manages campus events and student event registrations.
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
    $currentStudentId = 1; // Default for non-session demo testing
}

if ($action === 'list' && $method === 'GET') {
    $category = $_GET['category'] ?? null;

    $query = '
        SELECT e.id, e.title, e.category, e.event_date, e.location, e.description,
               e.max_participants, e.created_at,
               u.full_name AS organizer_name,
               COUNT(er.id) AS registered_count,
               SUM(CASE WHEN er.student_id = :sid THEN 1 ELSE 0 END) AS is_registered
        FROM events e
        LEFT JOIN users u ON e.created_by = u.id
        LEFT JOIN event_registrations er ON er.event_id = e.id
    ';
    $params = [':sid' => $currentStudentId];

    if (!empty($category) && $category !== 'All') {
        $query .= ' WHERE e.category = :cat';
        $params[':cat'] = $category;
    }

    $query .= ' GROUP BY e.id ORDER BY e.event_date ASC';

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $events = $stmt->fetchAll();

    sendResponse($events, 'Events retrieved.');

} elseif ($action === 'register' && $method === 'POST') {
    $data = getRequestData();
    $eventId = (int)($data['event_id'] ?? 0);
    $studentId = (int)($data['student_id'] ?? $currentStudentId);

    if ($eventId <= 0 || $studentId <= 0) {
        sendError('Valid Event ID and Student ID are required.', 400);
    }

    // Check capacity
    $stmtCap = $pdo->prepare('
        SELECT e.max_participants, COUNT(er.id) AS current_regs
        FROM events e
        LEFT JOIN event_registrations er ON er.event_id = e.id
        WHERE e.id = :eid
        GROUP BY e.id
    ');
    $stmtCap->execute([':eid' => $eventId]);
    $capInfo = $stmtCap->fetch();

    if (!$capInfo) {
        sendError('Event not found.', 404);
    }
    if ($capInfo['current_regs'] >= $capInfo['max_participants']) {
        sendError('This event has reached full capacity.', 400);
    }

    try {
        $stmtReg = $pdo->prepare('INSERT INTO event_registrations (event_id, student_id) VALUES (:eid, :sid)');
        $stmtReg->execute([':eid' => $eventId, ':sid' => $studentId]);
        sendResponse(['event_id' => $eventId], 'Registered for event successfully!');
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            sendError('You are already registered for this event.', 409);
        }
        sendError('Registration failed: ' . $e->getMessage(), 500);
    }

} elseif ($action === 'unregister' && $method === 'POST') {
    $data = getRequestData();
    $eventId = (int)($data['event_id'] ?? 0);
    $studentId = (int)($data['student_id'] ?? $currentStudentId);

    $stmt = $pdo->prepare('DELETE FROM event_registrations WHERE event_id = :eid AND student_id = :sid');
    $stmt->execute([':eid' => $eventId, ':sid' => $studentId]);
    sendResponse(['event_id' => $eventId], 'Registration cancelled.');

} elseif ($action === 'create' && $method === 'POST') {
    $data = getRequestData();

    $title       = trim((string)($data['title'] ?? ''));
    $category    = trim((string)($data['category'] ?? 'Technical'));
    $eventDate   = trim((string)($data['event_date'] ?? ''));
    $location    = trim((string)($data['location'] ?? ''));
    $description = trim((string)($data['description'] ?? ''));
    $maxPart     = (int)($data['max_participants'] ?? 100);
    $createdBy   = (int)($data['created_by'] ?? ($_SESSION['user']['id'] ?? 1));

    if (empty($title) || empty($eventDate) || empty($location) || empty($description)) {
        sendError('Title, event date, location, and description are required.', 400);
    }

    $stmt = $pdo->prepare('
        INSERT INTO events (title, category, event_date, location, description, max_participants, created_by)
        VALUES (:title, :cat, :edate, :loc, :descr, :maxp, :cby)
    ');
    $stmt->execute([
        ':title' => $title,
        ':cat'   => $category,
        ':edate' => $eventDate,
        ':loc'   => $location,
        ':descr' => $description,
        ':maxp'  => $maxPart,
        ':cby'   => $createdBy,
    ]);

    sendResponse(['event_id' => (int)$pdo->lastInsertId()], 'Event created successfully!', 201);

} elseif ($action === 'delete' && $method === 'POST') {
    $data = getRequestData();
    $eventId = (int)($data['event_id'] ?? 0);

    if ($eventId <= 0) {
        sendError('Event ID is required.', 400);
    }

    $stmt = $pdo->prepare('DELETE FROM events WHERE id = :eid');
    $stmt->execute([':eid' => $eventId]);
    sendResponse(['deleted_id' => $eventId], 'Event removed successfully.');

} else {
    sendError('Invalid action or method.', 400);
}
