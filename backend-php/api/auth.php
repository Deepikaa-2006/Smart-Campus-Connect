<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? ($method === 'POST' ? 'login' : 'me');

if ($action === 'login' && $method === 'POST') {
    $data = getRequestData();
    $username = trim($data['username'] ?? '');
    $password = (string)($data['password'] ?? '');

    if (empty($username) || empty($password)) {
        sendError('Username/Email and Password are required.', 400);
    }

    // Prepared statement to fetch user safely
    $stmt = $pdo->prepare('SELECT id, username, email, password_hash, role, full_name FROM users WHERE username = :uname OR email = :uemail LIMIT 1');
    $stmt->execute([':uname' => $username, ':uemail' => $username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        sendError('Invalid username or password.', 401);
    }

    // Unset hash from session and client payload
    unset($user['password_hash']);

    // Fetch role-specific profile data
    if ($user['role'] === 'student') {
        $stmtStudent = $pdo->prepare('SELECT id AS student_id, roll_number, department, semester, phone, cgpa FROM students WHERE user_id = :uid LIMIT 1');
        $stmtStudent->execute([':uid' => $user['id']]);
        $studentData = $stmtStudent->fetch();
        if ($studentData) {
            $user = array_merge($user, $studentData);
        }
    } elseif ($user['role'] === 'faculty') {
        $stmtFaculty = $pdo->prepare('SELECT id AS faculty_id, employee_id, department, designation, phone FROM faculty WHERE user_id = :uid LIMIT 1');
        $stmtFaculty->execute([':uid' => $user['id']]);
        $facultyData = $stmtFaculty->fetch();
        if ($facultyData) {
            $user = array_merge($user, $facultyData);
        }
    }

    $_SESSION['user'] = $user;
    sendResponse($user, 'Login successful.');

} elseif ($action === 'register' && $method === 'POST') {
    $data = getRequestData();

    $username    = trim($data['username'] ?? '');
    $email       = trim($data['email'] ?? '');
    $password    = (string)($data['password'] ?? '');
    $fullName    = trim($data['full_name'] ?? '');
    $rollNumber  = trim($data['roll_number'] ?? '');
    $department  = trim($data['department'] ?? 'Computer Science & Engineering');
    $semester    = (int)($data['semester'] ?? 1);
    $phone       = trim($data['phone'] ?? '');

    // Server-Side Input Validation
    $errors = [];
    if (strlen($username) < 3 || !preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
        $errors['username'] = 'Username must be at least 3 characters and contain only letters, numbers, and underscores.';
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'A valid email address is required.';
    }
    if (strlen($password) < 6) {
        $errors['password'] = 'Password must be at least 6 characters long.';
    }
    if (strlen($fullName) < 2) {
        $errors['full_name'] = 'Full name must be at least 2 characters.';
    }
    if (empty($rollNumber)) {
        $errors['roll_number'] = 'Roll number is required.';
    }
    if ($semester < 1 || $semester > 8) {
        $errors['semester'] = 'Semester must be between 1 and 8.';
    }
    if (!empty($phone) && !preg_match('/^[0-9+\-\s]{7,15}$/', $phone)) {
        $errors['phone'] = 'Please enter a valid phone number.';
    }

    if (!empty($errors)) {
        sendError('Validation failed. Please correct the highlighted fields.', 422, $errors);
    }

    // Check uniqueness using prepared statements
    $stmtCheck = $pdo->prepare('SELECT id, username, email FROM users WHERE username = :uname OR email = :uemail LIMIT 1');
    $stmtCheck->execute([':uname' => $username, ':uemail' => $email]);
    if ($existing = $stmtCheck->fetch()) {
        if ($existing['username'] === $username) {
            sendError('This username is already taken.', 409, ['username' => 'Username already registered.']);
        } else {
            sendError('This email is already registered.', 409, ['email' => 'Email already registered.']);
        }
    }

    $stmtRoll = $pdo->prepare('SELECT id FROM students WHERE roll_number = :roll LIMIT 1');
    $stmtRoll->execute([':roll' => $rollNumber]);
    if ($stmtRoll->fetch()) {
        sendError('This roll number is already registered in the system.', 409, ['roll_number' => 'Roll number exists.']);
    }

    // Password Hashing via BCrypt
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    // Atomic transaction for relational consistency
    try {
        $pdo->beginTransaction();

        $stmtUser = $pdo->prepare('INSERT INTO users (username, email, password_hash, role, full_name) VALUES (:uname, :uemail, :pwd, "student", :fname)');
        $stmtUser->execute([
            ':uname' => $username,
            ':uemail' => $email,
            ':pwd'   => $passwordHash,
            ':fname' => $fullName,
        ]);
        $userId = (int)$pdo->lastInsertId();

        $stmtStudent = $pdo->prepare('INSERT INTO students (user_id, roll_number, department, semester, phone, cgpa) VALUES (:uid, :roll, :dept, :sem, :phone, 8.00)');
        $stmtStudent->execute([
            ':uid'   => $userId,
            ':roll'  => $rollNumber,
            ':dept'  => $department,
            ':sem'   => $semester,
            ':phone' => $phone,
        ]);
        $studentId = (int)$pdo->lastInsertId();

        $pdo->commit();

        $newUser = [
            'id'          => $userId,
            'student_id'  => $studentId,
            'username'    => $username,
            'email'       => $email,
            'role'        => 'student',
            'full_name'   => $fullName,
            'roll_number' => $rollNumber,
            'department'  => $department,
            'semester'    => $semester,
            'phone'       => $phone,
            'cgpa'        => 8.00
        ];

        $_SESSION['user'] = $newUser;
        sendResponse($newUser, 'Registration successful! Welcome to Smart Campus Connect.', 201);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        sendError('Failed to complete registration: ' . $e->getMessage(), 500);
    }

} elseif ($action === 'me') {
    if (isset($_SESSION['user'])) {
        sendResponse($_SESSION['user'], 'Session active.');
    } else {
        sendResponse(null, 'No active session.', 200);
    }

} elseif ($action === 'logout' && $method === 'POST') {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params['path'], $params['domain'],
            $params['secure'], $params['httponly']
        );
    }
    session_destroy();
    sendResponse(null, 'Logged out successfully.');

} else {
    sendError('Invalid action or request method.', 400);
}
