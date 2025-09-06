import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "student_verification",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
}

export async function getConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig)
    return connection
  } catch (error) {
    console.error("Database connection failed:", error)
    throw error
  }
}

export interface Student {
  id: number
  student_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  department: string
  year_level: string
  status: "active" | "inactive" | "suspended"
  qr_code_data?: string
  created_at: string
  updated_at: string
}

export interface VerificationLog {
  id: number
  student_id: string
  verified_at: string
  verification_method: "qr_scan" | "manual"
  verified_by?: string
  location?: string
}

// Add interface for ID card data
export interface IDCardData {
  student_id: string
  name: string
  email: string
  department: string
  year_level: string
  profile_image?: string
  issue_date: string
  expiry_date: string
  card_number: string
}
