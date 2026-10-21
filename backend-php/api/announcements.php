<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';
if ($action === 'list' && $method === 'GET') {
    $role = $_GET['role'] ?? 'all';
    $query = '
        SELECT a.id, a.title, a.content, a.target_role, a.priority, a.created_at,
               u.full_name AS author_name, u.role AS author_role
        FROM announcements a
        LEFT JOIN users u ON a.created_by = u.id
    ';
    $params = [];
    if ($role !== 'admin' && $role !== 'all') {
        $query .= ' WHERE a.target_role IN ("all", :role)';
        $params[':role'] = $role;
    }
    $query .= ' ORDER BY a.created_at DESC LIMIT 30';
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    sendResponse($stmt->fetchAll(), 'Announcements retrieved.');
} elseif ($action === 'create' && $method === 'POST') {
    $data = getRequestData();
    $title      = trim((string)($data['title'] ?? ''));
    $content    = trim((string)($data['content'] ?? ''));
    $targetRole = in_array($data['target_role'] ?? '', ['all', 'student', 'faculty'], true) ? $data['target_role'] : 'all';
    $priority   = in_array($data['priority'] ?? '', ['low', 'medium', 'high'], true) ? $data['priority'] : 'medium';
    $createdBy  = (int)($data['created_by'] ?? ($_SESSION['user']['id'] ?? 1));
    if (empty($title) || empty($content)) {
        sendError('Title and Content are required.', 400);
    }
    $stmt = $pdo->prepare('
        INSERT INTO announcements (title, content, target_role, priority, created_by)
        VALUES (:title, :content, :role, :prio, :cby)
    ');
    $stmt->execute([
        ':title'   => $title,
        ':content' => $content,
        ':role'    => $targetRole,
        ':prio'    => $priority,
        ':cby'     => $createdBy,
    ]);
    sendResponse(['announcement_id' => (int)$pdo->lastInsertId()], 'Announcement broadcasted successfully!', 201);
} elseif ($action === 'delete' && $method === 'POST') {
    $data = getRequestData();
    $id = (int)($data['id'] ?? 0);
    if ($id <= 0) {
        sendError('Announcement ID is required.', 400);
    }
    $stmt = $pdo->prepare('DELETE FROM announcements WHERE id = :id');
    $stmt->execute([':id' => $id]);
    sendResponse(['deleted_id' => $id], 'Announcement removed successfully.');
} else {
    sendError('Invalid action or method.', 400);
}
