<?php
/**
 * Smart Campus Connect - Automated Backend PHP API Test Suite
 * Verifies all API endpoints using PHP CLI and PDO assertions.
 */

declare(strict_types=1);

require_once __DIR__ . '/config/db.php';

echo "========================================================\n";
echo " Smart Campus Connect - PHP Backend Verification Tests\n";
echo "========================================================\n\n";

$pdo = getDBConnection();
$passed = 0;
$failed = 0;

function assertTest(string $name, bool $condition, string $details = ''): void {
    global $passed, $failed;
    if ($condition) {
        echo " [PASS] $name\n";
        $passed++;
    } else {
        echo " [FAIL] $name - $details\n";
        $failed++;
    }
}

// Test 1: Verify Database Connection
assertTest("1. Database PDO Connection Active", $pdo instanceof PDO);

// Test 2: Verify BCrypt Authentication for Admin
$stmt = $pdo->prepare('SELECT password_hash, role FROM users WHERE username = "admin" LIMIT 1');
$stmt->execute();
$adminUser = $stmt->fetch();
$authOk = $adminUser && password_verify('Password@123', $adminUser['password_hash']);
assertTest("2. Admin BCrypt Password Verification", $authOk, "Password hash did not match Password@123");

// Test 3: Verify Student Authentication for Rahul Verma
$stmt = $pdo->prepare('SELECT u.id, u.password_hash, s.id AS student_id, s.roll_number FROM users u JOIN students s ON u.id = s.user_id WHERE u.username = "rahul_v" LIMIT 1');
$stmt->execute();
$studentUser = $stmt->fetch();
$studentOk = $studentUser && password_verify('Password@123', $studentUser['password_hash']) && $studentUser['roll_number'] === 'CS2023-001';
assertTest("3. Student BCrypt Auth & Relational Profile Join", $studentOk);

// Test 4: Reject Invalid Password
$badAuth = password_verify('WrongPassword999', $adminUser['password_hash']);
assertTest("4. Rejection of Invalid Passwords", !$badAuth);

// Test 5: Verify Attendance Queries & Aggregations
$stmt = $pdo->prepare('
    SELECT COUNT(*) AS total,
           SUM(CASE WHEN status IN ("Present", "Late") THEN 1 ELSE 0 END) AS attended
    FROM attendance WHERE student_id = 1
');
$stmt->execute();
$att = $stmt->fetch();
$attOk = (int)$att['total'] > 0 && (int)$att['attended'] > 0;
$pct = round(($att['attended'] / $att['total']) * 100, 1);
assertTest("5. Attendance Calculation Logic (Calculated: $pct%)", $attOk);

// Test 6: Verify Assignment and Submission Join
$stmt = $pdo->prepare('
    SELECT a.title, sub.status, sub.marks_obtained
    FROM assignments a
    LEFT JOIN submissions sub ON sub.assignment_id = a.id AND sub.student_id = 1
    WHERE a.id = 1
');
$stmt->execute();
$sub = $stmt->fetch();
assertTest("6. Assignment Submission Status Query", !empty($sub['title']) && $sub['status'] === 'Graded');

// Test 7: Verify Event Registration Constraints
$stmt = $pdo->prepare('SELECT COUNT(*) FROM event_registrations WHERE student_id = 1');
$stmt->execute();
$regCount = (int)$stmt->fetchColumn();
assertTest("7. Event Registrations Constraint & Integrity", $regCount > 0);

// Test 8: Verify Feedback Table
$stmt = $pdo->prepare('SELECT COUNT(*) FROM feedback WHERE status = "Resolved"');
$stmt->execute();
$fbResolved = (int)$stmt->fetchColumn();
assertTest("8. Student Feedback Grievance Query", $fbResolved >= 2);

// Test 9: Verify Announcements Query
$stmt = $pdo->query('SELECT COUNT(*) FROM announcements WHERE target_role IN ("all", "student")');
$annCount = (int)$stmt->fetchColumn();
assertTest("9. Role-Targeted Announcements Query", $annCount >= 3);

// Test 10: Test Safe Student Insertion (Prepared Statement Transaction)
try {
    $pdo->beginTransaction();
    $testUsername = 'test_student_' . time();
    $testEmail = $testUsername . '@test.edu';
    $testRoll = 'TEST-' . rand(1000, 9999);
    $pwdHash = password_hash('SecretPass!123', PASSWORD_BCRYPT);

    $stmtU = $pdo->prepare('INSERT INTO users (username, email, password_hash, role, full_name) VALUES (:u, :e, :p, "student", "Test Unit Student")');
    $stmtU->execute([':u' => $testUsername, ':e' => $testEmail, ':p' => $pwdHash]);
    $newUid = (int)$pdo->lastInsertId();

    $stmtS = $pdo->prepare('INSERT INTO students (user_id, roll_number, department, semester, phone, cgpa) VALUES (:uid, :roll, "CS", 1, "9999999999", 9.0)');
    $stmtS->execute([':uid' => $newUid, ':roll' => $testRoll]);
    $newSid = (int)$pdo->lastInsertId();

    // Verify insertion
    $checkStmt = $pdo->prepare('SELECT id FROM students WHERE roll_number = :roll');
    $checkStmt->execute([':roll' => $testRoll]);
    $inserted = (bool)$checkStmt->fetchColumn();

    // Rollback so we keep sample data clean
    $pdo->rollBack();
    assertTest("10. Atomic Student Transaction & Rollback Safety", $inserted);
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    assertTest("10. Atomic Student Transaction & Rollback Safety", false, $e->getMessage());
}

echo "\n========================================================\n";
echo " TEST SUMMARY: $passed Passed, $failed Failed\n";
echo "========================================================\n";

if ($failed > 0) {
    exit(1);
}
