-- Create database and tables for student verification system
CREATE DATABASE IF NOT EXISTS student_verification;
USE student_verification;

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    department VARCHAR(100),
    year_level ENUM('1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate') NOT NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    qr_code_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Verification logs table
CREATE TABLE IF NOT EXISTS verification_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verification_method ENUM('qr_scan', 'manual') DEFAULT 'qr_scan',
    verified_by VARCHAR(100),
    location VARCHAR(100),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO students (student_id, first_name, last_name, email, phone, department, year_level) VALUES
('2024001', 'John', 'Doe', 'john.doe@university.edu', '555-0101', 'Computer Science', '3rd Year'),
('2024002', 'Jane', 'Smith', 'jane.smith@university.edu', '555-0102', 'Engineering', '2nd Year'),
('2024003', 'Mike', 'Johnson', 'mike.johnson@university.edu', '555-0103', 'Business', '4th Year');
