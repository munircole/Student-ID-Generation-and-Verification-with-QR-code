import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '@/lib/db'
import QRCode from 'qrcode'

export async function GET() {
  try {
    const connection = await getConnection()
    const [rows] = await connection.execute('SELECT * FROM students ORDER BY created_at DESC')
    await connection.end()
    
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { student_id, first_name, last_name, email, phone, department, year_level } = body

    // Generate QR code data
    const qrData = JSON.stringify({
      student_id,
      name: `${first_name} ${last_name}`,
      email,
      department,
      year_level,
      timestamp: new Date().toISOString()
    })

    const qrCodeDataURL = await QRCode.toDataURL(qrData)

    const connection = await getConnection()
    const [result] = await connection.execute(
      'INSERT INTO students (student_id, first_name, last_name, email, phone, department, year_level, qr_code_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [student_id, first_name, last_name, email, phone, department, year_level, qrCodeDataURL]
    )
    await connection.end()

    return NextResponse.json({ message: 'Student created successfully', id: (result as any).insertId })
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 })
  }
}
