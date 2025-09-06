'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Search, User, MapPin, ArrowLeft, } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface VerificationLog {
  id: number
  student_id: string
  first_name: string
  last_name: string
  department: string
  verified_at: string
  verification_method: string
  verified_by?: string
  location?: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<VerificationLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<VerificationLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    const filtered = logs.filter(log =>
      log.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${log.first_name} ${log.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.verified_by && log.verified_by.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.location && log.location.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredLogs(filtered)
  }, [logs, searchTerm])

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/verification-logs')
      const data = await response.json()
      setLogs(data)
      setFilteredLogs(data)
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getMethodBadge = (method: string) => {
    return method === 'qr_scan' ? (
      <Badge variant="default">QR Scan</Badge>
    ) : (
      <Badge variant="secondary">Manual</Badge>
    )
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
          </Button>
        </Link>

        <div className=" mb-8">
          <h1 className="text-3xl font-bold mb-2 mt-4">Verification Logs</h1>
          <p className="text-gray-600">Track all student verification activities</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Search Logs</CardTitle>
            <CardDescription>Filter verification logs by student, verifier, or location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search by student ID, name, department, verifier, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Verifications ({filteredLogs.length})</CardTitle>
            <CardDescription>Latest verification activities</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Verified By</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium">
                            {log.first_name} {log.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{log.student_id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{log.department}</TableCell>
                    <TableCell>{getMethodBadge(log.verification_method)}</TableCell>
                    <TableCell>
                      {log.verified_by ? (
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3 text-gray-500" />
                          <span className="text-sm">{log.verified_by}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.location ? (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-gray-500" />
                          <span className="text-sm">{log.location}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        <span className="text-sm">{formatDate(log.verified_at)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredLogs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No verification logs found matching your search.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
