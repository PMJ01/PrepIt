<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['full_name']) || empty($data['email']) || empty($data['password'])) {
    echo json_encode(["status" => "error", "message" => "All fields are required."]);
    exit();
}

$fullName = trim($data['full_name']);
$email = strtolower(trim($data['email']));
$password = $data['password'];

$checkStmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$checkStmt->bind_param("s", $email);
$checkStmt->execute();
if ($checkStmt->get_result()->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "An account with this email already exists."]);
    exit();
}

$hashedPassword = password_hash($password, PASSWORD_BCRYPT);
$stmt = $conn->prepare("INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $fullName, $email, $hashedPassword);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Account created successfully! You can now sign in."]);
} else {
    echo json_encode(["status" => "error", "message" => "Registration failed."]);
}

$stmt->close();
$conn->close();
?>