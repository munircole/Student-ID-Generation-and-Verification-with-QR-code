import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { student_id, verified_by, location } = body

    const connection = await getConnection()
    
    // Check if student exists and is active
    const [studentRows] = await connection.execute(
      'SELECT * FROM students WHERE student_id = ? AND status = "active"',
      [student_id]
    )
    
    const students = studentRows as any[]
    if (students.length === 0) {
      await connection.end()
      return NextResponse.json({ error: 'Student not found or inactive' }, { status: 404 })
    }

    // Log the verification
    await connection.execute(
      'INSERT INTO verification_logs (student_id, verified_by, location) VALUES (?, ?, ?)',
      [student_id, verified_by, location]
    )
    
    await connection.end()

    return NextResponse.json({ 
      message: 'Verification successful', 
      student: students[0] 
    })
  } catch (error) {
    console.error('Error verifying student:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
