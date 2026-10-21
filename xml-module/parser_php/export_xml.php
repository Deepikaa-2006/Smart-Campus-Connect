<?php
/**
 * Smart Campus Connect - XML Academic Report Generator
 * Syllabus: Unit 5 (XML Generation using PHP DOMDocument)
 * Exports live student academic and attendance data from MySQL to XML.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../backend-php/config/db.php';

$pdo = getDBConnection();
$format = $_GET['format'] ?? 'xml';

// Query all students
$stmtStudents = $pdo->query('
    SELECT s.id AS student_id, s.roll_number, s.department, s.semester, s.cgpa,
           u.full_name, u.email
    FROM students s
    JOIN users u ON s.user_id = u.id
    ORDER BY s.roll_number ASC
');
$students = $stmtStudents->fetchAll();

// Initialize DOMDocument
$dom = new DOMDocument('1.0', 'UTF-8');
$dom->formatOutput = true;

// Root Element
$root = $dom->createElementNS('http://smartcampus.edu/report', 'CampusAcademicReport');
$root->setAttributeNS('http://www.w3.org/2001/XMLSchema-instance', 'xsi:schemaLocation', 'http://smartcampus.edu/report ../schema/campus_report.xsd');
$root->setAttribute('version', '1.0');
$dom->appendChild($root);

// Institution metadata
$inst = $dom->createElement('Institution');
$inst->appendChild($dom->createTextNode('Smart Campus Institute of Engineering & Technology'));
$root->appendChild($inst);

$date = $dom->createElement('GeneratedDate', date('c'));
$root->appendChild($date);

// Students Container
$studentsNode = $dom->createElement('Students');
$root->appendChild($studentsNode);

foreach ($students as $s) {
    $sid = (int)$s['student_id'];

    $studentNode = $dom->createElement('Student');
    $studentNode->setAttribute('id', (string)$sid);

    $rollEl = $dom->createElement('RollNumber');
    $rollEl->appendChild($dom->createTextNode($s['roll_number']));
    $studentNode->appendChild($rollEl);

    $nameEl = $dom->createElement('FullName');
    $nameEl->appendChild($dom->createTextNode($s['full_name']));
    $studentNode->appendChild($nameEl);

    $deptEl = $dom->createElement('Department');
    $deptEl->appendChild($dom->createTextNode($s['department']));
    $studentNode->appendChild($deptEl);

    $studentNode->appendChild($dom->createElement('Semester', (string)$s['semester']));
    $studentNode->appendChild($dom->createElement('CGPA', number_format((float)$s['cgpa'], 2, '.', '')));

    // Attendance Summary calculation
    $stmtAtt = $pdo->prepare('
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN status IN ("Present", "Late") THEN 1 ELSE 0 END) AS attended
        FROM attendance WHERE student_id = :sid
    ');
    $stmtAtt->execute([':sid' => $sid]);
    $att = $stmtAtt->fetch();
    $total = (int)($att['total'] ?? 0);
    $attended = (int)($att['attended'] ?? 0);
    $pct = $total > 0 ? round(($attended / $total) * 100, 1) : 0.0;

    $attSummary = $dom->createElement('AttendanceSummary');
    $attSummary->appendChild($dom->createElement('TotalClasses', (string)$total));
    $attSummary->appendChild($dom->createElement('AttendedClasses', (string)$attended));
    $attSummary->appendChild($dom->createElement('Percentage', number_format($pct, 1, '.', '')));
    $statusText = $pct >= 75 ? 'Eligible' : ($pct >= 65 ? 'Warning' : 'Critical Shortage');
    $attSummary->appendChild($dom->createElement('EligibilityStatus', $statusText));
    $studentNode->appendChild($attSummary);

    // Subject breakdown
    $stmtSubj = $pdo->prepare('
        SELECT subject,
               COUNT(*) AS total_l,
               SUM(CASE WHEN status IN ("Present", "Late") THEN 1 ELSE 0 END) AS attended_l
        FROM attendance WHERE student_id = :sid
        GROUP BY subject
    ');
    $stmtSubj->execute([':sid' => $sid]);
    $subjects = $stmtSubj->fetchAll();

    $coursesNode = $dom->createElement('Courses');
    if (!empty($subjects)) {
        foreach ($subjects as $idx => $sub) {
            $courseNode = $dom->createElement('Course');
            $courseNode->appendChild($dom->createElement('Code', 'CS' . (601 + $idx)));
            $cTitleEl = $dom->createElement('Title');
            $cTitleEl->appendChild($dom->createTextNode($sub['subject']));
            $courseNode->appendChild($cTitleEl);
            $subTotal = (int)$sub['total_l'];
            $subAtt = (int)$sub['attended_l'];
            $subPct = $subTotal > 0 ? round(($subAtt / $subTotal) * 100, 1) : 0.0;
            $courseNode->appendChild($dom->createElement('AttendanceRate', number_format($subPct, 1, '.', '')));
            $coursesNode->appendChild($courseNode);
        }
    } else {
        $courseNode = $dom->createElement('Course');
        $courseNode->appendChild($dom->createElement('Code', 'CS601'));
        $cTitleEl = $dom->createElement('Title');
        $cTitleEl->appendChild($dom->createTextNode('Web Programming'));
        $courseNode->appendChild($cTitleEl);
        $courseNode->appendChild($dom->createElement('AttendanceRate', '0.0'));
        $coursesNode->appendChild($courseNode);
    }
    $studentNode->appendChild($coursesNode);

    $studentsNode->appendChild($studentNode);
}

$xmlString = $dom->saveXML();

if ($format === 'json') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => true,
        'xml'     => $xmlString,
        'message' => 'XML report generated successfully from live MySQL records.'
    ], JSON_PRETTY_PRINT);
} else {
    header('Content-Type: application/xml; charset=utf-8');
    echo $xmlString;
}
