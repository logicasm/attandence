-- Complete Database Setup for Site Management System
-- Run this script to create all necessary tables

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS site_management;
USE site_management;

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    aadhar VARCHAR(12) UNIQUE NOT NULL,
    joining_date DATE NOT NULL,
    account_number VARCHAR(20),
    ifsc_code VARCHAR(11),
    profile_image LONGTEXT,
    is_active TINYINT(1) DEFAULT 1, -- 1 for active, 0 for inactive
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_employee_id (employee_id),
    INDEX idx_name (name),
    INDEX idx_designation (designation)
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'half_day') NOT NULL,
    check_in TIME,
    check_out TIME,
    overtime_hours DECIMAL(4,2) DEFAULT 0.00,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_employee_date (employee_id, date),
    INDEX idx_employee_id (employee_id),
    INDEX idx_date (date),
    INDEX idx_status (status)
);

-- Kharchi Table for Employee Advances and Expenses
CREATE TABLE IF NOT EXISTS kharchi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    type ENUM('kharchi', 'advance') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_employee_id (employee_id),
    INDEX idx_date (date),
    INDEX idx_type (type),
    INDEX idx_employee_date (employee_id, date)
);

-- Expenses Table for General Site Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category ENUM('materials', 'equipment', 'transport', 'food', 'utilities', 'other') NOT NULL,
    date DATE NOT NULL,
    paid_by VARCHAR(100),
    payment_method ENUM('cash', 'bank_transfer', 'cheque', 'upi') DEFAULT 'cash',
    receipt_number VARCHAR(50),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_date (date),
    INDEX idx_category (category),
    INDEX idx_amount (amount)
);

-- Paysheet Table for Storing Generated Paysheets
CREATE TABLE IF NOT EXISTS paysheet (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    basic_salary DECIMAL(10,2) NOT NULL,
    overtime_pay DECIMAL(10,2) DEFAULT 0.00,
    deductions DECIMAL(10,2) DEFAULT 0.00,
    net_pay DECIMAL(10,2) NOT NULL,
    present_days INT NOT NULL,
    absent_days INT NOT NULL,
    overtime_hours DECIMAL(5,2) DEFAULT 0.00,
    total_days INT NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_employee_month_year (employee_id, month, year),
    INDEX idx_employee_id (employee_id),
    INDEX idx_month_year (month, year),
    INDEX idx_generated_at (generated_at)
);

-- Paysheet Details Table for Detailed Breakdown
CREATE TABLE IF NOT EXISTS paysheet_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paysheet_id INT NOT NULL,
    deduction_type ENUM('kharchi', 'advance', 'other') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    date DATE,
    
    FOREIGN KEY (paysheet_id) REFERENCES paysheet(id) ON DELETE CASCADE,
    INDEX idx_paysheet_id (paysheet_id),
    INDEX idx_deduction_type (deduction_type)
);

-- Sample Data for Testing

-- Sample Employees
INSERT INTO employees (employee_id, name, designation, daily_rate, phone, aadhar, joining_date, account_number, ifsc_code) VALUES
('JOH1234', 'John Doe', 'Mason', 1000.00, '9876543210', '123456789012', '2024-01-01', '1234567890', 'SBIN0001234'),
('SMI5678', 'Smith Johnson', 'Carpenter', 1000.00, '9876543211', '123456789013', '2024-01-02', '1234567891', 'SBIN0001235'),
('WIL9012', 'William Brown', 'Laborer', 800.00, '9876543212', '123456789014', '2024-01-03', '1234567892', 'SBIN0001236'),
('JAM3456', 'James Wilson', 'Electrician', 1200.00, '9876543213', '123456789015', '2024-01-04', '1234567893', 'SBIN0001237'),
('ROB7890', 'Robert Davis', 'Plumber', 1100.00, '9876543214', '123456789016', '2024-01-05', '1234567894', 'SBIN0001238');

