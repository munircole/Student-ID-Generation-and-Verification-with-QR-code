import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '@/lib/db'

export async function GET() {
  try {
    const connection = await getConnection()
    const [rows] = await connection.execute(`
      SELECT vl.*, s.first_name, s.last_name, s.department 
      FROM verification_logs vl 
      JOIN students s ON vl.student_id = s.student_id 
      ORDER BY vl.verified_at DESC 
      LIMIT 100
    `)
    await connection.end()
    
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching verification logs:', error)
    return NextResponse.json({ error: 'Failed to fetch verification logs' }, { status: 500 })
  }
}
