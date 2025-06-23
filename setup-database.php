<?php
// Database Setup Script
// This script will create all necessary tables for the site management system

require_once 'api/config/database.php';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h2>Database Setup for Site Management System</h2>";
    echo "<p>Connecting to database: $dbname</p>";
    
    // Read and execute the complete database SQL
    $sqlFile = 'api/complete_database.sql';
    
    if (file_exists($sqlFile)) {
        $sql = file_get_contents($sqlFile);
        
        // Split SQL into individual statements
        $statements = array_filter(array_map('trim', explode(';', $sql)));
        
        $successCount = 0;
        $errorCount = 0;
        
        foreach ($statements as $statement) {
            if (!empty($statement)) {
                try {
                    $pdo->exec($statement);
                    $successCount++;
                    echo "<p style='color: green;'>✓ Executed: " . substr($statement, 0, 50) . "...</p>";
                } catch (PDOException $e) {
                    $errorCount++;
                    echo "<p style='color: red;'>✗ Error: " . $e->getMessage() . "</p>";
                }
            }
        }
        
        echo "<h3>Setup Summary:</h3>";
        echo "<p>Successfully executed: $successCount statements</p>";
        echo "<p>Errors: $errorCount</p>";
        
        if ($errorCount == 0) {
            echo "<h3 style='color: green;'>✅ Database setup completed successfully!</h3>";
            echo "<p>The following tables have been created:</p>";
            echo "<ul>";
            echo "<li>employees - Employee information</li>";
            echo "<li>attendance - Daily attendance records</li>";
            echo "<li>kharchi - Employee advances and expenses</li>";
            echo "<li>expenses - General site expenses</li>";
            echo "<li>paysheet - Generated paysheets</li>";
            echo "<li>paysheet_details - Detailed paysheet breakdown</li>";
            echo "</ul>";
            
            echo "<p>Sample data has been inserted for testing.</p>";
            echo "<p><a href='index.html'>Go to Site Management System</a></p>";
        } else {
            echo "<h3 style='color: orange;'>⚠️ Setup completed with some errors.</h3>";
            echo "<p>Please check the error messages above and fix any issues.</p>";
        }
        
    } else {
        echo "<p style='color: red;'>Error: SQL file not found at $sqlFile</p>";
    }
    
} catch(PDOException $e) {
    echo "<h2 style='color: red;'>Database Connection Error</h2>";
    echo "<p>Error: " . $e->getMessage() . "</p>";
    echo "<p>Please check your database configuration in api/config/database.php</p>";
    echo "<p>Make sure:</p>";
    echo "<ul>";
    echo "<li>XAMPP is running</li>";
    echo "<li>MySQL service is started</li>";
    echo "<li>Database credentials are correct</li>";
    echo "<li>Database '$dbname' exists</li>";
    echo "</ul>";
}
?>

<style>
body {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
    background-color: #f5f5f5;
}

h2, h3 {
    color: #333;
}

p {
    margin: 10px 0;
    line-height: 1.5;
}

ul {
    margin: 10px 0;
    padding-left: 20px;
}

a {
    color: #007bff;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}
</style> 