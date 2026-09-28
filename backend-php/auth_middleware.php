<?php
require_once 'db_connect.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$headers = function_exists('getallheaders') ? getallheaders() : [];
$authorization = $headers['Authorization'] ?? $headers['authorization'] ?? '';
$token = preg_replace('/^Bearer\s+/i', '', trim($authorization));

if (!$token) {
    http_response_code(401);
    die(json_encode(['error' => 'Unauthorized access']));
}

$stmt = $conn->prepare('SELECT user_id FROM session_tokens WHERE token = ? AND expires_at > NOW()');
$stmt->bind_param('s', $token);
$stmt->execute();
if ($stmt->get_result()->num_rows === 0) {
    http_response_code(401);
    die(json_encode(['error' => 'Invalid or expired token']));
}
?>