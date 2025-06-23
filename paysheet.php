<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config/database.php';

$pdo = get_db_connection();

$action = $_GET['action'] ?? '';

if ($action === 'generate_paysheet') {
    generate_paysheet($pdo);
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid action specified.']);
}

function getEmployees($pdo) {
    try {
        $stmt = $pdo->query("SELECT id, name, designation, daily_rate, account, ifsc FROM employees ORDER BY name");
        $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'employees' => $employees]);
    } catch(PDOException $e) {
        echo json_encode(['error' => 'Failed to fetch employees: ' . $e->getMessage()]);
    }
}

function generate_paysheet($pdo) {
    $month = $_GET['month'] ?? date('m');
    $year = $_GET['year'] ?? date('Y');

    if (empty($month) || empty($year)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Month and year are required.']);
        return;
    }

    try {
        // 1. Get all employees
        $stmt = $pdo->query("SELECT id, employee_id, name, daily_rate FROM employees WHERE is_active = 1 ORDER BY name ASC");
        $employees = $stmt->fetchAll();

        // 2. Get all attendance for the month
        $attendance_query = "SELECT employee_id, 
                                SUM(CASE WHEN status = 'present' THEN 1 WHEN status = 'half_day' THEN 0.5 ELSE 0 END) as present_days, 
                                SUM(overtime_hours) as total_ot
                             FROM attendance 
                             WHERE MONTH(date) = ? AND YEAR(date) = ? 
                             GROUP BY employee_id";
        $stmt = $pdo->prepare($attendance_query);
        $stmt->execute([$month, $year]);
        $attendance_data = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

        // 3. Get all kharchi/advance for the month
        $kharchi_query = "SELECT employee_id, 
                                 SUM(CASE WHEN type = 'advance' THEN amount ELSE 0 END) as total_advance,
                                 SUM(CASE WHEN type = 'kharchi' THEN amount ELSE 0 END) as total_kharchi
                          FROM kharchi 
                          WHERE MONTH(date) = ? AND YEAR(date) = ? 
                          GROUP BY employee_id";
        $stmt = $pdo->prepare($kharchi_query);
        $stmt->execute([$month, $year]);
        $kharchi_data = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

        // 4. Combine data
        $paysheet_data = [];
        foreach ($employees as $emp) {
            $emp_id = $emp['employee_id'];
            $daily_rate = floatval($emp['daily_rate']);
            
            $present_days = floatval($attendance_data[$emp_id]['present_days'] ?? 0);
            $total_ot_hours = floatval($attendance_data[$emp_id]['total_ot'] ?? 0);

            $total_advance = floatval($kharchi_data[$emp_id]['total_advance'] ?? 0);
            $total_kharchi = floatval($kharchi_data[$emp_id]['total_kharchi'] ?? 0);

            // Calculation Logic
            // Total attendance is present days + overtime converted to days (assuming 8hr day)
            $total_attendance_days = $present_days + ($total_ot_hours / 8);
            $wages = $present_days * $daily_rate + ($total_ot_hours * ($daily_rate / 8));
            $net_payment = $wages - $total_advance - $total_kharchi;

            $paysheet_data[] = [
                's_no' => count($paysheet_data) + 1,
                'employee_id' => $emp_id,
                'name' => $emp['name'],
                'rate' => $daily_rate,
                'present_days' => $present_days,
                'ot_hours' => $total_ot_hours,
                'total_attendance' => $total_attendance_days,
                'wages' => $wages,
                'advance' => $total_advance,
                'kharchi' => $total_kharchi,
                'net_payment' => $net_payment,
            ];
        }

        echo json_encode(['success' => true, 'paysheet' => $paysheet_data, 'period' => ['month' => $month, 'year' => $year]]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to generate paysheet: ' . $e->getMessage()]);
    }
}
?> 