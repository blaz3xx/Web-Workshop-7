<?php
// Встановлюємо часову зону, щоб уникнути розбіжностей
date_default_timezone_set('Europe/Kiev');

$input = file_get_contents('php://input');
$batchData = json_decode($input, true);

if ($batchData && is_array($batchData)) {

    $logEntries = '';
    $server_time = date('Y-m-d H:i:s.u');
    
    foreach ($batchData as $data) {
        
        $data['time_batch_server'] = $server_time;
        // Перейменовуємо поле 'time' (локальний час) у 'time_local'
        if (isset($data['time'])) {
            $data['time_local'] = $data['time'];
            unset($data['time']);
        }
        // Додаємо дані про розмір
        if (isset($data['size'])) {
             $data['size_px'] = $data['size'];
             unset($data['size']);
        }
        
        $logEntries .= json_encode($data) . PHP_EOL;
    }
    
    // Записуємо ВЕСЬ накопичений рядок $logEntries у файл
    file_put_contents('events_batch.log', $logEntries, FILE_APPEND | LOCK_EX);
    
    http_response_code(200);
    echo json_encode(['status' => 'success', 'records' => count($batchData)]);
} else {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'No valid batch data received']);
}
?>