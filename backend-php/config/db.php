<?php
/**
 * Smart Campus Connect - Database Configuration & API Utilities
 * Syllabus: Unit 4 (PHP Server-Side Processing)
 * Uses PDO with Prepared Statements for SQL Injection Prevention.
 */

declare(strict_types=1);

// Enable session support
if (session_status() === PHP_SESSION_NONE) {
    // Secure session cookies
    ini_set('session.cookie_httponly', '1');
    ini_set('session.use_only_cookies', '1');
    session_start();
}

// Global CORS & JSON Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS request
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Returns a configured PDO Database instance.
 */
function getDBConnection(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $host = '127.0.0.1';
        $port = 3306;
        $db   = 'smart_campus_connect';
        $user = 'root';
        $pass = ''; // Default XAMPP MySQL password

        $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false, // Enforce true native prepared statements
        ];

        try {
            $pdo = new PDO($dsn, $user, $pass, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Database connection failed: ' . $e->getMessage()
            ]);
            exit();
        }
    }
    return $pdo;
}

/**
 * Standardized success response sender.
 */
function sendResponse(mixed $data = null, string $message = 'Success', int $statusCode = 200): void {
    http_response_code($statusCode);
    echo json_encode([
        'success' => true,
        'message' => $message,
        'data'    => $data,
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

/**
 * Standardized error response sender.
 */
function sendError(string $message, int $statusCode = 400, array $errors = []): void {
    http_response_code($statusCode);
    echo json_encode([
        'success' => false,
        'message' => $message,
        'errors'  => $errors,
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

/**
 * Extracts JSON body or fallback to $_POST.
 */
function getRequestData(): array {
    $raw = file_get_contents('php://input');
    if (!empty($raw)) {
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            return $decoded;
        }
    }
    return $_POST ?? [];
}

/**
 * Validates session authentication and user roles.
 */
function requireAuth(array $allowedRoles = []): array {
    if (!isset($_SESSION['user'])) {
        sendError('Unauthorized: Please log in to continue.', 401);
    }
    $user = $_SESSION['user'];
    if (!empty($allowedRoles) && !in_array($user['role'], $allowedRoles, true)) {
        sendError('Forbidden: You do not have permission to perform this action.', 403);
    }
    return $user;
}
