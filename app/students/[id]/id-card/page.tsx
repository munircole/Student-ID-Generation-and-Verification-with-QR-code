"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StudentIDCard } from "@/components/student-id-card"
import { Download, Printer, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function IDCardPage() {
  const params = useParams()
  const [cardData, setCardData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCardData()
  }, [params.id])

  const fetchCardData = async () => {
    try {
      const studentId = decodeURIComponent(params.id as string)
      console.log("Fetching card data for:", studentId)

      // Use the new API route structure
      const response = await fetch(`/api/id-card/${encodeURIComponent(studentId)}`)
      console.log("Response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Card data received:", data)
        setCardData(data)
      } else {
        const errorData = await response.json()
        console.error("API Error:", errorData)
        setError(errorData.error || "Failed to generate ID card")
      }
    } catch (err) {
      console.error("Fetch error:", err)
      setError("Error loading ID card data")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    if (!cardRef.current) return

    // Create a canvas to capture the ID card
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 800
    canvas.height = 500

    // Draw a simple representation (in a real app, you'd use html2canvas or similar)
    ctx.fillStyle = "#2563eb"
    ctx.fillRect(0, 0, 800, 500)

    ctx.fillStyle = "white"
    ctx.font = "24px Arial"
    ctx.fillText(`${cardData?.student.first_name} ${cardData?.student.last_name}`, 50, 100)
    ctx.font = "16px Arial"
    ctx.fillText(`ID: ${cardData?.student.student_id}`, 50, 130)
    ctx.fillText(`Department: ${cardData?.student.department}`, 50, 160)
    ctx.fillText(`Year: ${cardData?.student.year_level}`, 50, 190)

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `student-id-${cardData?.student.student_id.replace(/\//g, "-")}.png`
        a.click()
        URL.revokeObjectURL(url)
      }
    })
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading ID card...</div>
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/students">
            <Button variant="outline">Back to Students</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/students">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Student ID Card</h1>
              <p className="text-gray-600">
                {cardData?.student.first_name} {cardData?.student.last_name} - {cardData?.student.student_id}
              </p>
            </div>
          </div>
          <div className="flex gap-2 print:hidden">
            <Button onClick={handlePrint} variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleDownload} className="bg-green-700">
              <Download className="w-4 h-4 mr-2 " />
              Download
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* ID Card Preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ID Card Preview</CardTitle>
                <CardDescription>Official student identification card</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center p-8">
                <div ref={cardRef}>
                  <StudentIDCard student={cardData?.student} cardData={cardData?.cardData} qrCode={cardData?.qrCode} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Card Information */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Card Information</CardTitle>
                <CardDescription>Details embedded in the QR code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Student ID:</span>
                    <p className="font-mono">{cardData?.cardData.student_id}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Card Number:</span>
                    <p className="font-mono">{cardData?.cardData.card_number}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Issue Date:</span>
                    <p>{cardData?.cardData.issue_date}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Expiry Date:</span>
                    <p>{cardData?.cardData.expiry_date}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-500">Verification Hash:</span>
                    <p className="font-mono text-xs break-all bg-gray-100 p-2 rounded">
                      {cardData?.cardData.verification_hash}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QR Code Data</CardTitle>
                <CardDescription>Raw data encoded in the QR code</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-4 rounded-lg overflow-auto max-h-64">
                  {JSON.stringify(cardData?.cardData, null, 2)}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Features</CardTitle>
                <CardDescription>Built-in security measures</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Encrypted verification hash
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Expiration date validation
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Unique card number
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Tamper-resistant QR code
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
