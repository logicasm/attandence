<?php
require_once 'config/database.php';

$pdo = get_db_connection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Get payroll data for a specific month
        try {
            $month = isset($_GET['month']) ? $_GET['month'] : date('n');
            $year = isset($_GET['year']) ? $_GET['year'] : date('Y');
            
            // Get all employees with their attendance and salary data
            $query = "SELECT 
                        e.id,
                        e.name,
                        e.designation,
                        e.daily_rate,
                        COUNT(a.id) as days_present,
                        SUM(a.overtime_hours) as total_overtime_hours
                      FROM employees e
                      LEFT JOIN attendance a ON e.id = a.employee_id 
                        AND MONTH(a.date) = :month 
                        AND YEAR(a.date) = :year 
                        AND a.status IN ('present', 'late', 'half-day')
                      GROUP BY e.id, e.name, e.designation, e.daily_rate
                      ORDER BY e.name";
            
            $stmt = $pdo->prepare($query);
            $stmt->bindParam(':month', $month);
            $stmt->bindParam(':year', $year);
            $stmt->execute();
            $payroll_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Calculate summary statistics
            $total_employees = count($payroll_data);
            $total_salary = 0;
            $total_overtime_pay = 0;
            $total_payroll = 0;
            
            foreach ($payroll_data as &$employee) {
                $employee['days_present'] = (int)$employee['days_present'];
                $employee['total_overtime_hours'] = (float)$employee['total_overtime_hours'];
                
                // Calculate basic salary for the month
                $basic_salary = $employee['daily_rate'] * $employee['days_present'];
                
                // Calculate overtime pay (assuming overtime rate is same as daily rate / 8 hours)
                $overtime_pay = ($employee['daily_rate'] / 8) * $employee['total_overtime_hours'];
                
                // Total pay for the month
                $total_pay = $basic_salary + $overtime_pay;
                
                $employee['basic_salary'] = $basic_salary;
                $employee['overtime_pay'] = $overtime_pay;
                $employee['total_pay'] = $total_pay;
                
                $total_salary += $basic_salary;
                $total_overtime_pay += $overtime_pay;
                $total_payroll += $total_pay;
            }
            
            $summary = [
                'total_employees' => $total_employees,
                'total_basic_salary' => $total_salary,
                'total_overtime_pay' => $total_overtime_pay,
                'total_payroll' => $total_payroll,
                'month' => $month,
                'year' => $year
            ];
            
            echo json_encode([
                'success' => true,
                'payroll_data' => $payroll_data,
                'summary' => $summary
            ]);
            
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error fetching payroll: ' . $e->getMessage()
            ]);
        }
        break;

    case 'POST':
        // Generate and save payroll report
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!$data || empty($data['month']) || empty($data['year']) || empty($data['payroll_data'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid data received. Month, year, and payroll data are required.'
            ]);
            exit;
        }
        
        try {
            $pdo->beginTransaction();
            
            // Delete existing payroll records for this month/year
            $delete_query = "DELETE FROM payroll WHERE month = :month AND year = :year";
            $delete_stmt = $pdo->prepare($delete_query);
            $delete_stmt->bindParam(':month', $data['month']);
            $delete_stmt->bindParam(':year', $data['year']);
            $delete_stmt->execute();
            
            // Insert new payroll records
            $insert_query = "INSERT INTO payroll 
                            (employee_id, month, year, basic_salary, overtime_hours, overtime_pay, total_pay, created_at) 
                            VALUES (:employee_id, :month, :year, :basic_salary, :overtime_hours, :overtime_pay, :total_pay, NOW())";
            
            $insert_stmt = $pdo->prepare($insert_query);
            
            foreach ($data['payroll_data'] as $record) {
                $insert_stmt->execute([
                    ':employee_id' => $record['id'],
                    ':month' => $data['month'],
                    ':year' => $data['year'],
                    ':basic_salary' => $record['basic_salary'],
                    ':overtime_hours' => $record['total_overtime_hours'],
                    ':overtime_pay' => $record['overtime_pay'],
                    ':total_pay' => $record['total_pay']
                ]);
            }
            
            $pdo->commit();
            
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Payroll report generated and saved successfully'
            ]);
            
        } catch(PDOException $e) {
            $pdo->rollback();
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error generating payroll report: ' . $e->getMessage()
            ]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Method Not Allowed'
        ]);
        break;
}
?> 