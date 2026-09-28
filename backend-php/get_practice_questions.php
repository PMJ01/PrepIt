<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once 'db_connect.php';

$query = "SELECT id, title, category, difficulty, acceptance, time_limit AS time, tags, prompt, explanation, solving_notes FROM practice_questions ORDER BY id ASC";
$result = $conn->query($query);

$questions = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $row['tags'] = array_map('trim', explode(',', $row['tags']));
        $questions[] = $row;
    }
}

echo json_encode(["status" => "success", "data" => $questions]);
$conn->close();
?>