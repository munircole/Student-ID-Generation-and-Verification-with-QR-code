import { type NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/db"
import QRCode from "qrcode"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("Generating ID card for student:", params.id)

    const studentId = decodeURIComponent(params.id)
    console.log("Decoded student ID:", studentId)

    const connection = await getConnection()
    const [rows] = await connection.execute("SELECT * FROM students WHERE student_id = ?", [studentId])
    await connection.end()

    const students = rows as any[]
    console.log("Found students:", students.length)

    if (students.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const student = students[0]
    console.log("Student data:", student.first_name, student.last_name)

    // Generate ID card data for QR code
    const cardData = {
      student_id: student.student_id,
      name: `${student.first_name} ${student.last_name}`,
      email: student.email,
      department: student.department,
      year_level: student.year_level,
      issue_date: new Date().toISOString().split("T")[0],
      expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      card_number: `CARD-${student.student_id.replace(/\//g, "-")}`,
      verification_hash: Buffer.from(`${student.student_id}-${student.email}-${Date.now()}`).toString("base64"),
    }

    console.log("Card data generated:", cardData.card_number)

    // Generate QR code with card data
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(cardData), {
      width: 200,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    console.log("QR code generated successfully")

    return NextResponse.json({
      student,
      cardData,
      qrCode: qrCodeDataURL,
    })
  } catch (error) {
    console.error("Error generating ID card:", error)
    return NextResponse.json(
      {
        error: "Failed to generate ID card",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
