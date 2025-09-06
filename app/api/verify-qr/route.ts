import { type NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { qrData, verified_by, location } = body

    // Parse QR code data
    let cardData
    try {
      cardData = JSON.parse(qrData)
    } catch (err) {
      return NextResponse.json({ error: "Invalid QR code format" }, { status: 400 })
    }

    // Validate required fields
    if (!cardData.student_id || !cardData.verification_hash) {
      return NextResponse.json({ error: "Invalid QR code data" }, { status: 400 })
    }

    // Check if card is expired
    const expiryDate = new Date(cardData.expiry_date)
    const currentDate = new Date()
    if (expiryDate < currentDate) {
      return NextResponse.json({ error: "Student ID card has expired" }, { status: 400 })
    }

    const connection = await getConnection()

    // Check if student exists and is active
    const [studentRows] = await connection.execute(
      'SELECT * FROM students WHERE student_id = ? AND status = "active"',
      [cardData.student_id],
    )

    const students = studentRows as any[]
    if (students.length === 0) {
      await connection.end()
      return NextResponse.json({ error: "Student not found or inactive" }, { status: 404 })
    }

    const student = students[0]

    // Verify the hash (basic verification - in production, use proper cryptographic verification)
    const expectedData = `${student.student_id}-${student.email}`
    const providedHash = cardData.verification_hash

    // For demo purposes, we'll accept any hash that contains the student ID
    if (!providedHash.includes(Buffer.from(student.student_id).toString("base64").substring(0, 8))) {
      await connection.execute(
        "INSERT INTO verification_logs (student_id, verification_method, verified_by, location, verification_status, failure_reason) VALUES (?, ?, ?, ?, ?, ?)",
        [cardData.student_id, "qr_scan", verified_by, location, "failed", "Invalid verification hash"],
      )
      await connection.end()
      return NextResponse.json({ error: "Invalid verification hash" }, { status: 400 })
    }

    // Log successful verification
    await connection.execute(
      "INSERT INTO verification_logs (student_id, verification_method, verified_by, location, verification_status, additional_data) VALUES (?, ?, ?, ?, ?, ?)",
      [cardData.student_id, "qr_scan", verified_by, location, "success", JSON.stringify(cardData)],
    )

    await connection.end()

    return NextResponse.json({
      success: true,
      message: "Verification successful",
      student: {
        ...student,
        card_data: cardData,
      },
    })
  } catch (error) {
    console.error("Error verifying QR code:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
