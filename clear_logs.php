<?php
header('Content-Type: application/json');

$immediateFile = 'events_immediate.log';
$batchFile = 'events_batch.log';
$successCount = 0;

// Функція для форсованого очищення файлу
function clearFile($file) {
    if (file_exists($file)) {
        // Спробуємо перезаписати файл порожнім рядком
        $success = file_put_contents($file, '', LOCK_EX);
        if ($success === false) {
             // Якщо запис не вдався, спробуємо обрізати файл
             $handle = @fopen($file, 'w');
             if ($handle) {
                 @ftruncate($handle, 0); 
                 @fclose($handle);
                 return true; 
             }
             return false;
        }
        return true;
    }
    return true; // Якщо файл не існує, вважаємо, що він чистий
}

$successCount += clearFile($immediateFile) ? 1 : 0;
$successCount += clearFile($batchFile) ? 1 : 0;

if ($successCount === 2) {
    echo json_encode(['status' => 'success', 'message' => 'Both log files cleared.']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to clear one or both log files. Check permissions (CHMOD 666).']);
}
?>