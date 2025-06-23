<?php
require_once 'config/database.php';

// Get the database connection
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
        case 'DELETE':
            handleDelete($pdo);
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
    $stmt = $pdo->query("SELECT id, employee_id, name, designation, daily_rate, phone, aadhar, joining_date, account_number, ifsc_code FROM employees ORDER BY created_at DESC");
    $employees = $stmt->fetchAll();
    echo json_encode(['success' => true, 'employees' => $employees]);
}

function handlePost($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    // This handles multipart/form-data for image uploads
    if (empty($data) && isset($_POST['name'])) {
        $data = $_POST;
    }

    if (empty($data)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No data received']);
        return;
    }

    $required_fields = ['employee_id', 'name', 'designation', 'daily_rate', 'phone', 'aadhar', 'joining_date'];
    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
            return;
        }
    }

    $profile_image = null;
    if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] == UPLOAD_ERR_OK) {
        $image_tmp_name = $_FILES['profile_image']['tmp_name'];
        $image_data = file_get_contents($image_tmp_name);
        $profile_image = base64_encode($image_data);
    } elseif (isset($data['profile_image_base64'])) {
        // Handle image coming from canvas/camera as base64 string
        $img_parts = explode(";base64,", $data['profile_image_base64']);
        if (count($img_parts) === 2) {
            $profile_image = $img_parts[1];
        }
    }


    $sql = "INSERT INTO employees (employee_id, name, designation, daily_rate, phone, aadhar, joining_date, account_number, ifsc_code, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $data['employee_id'],
        $data['name'],
        $data['designation'],
        $data['daily_rate'],
        $data['phone'],
        $data['aadhar'],
        $data['joining_date'],
        $data['account_number'] ?? null,
        $data['ifsc_code'] ?? null,
        $profile_image
    ]);

    $new_employee_id = $pdo->lastInsertId();
    $stmt = $pdo->prepare("SELECT * FROM employees WHERE id = ?");
    $stmt->execute([$new_employee_id]);
    $new_employee = $stmt->fetch();

    http_response_code(201);
    echo json_encode(['success' => true, 'message' => 'Employee added successfully', 'employee' => $new_employee]);
}


function handleDelete($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Employee ID is required']);
        return;
    }

    $sql = "DELETE FROM employees WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    
    if ($stmt->execute([$data['id']])) {
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Employee deleted successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Employee not found']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete employee']);
    }
}
?> 