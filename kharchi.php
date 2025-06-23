<?php
require_once 'config/database.php';

$pdo = get_db_connection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        handleGet($pdo);
    } elseif ($method === 'POST') {
        handlePost($pdo);
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()]);
}

function handleGet($pdo) {
    $employee_id = $_GET['employee_id'] ?? null;
    
    if ($employee_id) {
        $stmt = $pdo->prepare("SELECT * FROM kharchi WHERE employee_id = ? ORDER BY date DESC");
        $stmt->execute([$employee_id]);
    } else {
        $stmt = $pdo->query("SELECT * FROM kharchi ORDER BY date DESC");
    }
    
    $transactions = $stmt->fetchAll();
    echo json_encode(['success' => true, 'transactions' => $transactions]);
}

function handlePost($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No data received']);
        return;
    }

    $required_fields = ['employee_id', 'employee_name', 'type', 'amount', 'date'];
    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
            return;
        }
    }

    $sql = "INSERT INTO kharchi (employee_id, employee_name, type, amount, date, remarks) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $data['employee_id'],
        $data['employee_name'],
        $data['type'],
        $data['amount'],
        $data['date'],
        $data['remarks'] ?? null
    ]);

    http_response_code(201);
    echo json_encode(['success' => true, 'message' => 'Transaction added successfully']);
}
?> 