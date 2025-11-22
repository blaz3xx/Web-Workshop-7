<?php
// Встановлюємо часову зону, щоб уникнути розбіжностей
date_default_timezone_set('Europe/Kiev');

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if ($data) {
    // Додаємо серверний час
    $data['time_server'] = date('Y-m-d H:i:s.u');
    
    $logEntry = json_encode($data) . PHP_EOL;
    
    // Записуємо в файл events_immediate.log
    file_put_contents('events_immediate.log', $logEntry, FILE_APPEND | LOCK_EX);
    
    http_response_code(200);
    echo json_encode(['status' => 'success']);
} else {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'No data received']);
}
?>