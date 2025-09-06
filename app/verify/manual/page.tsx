"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Search, CheckCircle, XCircle, User, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { StudentIDCard } from "@/components/student-id-card"

export default function ManualVerifyPage() {
  const params = useParams()
  const [studentId, setStudentId] = useState("")
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [verifierInfo, setVerifierInfo] = useState({
    verified_by: "",
    location: "",
  })

const handleVerification = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!studentId.trim()) return

  setIsLoading(true)
  setError("")
  setVerificationResult(null)

  try {
    const verifyResponse = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: studentId,
        verified_by: verifierInfo.verified_by,
        location: verifierInfo.location,
      }),
    })

    const verifyData = await verifyResponse.json()

    if (verifyResponse.ok) {
      setVerificationResult(verifyData.student)
    } else {
      setError(verifyData.error || "Verification failed")
    }
  } catch (err) {
    setError("Network error or server unavailable")
  } finally {
    setIsLoading(false)
  }
}

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Manual Verification</h1>
          <p className="text-gray-600">Verify students by entering their ID manually</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Verifier Information</CardTitle>
              <CardDescription>Enter your details for verification logging</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="verified_by">Verified By</Label>
                <Input
                  id="verified_by"
                  placeholder="Your name"
                  value={verifierInfo.verified_by}
                  onChange={(e) => setVerifierInfo({ ...verifierInfo, verified_by: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Main Gate, Library"
                  value={verifierInfo.location}
                  onChange={(e) => setVerifierInfo({ ...verifierInfo, location: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Student ID Verification</CardTitle>
              <CardDescription>Enter the student ID to verify</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerification} className="space-y-4">
                <div>
                  <Label htmlFor="student_id">Student ID</Label>
                  <Input
                    id="student_id"
                    placeholder="e.g., CSC/20U/4101"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-green-700 text-white hover:bg-green-700" disabled={isLoading}>
                  <Search className="w-4 h-4 mr-2" />
                  {isLoading ? "Verifying..." : "Verify Student"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {verificationResult && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Verification Successful
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-semibold">
                        {verificationResult.first_name} {verificationResult.last_name}
                      </p>
                      <p className="text-sm text-gray-600">ID: {verificationResult.student_id}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Email:</span>
                      <p className="text-gray-600">{verificationResult.email}</p>
                    </div>
                    <div>
                      <span className="font-medium">Department:</span>
                      <p className="text-gray-600">{verificationResult.department}</p>
                    </div>
                    <div>
                      <span className="font-medium">Year Level:</span>
                      <p className="text-gray-600">{verificationResult.year_level}</p>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <Badge variant="default" className="ml-1">
                        {verificationResult.status}
                      </Badge>
                    </div>
                  </div>
                  {verificationResult.phone && (
                    <div className="text-sm">
                      <span className="font-medium">Phone:</span>
                      <p className="text-gray-600">{verificationResult.phone}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
