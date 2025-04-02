<?php
header('Content-Type: application/json');
$filename = 'users.json';
if (!file_exists($filename)) {
    file_put_contents($filename, json_encode(["users" => []]));
}
$data = json_decode(file_get_contents($filename), true);
echo json_encode($data);
?>
