
<?php
// Use 127.0.0.1 to avoid macOS socket lookup errors
$host = 'localhost';
$user = 'prepwuxj_namecheapuser_prepuser';
$password = 'Pmj@2004Sakshi@2005'; // Add your MySQL password if you set one
$dbname = 'prepwuxj_namecheapuser_placement_prep'; // Restored your original database name
$port = 3306;

mysqli_report(MYSQLI_REPORT_OFF);

$conn = @new mysqli($host, $user, $password, $dbname, $port);

if ($conn->connect_error) {
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database connection error: " . $conn->connect_error
    ]);
    exit();
}
?>