-- Sample Attendance (for January 2024)
INSERT INTO attendance (employee_id, employee_name, date, status, check_in, check_out, overtime_hours) VALUES
('JOH1234', 'John Doe', '2024-01-01', 'present', '08:00:00', '18:00:00', 2.00),
('JOH1234', 'John Doe', '2024-01-02', 'present', '08:00:00', '18:00:00', 1.50),
('JOH1234', 'John Doe', '2024-01-03', 'present', '08:00:00', '18:00:00', 0.00),
('JOH1234', 'John Doe', '2024-01-04', 'absent', NULL, NULL, 0.00),
('JOH1234', 'John Doe', '2024-01-05', 'present', '08:00:00', '18:00:00', 1.00),
('SMI5678', 'Smith Johnson', '2024-01-01', 'present', '08:00:00', '18:00:00', 1.00),
('SMI5678', 'Smith Johnson', '2024-01-02', 'present', '08:00:00', '18:00:00', 0.50),
('SMI5678', 'Smith Johnson', '2024-01-03', 'absent', NULL, NULL, 0.00),
('SMI5678', 'Smith Johnson', '2024-01-04', 'present', '08:00:00', '18:00:00', 0.00),
('SMI5678', 'Smith Johnson', '2024-01-05', 'present', '08:00:00', '18:00:00', 1.50);

-- Sample Kharchi Data
INSERT INTO kharchi (employee_id, employee_name, type, amount, date, remarks) VALUES
('JOH1234', 'John Doe', 'advance', 5000.00, '2024-01-15', 'Monthly advance'),
('JOH1234', 'John Doe', 'kharchi', 2000.00, '2024-01-20', 'Site expenses'),
('JOH1234', 'John Doe', 'advance', 3000.00, '2024-01-25', 'Emergency advance'),
('SMI5678', 'Smith Johnson', 'kharchi', 1500.00, '2024-01-18', 'Transport expenses'),
('SMI5678', 'Smith Johnson', 'advance', 4000.00, '2024-01-22', 'Monthly advance');

-- Sample Expenses Data
INSERT INTO expenses (description, amount, category, date, paid_by, payment_method, receipt_number, remarks) VALUES
('Cement bags', 15000.00, 'materials', '2024-01-10', 'Site Manager', 'cash', 'RCP001', '50 bags of cement'),
('Diesel for generator', 8000.00, 'equipment', '2024-01-12', 'Site Manager', 'cash', 'RCP002', '100 liters diesel'),
('Worker transport', 3000.00, 'transport', '2024-01-15', 'Site Manager', 'cash', 'RCP003', 'Monthly transport cost'),
('Lunch for workers', 5000.00, 'food', '2024-01-18', 'Site Manager', 'cash', 'RCP004', 'Weekly lunch expenses'),
('Electricity bill', 2500.00, 'utilities', '2024-01-20', 'Site Manager', 'bank_transfer', 'RCP005', 'Monthly electricity'),
('Safety equipment', 12000.00, 'equipment', '2024-01-22', 'Site Manager', 'cash', 'RCP006', 'Helmets and safety gear'),
('Water tanker', 2000.00, 'utilities', '2024-01-25', 'Site Manager', 'cash', 'RCP007', 'Water supply for site'),
('Miscellaneous tools', 3500.00, 'materials', '2024-01-28', 'Site Manager', 'cash', 'RCP008', 'Various construction tools');

-- Sample Paysheet Data
INSERT INTO paysheet (employee_id, employee_name, month, year, basic_salary, overtime_pay, deductions, net_pay, present_days, absent_days, overtime_hours, total_days, daily_rate) VALUES
('JOH1234', 'John Doe', 1, 2024, 24000.00, 3000.00, 7000.00, 20000.00, 24, 7, 12.00, 31, 1000.00),
('SMI5678', 'Smith Johnson', 1, 2024, 22000.00, 2000.00, 5500.00, 18500.00, 22, 9, 8.00, 31, 1000.00);

-- Sample Paysheet Details
INSERT INTO paysheet_details (paysheet_id, deduction_type, amount, description, date) VALUES
(1, 'advance', 5000.00, 'Monthly advance', '2024-01-15'),
(1, 'kharchi', 2000.00, 'Site expenses', '2024-01-20'),
(2, 'advance', 4000.00, 'Monthly advance', '2024-01-22'),
(2, 'kharchi', 1500.00, 'Transport expenses', '2024-01-18');

-- Display table creation status
SELECT 'Database setup completed successfully!' as status; 