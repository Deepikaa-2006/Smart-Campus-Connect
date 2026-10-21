<?php
/**
 * Smart Campus Connect - XML Schema Validator
 * Syllabus: Unit 5 (XML Schema Validation using PHP DOMDocument)
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$xsdPath = __DIR__ . '/../schema/campus_report.xsd';

if (!file_exists($xsdPath)) {
    echo json_encode([
        'success' => false,
        'message' => 'XSD schema file not found at: ' . $xsdPath
    ]);
    exit();
}

$rawInput = file_get_contents('php://input');
$data = !empty($rawInput) ? json_decode($rawInput, true) : null;
$xmlContent = $data['xml'] ?? null;

if (empty($xmlContent)) {
    // Fallback to sample report
    $samplePath = __DIR__ . '/../data/sample_report.xml';
    $xmlContent = file_get_contents($samplePath);
}

libxml_use_internal_errors(true);
$dom = new DOMDocument();
$loaded = $dom->loadXML($xmlContent);

if (!$loaded) {
    $errors = [];
    foreach (libxml_get_errors() as $e) {
        $errors[] = trim($e->message);
    }
    libxml_clear_errors();
    echo json_encode([
        'success' => false,
        'valid'   => false,
        'message' => 'Malformed XML syntax.',
        'errors'  => $errors
    ], JSON_PRETTY_PRINT);
    exit();
}

$isValid = $dom->schemaValidate($xsdPath);
$errors = [];

if (!$isValid) {
    foreach (libxml_get_errors() as $e) {
        $errors[] = "Line {$e->line}: " . trim($e->message);
    }
    libxml_clear_errors();
}

echo json_encode([
    'success' => true,
    'valid'   => $isValid,
    'message' => $isValid ? 'XML is 100% valid against the campus_report.xsd Schema!' : 'Schema validation failed.',
    'errors'  => $errors,
    'schema'  => 'campus_report.xsd'
], JSON_PRETTY_PRINT);
