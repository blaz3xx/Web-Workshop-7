<?php
header('Content-Type: application/json');

$immediateFile = 'events_immediate.log';
$batchFile = 'events_batch.log';

$results = [
    'immediate' => [],
    'batch' => []
];

// Функція читання лог-файлів JSONL
function readJsonLines($file, $key) {
    global $results;
    if (file_exists($file)) {
        $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $results[$key][] = json_decode($line, true);
        }
    }
}

// Читаємо негайні лог (Спосіб 1)
readJsonLines($immediateFile, 'immediate');

// Читаємо пакетні лог (Спосіб 2)
readJsonLines($batchFile, 'batch');

echo json_encode($results);
?>