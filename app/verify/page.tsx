"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { QRScanner } from "@/components/qr-scanner"
import { User, ArrowLeft, } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function VerifyPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [error, setError] = useState("")
  const [verifierInfo, setVerifierInfo] = useState({
    verified_by: "",
    location: "",
  })

  const handleQRVerification = async (qrData: string) => {
    try {
      const response = await fetch("/api/verify-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrData,
          verified_by: verifierInfo.verified_by,
          location: verifierInfo.location,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setVerificationResult(data.student)
        setError("")
      } else {
        setError(data.error)
        setVerificationResult(null)
      }
    } catch (err) {
      setError("QR code verification failed")
      setVerificationResult(null)
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
          <h1 className="text-3xl font-bold mb-2">QR Code Verification</h1>
          <p className="text-gray-600">Scan student QR codes for instant verification</p>
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

          <QRScanner
            onScan={handleQRVerification}
            isScanning={isScanning}
            onStartScan={() => setIsScanning(true)}
            onStopScan={() => setIsScanning(false)}
          />

          {error && (
            <Alert variant="destructive">
              <span className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {verificationResult && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <span className="w-5 h-5 mr-2" />
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
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
