<?php
/**
 * Smart Campus Connect - XML Ingestion Parser
 * Syllabus: Unit 5 (XML Parsing using PHP SimpleXMLElement)
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$rawInput = file_get_contents('php://input');
$data = !empty($rawInput) ? json_decode($rawInput, true) : null;
$xmlString = $data['xml'] ?? null;

if (empty($xmlString)) {
    $samplePath = __DIR__ . '/../data/sample_report.xml';
    $xmlString = file_get_contents($samplePath);
}

libxml_use_internal_errors(true);
$xml = simplexml_load_string($xmlString);

if ($xml === false) {
    $errors = [];
    foreach (libxml_get_errors() as $e) {
        $errors[] = trim($e->message);
    }
    libxml_clear_errors();
    echo json_encode([
        'success' => false,
        'message' => 'Failed to parse XML document.',
        'errors'  => $errors
    ]);
    exit();
}

// Extract parsed data using SimpleXML
$institution = (string)$xml->Institution;
$generatedDate = (string)$xml->GeneratedDate;
$studentsList = [];

foreach ($xml->Students->Student as $s) {
    $courses = [];
    if (isset($s->Courses->Course)) {
        foreach ($s->Courses->Course as $c) {
            $courses[] = [
                'code' => (string)$c->Code,
                'title' => (string)$c->Title,
                'attendance_rate' => (float)$c->AttendanceRate,
            ];
        }
    }

    $studentsList[] = [
        'id'          => (int)$s['id'],
        'roll_number' => (string)$s->RollNumber,
        'full_name'   => (string)$s->FullName,
        'department'  => (string)$s->Department,
        'semester'    => (int)$s->Semester,
        'cgpa'        => (float)$s->CGPA,
        'attendance'  => [
            'total'       => (int)$s->AttendanceSummary->TotalClasses,
            'attended'    => (int)$s->AttendanceSummary->AttendedClasses,
            'percentage'  => (float)$s->AttendanceSummary->Percentage,
            'eligibility' => (string)$s->AttendanceSummary->EligibilityStatus,
        ],
        'courses'     => $courses
    ];
}

echo json_encode([
    'success' => true,
    'message' => 'XML successfully parsed using PHP SimpleXMLElement parser.',
    'metadata' => [
        'institution'    => $institution,
        'generated_date' => $generatedDate,
        'total_parsed'   => count($studentsList),
    ],
    'students' => $studentsList
], JSON_PRETTY_PRINT);
