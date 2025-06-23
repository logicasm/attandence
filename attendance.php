<?php
require_once 'config/database.php';

$pdo = get_db_connection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            handleGet($pdo);
            break;
        case 'POST':
            handlePost($pdo);
            break;
        case 'PUT':
            handlePut($pdo);
            break;
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()]);
}

function handleGet($pdo) {
    if (isset($_GET['date'])) {
        // Get attendance log for a specific date
        $stmt = $pdo->prepare("SELECT a.*, e.name as employee_name FROM attendance a JOIN employees e ON a.employee_id = e.employee_id WHERE a.date = ? ORDER BY a.created_at DESC");
        $stmt->execute([$_GET['date']]);
    } elseif (isset($_GET['employee_id']) && isset($_GET['date'])) {
        // Check for existing record for an employee on a date
        $stmt = $pdo->prepare("SELECT * FROM attendance WHERE employee_id = ? AND date = ?");
        $stmt->execute([$_GET['employee_id'], $_GET['date']]);
    } else {
        // Default: get latest records
        $stmt = $pdo->query("SELECT a.*, e.name as employee_name FROM attendance a JOIN employees e ON a.employee_id = e.employee_id ORDER BY a.date DESC, a.created_at DESC LIMIT 50");
    }
    
    $records = $stmt->fetchAll();
    echo json_encode(['success' => true, 'records' => $records]);
}

function handlePost($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No data received']);
        return;
    }
    
    $required_fields = ['employee_id', 'date', 'status'];
    foreach ($required_fields as $field) {
        if (!isset($data[$field])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
            return;
        }
    }

    $sql = "INSERT INTO attendance (employee_id, date, status, check_in, check_out, overtime_hours, remarks) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $data['employee_id'],
        $data['date'],
        $data['status'],
        $data['check_in'] ?? null,
        $data['check_out'] ?? null,
        $data['overtime_hours'] ?? 0,
        $data['remarks'] ?? null
    ]);

    http_response_code(201);
    echo json_encode(['success' => true, 'message' => 'Attendance marked successfully']);
}

function handlePut($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Attendance record ID is required']);
        return;
    }

    $sql = "UPDATE attendance SET overtime_hours = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $data['overtime_hours'] ?? 0,
        $data['id']
    ]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Overtime updated successfully']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Record not found or no changes made']);
    }
}
?> 