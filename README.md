# Site Management System

A comprehensive web-based system for managing construction site employees, attendance, expenses, advances, and payroll.

## Features

- **Employee Management**: Add, view, and manage employee details with profile images
- **Attendance Tracking**: Mark daily attendance with overtime tracking
- **Kharchi Management**: Record employee advances and expenses
- **Expense Tracking**: Track general site expenses by category
- **Paysheet Generation**: Generate salary slips with automatic calculations
- **Modern UI**: Responsive design with dark mode support

## Setup Instructions

### Prerequisites

1. **XAMPP** (or similar local server)
   - Download from: https://www.apachefriends.org/
   - Install and start Apache and MySQL services

2. **Web Browser** (Chrome, Firefox, Safari, Edge)

### Installation Steps

1. **Copy Files to XAMPP**
   ```
   Copy all files to: C:\xampp\htdocs\site-management\
   ```

2. **Create Database**
   - Open phpMyAdmin: http://localhost/phpmyadmin
   - Create a new database named `site_management`

3. **Configure Database**
   - Edit `api/config/database.php`
   - Update database credentials if needed:
   ```php
   $host = 'localhost';
   $dbname = 'site_management';
   $username = 'root';
   $password = '';
   ```

4. **Run Database Setup**
   - Open: http://localhost/site-management/setup-database.php
   - This will create all tables and insert sample data

5. **Access the System**
   - Open: http://localhost/site-management/
   - The system is now ready to use!

## Database Tables

### 1. employees
- Employee basic information
- Daily rate, bank details, profile images

### 2. attendance
- Daily attendance records
- Check-in/out times, overtime hours

### 3. kharchi
- Employee advances and expenses
- Categorized by type (kharchi/advance)

### 4. expenses
- General site expenses
- Categories: materials, equipment, transport, food, utilities

### 5. paysheet
- Generated salary slips
- Monthly salary calculations

### 6. paysheet_details
- Detailed breakdown of deductions
- Links to kharchi transactions

## API Endpoints

### Employees
- `GET api/employees.php` - Get all employees
- `POST api/employees.php` - Add new employee
- `DELETE api/employees.php` - Delete employee

### Attendance
- `GET api/attendance.php` - Get attendance records
- `POST api/attendance.php` - Mark attendance
- `PUT api/attendance.php` - Update attendance

### Kharchi
- `GET api/kharchi.php` - Get kharchi records
- `POST api/kharchi.php` - Add kharchi/advance

### Expenses
- `GET api/expenses.php` - Get expenses
- `POST api/expenses.php` - Add expense

### Paysheet
- `GET api/paysheet.php?action=get_employees` - Get employees for paysheet
- `POST api/paysheet.php?action=generate_paysheet` - Generate paysheet

## Salary Calculation

The system automatically calculates:
- **Basic Salary** = Present Days × Daily Rate
- **Overtime Pay** = Overtime Hours × (Daily Rate ÷ 8)
- **Deductions** = Total Kharchi/Advances for the month
- **Net Pay** = Basic Salary + Overtime Pay - Deductions

## File Structure

```
site-management/
├── index.html              # Main application
├── script.js               # JavaScript functionality
├── styles.css              # CSS styles
├── setup-database.php      # Database setup script
├── test-paysheet.html      # Paysheet testing page
├── README.md               # This file
├── api/
│   ├── config/
│   │   └── database.php    # Database configuration
│   ├── employees.php       # Employee API
│   ├── attendance.php      # Attendance API
│   ├── kharchi.php         # Kharchi API
│   ├── expenses.php        # Expenses API
│   ├── paysheet.php        # Paysheet API
│   ├── complete_database.sql # Complete database schema
│   ├── kharchi.sql         # Kharchi table schema
│   ├── expenses.sql        # Expenses table schema
│   └── paysheet.sql        # Paysheet table schema
```

## Usage Guide

### Adding Employees
1. Go to Employees page
2. Fill in employee details
3. Upload profile image (optional)
4. Click "Save Employee"

### Marking Attendance
1. Go to Attendance page
2. Search for employee
3. Select attendance status
4. Add overtime hours if applicable
5. Click "Mark Attendance"

### Recording Kharchi/Advances
1. Go to Kharchi page
2. Select employee
3. Choose type (kharchi/advance)
4. Enter amount and remarks
5. Click "Save Transaction"

### Adding Expenses
1. Go to Expenses page
2. Click "Add Expense"
3. Fill in expense details
4. Select category
5. Click "Add Expense"

### Generating Paysheets
1. Go to Paysheet page
2. Select employee
3. Choose month and year
4. Click "Load Paysheet"
5. Print or download the salary slip

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure XAMPP is running
   - Check database credentials in `api/config/database.php`
   - Verify database exists

2. **API Not Working**
   - Check if Apache is running
   - Verify file permissions
   - Check browser console for errors

3. **Images Not Uploading**
   - Check folder permissions
   - Ensure PHP file upload is enabled
   - Check file size limits

### Error Logs
- Check XAMPP error logs: `C:\xampp\apache\logs\error.log`
- Check browser console for JavaScript errors
- Check PHP error logs in XAMPP

## Sample Data

The setup script includes sample data for testing:
- 5 sample employees
- Sample attendance records
- Sample kharchi transactions
- Sample expenses
- Sample paysheets

## Support

For issues or questions:
1. Check the troubleshooting section
2. Verify all setup steps are completed
3. Check error logs for specific error messages

## Version History

- **v1.0** - Initial release with basic functionality
- **v1.1** - Added paysheet generation
- **v1.2** - Added kharchi and expenses management
- **v1.3** - Improved UI and added dark mode 