<?php
require_once 'auth_middleware.php';

$result = $conn->query('SELECT id, category, title, content FROM study_notes ORDER BY category, id');
$notes = [];
while ($row = $result->fetch_assoc()) {
    $notes[] = $row;
}
echo json_encode(['data' => $notes]);
?>