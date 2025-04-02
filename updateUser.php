<?php
header('Content-Type: application/json');

$action = $_GET['action'] ?? '';
$userId = $_GET['userId'] ?? '';
$filename = 'users.json';

// إنشاء الملف إذا لم يكن موجوداً
if (!file_exists($filename)) {
    file_put_contents($filename, json_encode(["users" => []]));
}

$data = json_decode(file_get_contents($filename), true);
if (!isset($data['users'])) {
    $data['users'] = [];
}

if ($action == 'add' && !empty($userId)) {
    if (!in_array($userId, $data['users'])) {
        $data['users'][] = $userId;
    }
} elseif ($action == 'remove' && !empty($userId)) {
    if (($key = array_search($userId, $data['users'])) !== false) {
        unset($data['users'][$key]);
        // إعادة ترتيب الفهرسة
        $data['users'] = array_values($data['users']);
    }
}

// حفظ التغييرات في الملف
file_put_contents($filename, json_encode($data));

echo json_encode(["status" => "ok", "data" => $data]);
?>
