import mysql from "mysql2/promise"
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: ".env.local" })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function runMigration() {
  let connection

  try {
    console.log("🚀 Starting database migration for Student Verification System...")

    const dbConfig = {
      host: process.env.DB_HOST || "localhost",
      port: Number.parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "password",
    }

    console.log(`📡 Connecting to MySQL at ${dbConfig.host}:${dbConfig.port}...`)

    // Connect to MySQL server (without database)
    connection = await mysql.createConnection(dbConfig)

    console.log("✅ Connected to MySQL server")

    // Create database first
    console.log("📄 Creating database...")
    await connection.query("CREATE DATABASE IF NOT EXISTS student_verification")
    await connection.query("USE student_verification")

    console.log("📄 Creating tables...")

    // Create students table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(30) UNIQUE NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(15),
        department VARCHAR(100) NOT NULL,
        year_level ENUM('1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate') NOT NULL,
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        qr_code_data TEXT,
        profile_image VARCHAR(500),
        date_of_birth DATE,
        address TEXT,
        emergency_contact VARCHAR(100),
        emergency_phone VARCHAR(15),
        enrollment_date DATE,
        graduation_date DATE,
        gpa DECIMAL(3,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_student_id (student_id),
        INDEX idx_email (email),
        INDEX idx_department (department),
        INDEX idx_status (status)
      )
    `)

    // Create verification_logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS verification_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(30) NOT NULL,
        verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        verification_method ENUM('qr_scan', 'manual', 'card_tap', 'biometric') DEFAULT 'qr_scan',
        verified_by VARCHAR(100),
        verifier_id VARCHAR(50),
        location VARCHAR(100),
        device_info VARCHAR(200),
        ip_address VARCHAR(45),
        verification_status ENUM('success', 'failed', 'suspicious') DEFAULT 'success',
        failure_reason VARCHAR(200),
        session_id VARCHAR(100),
        additional_data JSON,
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
        INDEX idx_student_id (student_id),
        INDEX idx_verified_at (verified_at),
        INDEX idx_verification_method (verification_method),
        INDEX idx_location (location)
      )
    `)

    // Create administrators table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS administrators (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id VARCHAR(20) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        role ENUM('super_admin', 'admin', 'verifier', 'viewer') DEFAULT 'verifier',
        department VARCHAR(100),
        phone VARCHAR(15),
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_email (email),
        INDEX idx_role (role)
      )
    `)

    // Create system_settings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value JSON NOT NULL,
        description TEXT,
        updated_by VARCHAR(50),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (updated_by) REFERENCES administrators(admin_id) ON DELETE SET NULL
      )
    `)

    // Create audit_logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id VARCHAR(50),
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50) NOT NULL,
        resource_id VARCHAR(50),
        old_values JSON,
        new_values JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES administrators(admin_id) ON DELETE SET NULL,
        INDEX idx_admin_id (admin_id),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at)
      )
    `)

    // Create access_points table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS access_points (
        id INT AUTO_INCREMENT PRIMARY KEY,
        location_name VARCHAR(100) NOT NULL,
        location_code VARCHAR(20) UNIQUE NOT NULL,
        description TEXT,
        access_type ENUM('entry', 'exit', 'both') DEFAULT 'both',
        is_active BOOLEAN DEFAULT TRUE,
        requires_verification BOOLEAN DEFAULT TRUE,
        allowed_roles JSON,
        operating_hours JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_location_code (location_code),
        INDEX idx_is_active (is_active)
      )
    `)

    console.log("👤 Creating default admin user...")

    // Insert default admin user
    await connection.execute(
      `INSERT INTO administrators (
        admin_id, username, email, password_hash, first_name, last_name, 
        role, department, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE email = email`,
      [
        "ADMIN001",
        "admin",
        "admin@university.edu",
        "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq9w5KS", // admin123
        "System",
        "Administrator",
        "super_admin",
        "IT Department",
        true,
      ],
    )

    console.log("🏫 Inserting sample students...")

    // Insert sample students with proper ID format: DEPT/YYU/NNNN
    const sampleStudents = [
      ["CSC/20U/4101", "John", "Doe", "john.doe@university.edu", "555-0101", "Computer Science", "3rd Year", "2002-05-15", "123 Main St, City", "Jane Doe", "555-0201", "2022-09-01", null, 3.75],
      ["ENG/21U/3205", "Jane", "Smith", "jane.smith@university.edu", "555-0102", "Engineering", "2nd Year", "2003-08-22", "456 Oak Ave, City", "Robert Smith", "555-0202", "2023-09-01", null, 3.85],
      ["BUS/19U/2847", "Mike", "Johnson", "mike.johnson@university.edu", "555-0103", "Business Administration", "4th Year", "2001-12-10", "789 Pine St, City", "Sarah Johnson", "555-0203", "2021-09-01", "2025-05-15", 3.60],
      ["PSY/22U/1923", "Emily", "Davis", "emily.davis@university.edu", "555-0104", "Psychology", "1st Year", "2004-03-18", "321 Elm St, City", "Michael Davis", "555-0204", "2024-09-01", null, 3.90],
      ["MAT/18G/0156", "Alex", "Wilson", "alex.wilson@university.edu", "555-0105", "Mathematics", "Graduate", "2000-07-25", "654 Maple Ave, City", "Lisa Wilson", "555-0205", "2020-09-01", "2024-12-15", 3.95],
      ["CSC/21U/3847", "Sarah", "Brown", "sarah.brown@university.edu", "555-0106", "Computer Science", "2nd Year", "2003-11-08", "987 Cedar Ln, City", "David Brown", "555-0206", "2023-09-01", null, 3.68],
      ["ENG/20U/2156", "David", "Miller", "david.miller@university.edu", "555-0107", "Engineering", "3rd Year", "2002-04-12", "147 Birch St, City", "Mary Miller", "555-0207", "2022-09-01", null, 3.72],
      ["BUS/22U/4589", "Lisa", "Garcia", "lisa.garcia@university.edu", "555-0108", "Business Administration", "1st Year", "2004-09-30", "258 Spruce Ave, City", "Carlos Garcia", "555-0208", "2024-09-01", null, 3.81],
      ["PSY/19U/1674", "James", "Martinez", "james.martinez@university.edu", "555-0109", "Psychology", "4th Year", "2001-06-14", "369 Willow Dr, City", "Ana Martinez", "555-0209", "2021-09-01", "2025-05-15", 3.55],
      ["MAT/21U/2938", "Maria", "Rodriguez", "maria.rodriguez@university.edu", "555-0110", "Mathematics", "2nd Year", "2003-01-27", "741 Poplar St, City", "Jose Rodriguez", "555-0210", "2023-09-01", null, 3.92]
    ]

    for (const student of sampleStudents) {
      await connection.execute(
        `INSERT INTO students (
          student_id, first_name, last_name, email, phone, department, year_level,
          date_of_birth, address, emergency_contact, emergency_phone, enrollment_date, graduation_date, gpa
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE email = email`,
        student
      )
    }

    console.log("📍 Inserting access points...")

    // Insert sample access points
    const accessPoints = [
      ["Main Gate", "GATE001", "Primary entrance to campus", "both", true, true, '["student", "staff", "visitor"]', '{"monday": "06:00-22:00", "tuesday": "06:00-22:00", "wednesday": "06:00-22:00", "thursday": "06:00-22:00", "friday": "06:00-21:00", "saturday": "08:00-20:00", "sunday": "08:00-20:00"}'],
      ["Library Entrance", "LIB001", "Main library access point", "both", true, true, '["student", "staff"]', '{"monday": "07:00-23:00", "tuesday": "07:00-23:00", "wednesday": "07:00-23:00", "thursday": "07:00-23:00", "friday": "07:00-21:00", "saturday": "09:00-21:00", "sunday": "10:00-20:00"}'],
      ["Dormitory A", "DORM001", "Student dormitory entrance", "both", true, true, '["student"]', '{"monday": "00:00-23:59", "tuesday": "00:00-23:59", "wednesday": "00:00-23:59", "thursday": "00:00-23:59", "friday": "00:00-23:59", "saturday": "00:00-23:59", "sunday": "00:00-23:59"}'],
      ["Cafeteria", "CAF001", "Main cafeteria entrance", "both", true, false, '["student", "staff", "visitor"]', '{"monday": "06:30-21:00", "tuesday": "06:30-21:00", "wednesday": "06:30-21:00", "thursday": "06:30-21:00", "friday": "06:30-21:00", "saturday": "08:00-20:00", "sunday": "08:00-20:00"}'],
      ["Gymnasium", "GYM001", "Sports facility entrance", "both", true, true, '["student", "staff"]', '{"monday": "06:00-22:00", "tuesday": "06:00-22:00", "wednesday": "06:00-22:00", "thursday": "06:00-22:00", "friday": "06:00-22:00", "saturday": "08:00-20:00", "sunday": "10:00-18:00"}'],
    ]

    for (const point of accessPoints) {
      await connection.execute(
        `INSERT INTO access_points (
          location_name, location_code, description, access_type, is_active, requires_verification, allowed_roles, operating_hours
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE location_name = location_name`,
        point
      )
    }

    console.log("⚙️ Inserting system settings...")

    // Insert default system settings
    const settings = [
      ["qr_code_expiry_hours", '"24"', "Hours after which QR codes expire"],
      ["max_verification_attempts", '"3"', "Maximum failed verification attempts before lockout"],
      ["session_timeout_minutes", '"30"', "Admin session timeout in minutes"],
      ["backup_retention_days", '"90"', "Days to retain database backups"],
      ["audit_log_retention_days", '"365"', "Days to retain audit logs"],
      ["email_notifications_enabled", "true", "Enable email notifications"],
      ["sms_notifications_enabled", "false", "Enable SMS notifications"],
      ["maintenance_mode", "false", "System maintenance mode"],
      ["allowed_file_types", '["jpg", "jpeg", "png", "pdf"]', "Allowed file types for uploads"],
      ["max_file_size_mb", '"5"', "Maximum file size for uploads in MB"],
      ["verification_cooldown_seconds", '"5"', "Cooldown period between verifications"],
      ["require_photo_verification", "false", "Require photo comparison during verification"],
    ]

    for (const [key, value, description] of settings) {
      await connection.execute(
        `INSERT INTO system_settings (setting_key, setting_value, description, updated_by) 
         VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE setting_value = setting_value`,
        [key, value, description, "ADMIN001"],
      )
    }

    console.log("📊 Inserting sample verification logs...")

    // Insert sample verification logs with new student IDs
    const verificationLogs = [
      ["CSC/20U/4101", "qr_scan", "Security Guard", "GUARD001", "Main Gate", "Mobile Scanner v1.0", "192.168.1.100", "success"],
      ["ENG/21U/3205", "manual", "Library Staff", "LIB001", "Library Entrance", "Desktop Terminal", "192.168.1.101", "success"],
      ["BUS/19U/2847", "qr_scan", "Dormitory RA", "RA001", "Dormitory A", "Mobile App v2.1", "192.168.1.102", "success"],
      ["CSC/20U/4101", "qr_scan", "Cafeteria Staff", "CAF001", "Cafeteria", "Tablet Scanner", "192.168.1.103", "success"],
      ["PSY/22U/1923", "manual", "Gym Attendant", "GYM001", "Gymnasium", "Desktop Terminal", "192.168.1.104", "success"],
      ["MAT/18G/0156", "qr_scan", "Security Guard", "GUARD002", "Main Gate", "Mobile Scanner v1.0", "192.168.1.105", "success"],
      ["CSC/21U/3847", "qr_scan", "Library Staff", "LIB002", "Library Entrance", "Tablet Scanner", "192.168.1.106", "success"],
      ["ENG/20U/2156", "manual", "Dormitory RA", "RA002", "Dormitory A", "Desktop Terminal", "192.168.1.107", "success"],
      ["BUS/22U/4589", "qr_scan", "Cafeteria Staff", "CAF002", "Cafeteria", "Mobile App v2.1", "192.168.1.108", "success"],
      ["PSY/19U/1674", "qr_scan", "Gym Attendant", "GYM002", "Gymnasium", "Tablet Scanner", "192.168.1.109", "success"]
    ]

    for (const log of verificationLogs) {
      await connection.execute(
        `INSERT INTO verification_logs (
          student_id, verification_method, verified_by, verifier_id, location, device_info, ip_address, verification_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        log
      )
    }

    // Verify tables were created
    const [tables] = await connection.query("SHOW TABLES")

    console.log(`📊 Created ${tables.length} tables:`)
    tables.forEach((table) => {
      console.log(`   ✓ ${Object.values(table)[0]}`)
    })

    // Show record counts
    console.log("\n📈 Record counts:")
    const [studentCount] = await connection.query("SELECT COUNT(*) as count FROM students")
    const [logCount] = await connection.query("SELECT COUNT(*) as count FROM verification_logs")
    const [adminCount] = await connection.query("SELECT COUNT(*) as count FROM administrators")
    const [accessPointCount] = await connection.query("SELECT COUNT(*) as count FROM access_points")

    console.log(`   👥 Students: ${studentCount[0].count}`)
    console.log(`   📝 Verification Logs: ${logCount[0].count}`)
    console.log(`   👤 Administrators: ${adminCount[0].count}`)
    console.log(`   📍 Access Points: ${accessPointCount[0].count}`)

    console.log("\n👤 Default admin user created:")
    console.log("   📧 Email: admin@university.edu")
    console.log("   👤 Username: admin")
    console.log("   🔑 Password: admin123")
    console.log("   🎯 Role: super_admin")

    console.log("\n🎯 Migration completed successfully!")
    console.log("💡 You can now start the application and begin using the Student Verification System!")

  } catch (error) {
    console.error("❌ Migration failed:", error.message)

    if (error.code === "ECONNREFUSED") {
      console.error("💡 Make sure MySQL server is running")
    } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("💡 Check your database credentials in .env.local")
    } else if (error.code === "ER_BAD_DB_ERROR") {
      console.error("💡 Database connection issue - check your MySQL configuration")
    }

    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

runMigration()