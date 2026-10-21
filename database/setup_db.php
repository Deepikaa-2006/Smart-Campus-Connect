<?php
/**
 * Smart Campus Connect - Database Setup & Migration Script
 * Automatically sets up MySQL database, tables, and seed data.
 */

declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');

$host = '127.0.0.1';
$port = 3306;
$user = 'root';
$pass = ''; // Default XAMPP password is empty

echo "====================================================\n";
echo " Smart Campus Connect - Automated Database Setup\n";
echo "====================================================\n\n";

try {
    echo "[1/4] Connecting to MySQL server on $host:$port...\n";
    $pdo = new PDO("mysql:host=$host;port=$port;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    echo "      Connected successfully!\n\n";

    echo "[2/4] Executing database/schema.sql...\n";
    $schemaFile = __DIR__ . '/schema.sql';
    if (!file_exists($schemaFile)) {
        throw new Exception("schema.sql not found at $schemaFile");
    }
    $schemaSql = file_get_contents($schemaFile);
    $pdo->exec($schemaSql);
    echo "      Schema created successfully!\n\n";

    echo "[3/4] Executing database/sample_data.sql...\n";
    $sampleFile = __DIR__ . '/sample_data.sql';
    if (!file_exists($sampleFile)) {
        throw new Exception("sample_data.sql not found at $sampleFile");
    }
    $sampleSql = file_get_contents($sampleFile);
    $pdo->exec($sampleSql);
    echo "      Sample data seeded successfully!\n\n";

    echo "[4/4] Verifying table records in `smart_campus_connect`:\n";
    $pdo->exec("USE `smart_campus_connect`");
    $tables = ['users', 'students', 'faculty', 'courses', 'attendance', 'assignments', 'submissions', 'events', 'event_registrations', 'announcements', 'feedback'];
    
    foreach ($tables as $t) {
        $stmt = $pdo->query("SELECT COUNT(*) AS cnt FROM `$t`");
        $cnt = $stmt->fetchColumn();
        printf("      %-22s : %d records\n", $t, (int)$cnt);
    }

    echo "\n====================================================\n";
    echo " ALL DATABASE CHECKS PASSED SUCCESSFULLY!\n";
    echo " Default accounts created:\n";
    echo "  - Admin:   username='admin'         password='Password@123'\n";
    echo "  - Faculty: username='prof_sharma'   password='Password@123'\n";
    echo "  - Student: username='rahul_v'       password='Password@123'\n";
    echo "====================================================\n";

} catch (PDOException $e) {
    echo "\n[ERROR] Database error: " . $e->getMessage() . "\n";
    exit(1);
} catch (Exception $e) {
    echo "\n[ERROR] General error: " . $e->getMessage() . "\n";
    exit(1);
}
