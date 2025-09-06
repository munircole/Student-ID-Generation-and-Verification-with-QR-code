"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, CreditCard, CheckCircle, AlertCircle } from "lucide-react"
import type { Student } from "@/lib/db"

export default function BulkGeneratePage() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedCards, setGeneratedCards] = useState<any[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students")
      const data = await response.json()
      setStudents(data)
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(students.map((s) => s.student_id))
    } else {
      setSelectedStudents([])
    }
  }

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId])
    } else {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId))
    }
  }

  const generateBulkCards = async () => {
    if (selectedStudents.length === 0) return

    setIsGenerating(true)
    setProgress(0)
    setGeneratedCards([])
    setError("")

    try {
      const cards = []
      for (let i = 0; i < selectedStudents.length; i++) {
        const studentId = selectedStudents[i]
        console.log(`Generating card ${i + 1}/${selectedStudents.length} for:`, studentId)

        try {
          // Use the new API route structure
          const response = await fetch(`/api/id-card/${encodeURIComponent(studentId)}`)
          console.log(`Response status for ${studentId}:`, response.status)

          if (response.ok) {
            const cardData = await response.json()
            cards.push(cardData)
            console.log(`Card generated for ${studentId}`)
          } else {
            const errorData = await response.json()
            console.error(`Error generating card for ${studentId}:`, errorData)
          }
        } catch (err) {
          console.error(`Error generating card for ${studentId}:`, err)
        }

        setProgress(((i + 1) / selectedStudents.length) * 100)

        // Small delay to show progress and prevent overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      console.log(`Generated ${cards.length} cards out of ${selectedStudents.length} selected`)
      setGeneratedCards(cards)

      if (cards.length === 0) {
        setError("Failed to generate any ID cards. Please check the console for details.")
      } else if (cards.length < selectedStudents.length) {
        setError(`Generated ${cards.length} cards, but ${selectedStudents.length - cards.length} failed.`)
      }
    } catch (err) {
      console.error("Bulk generation error:", err)
      setError("Failed to generate ID cards")
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadAllCards = () => {
    // In a real implementation, you would generate a PDF with all cards
    // For demo, we'll just show an alert
    alert(`Downloading ${generatedCards.length} ID cards as PDF...`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bulk ID Card Generation</h1>
          <p className="text-gray-600">Generate ID cards for multiple students at once</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Student Selection */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Select Students</CardTitle>
                <CardDescription>Choose students to generate ID cards for</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedStudents.length === students.length && students.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <label htmlFor="select-all" className="font-medium">
                      Select All ({students.length} students)
                    </label>
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                        <Checkbox
                          id={student.student_id}
                          checked={selectedStudents.includes(student.student_id)}
                          onCheckedChange={(checked) => handleSelectStudent(student.student_id, checked as boolean)}
                        />
                        <label htmlFor={student.student_id} className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">
                                {student.first_name} {student.last_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {student.student_id} • {student.department}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">{student.year_level}</p>
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generation Controls */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generation Options</CardTitle>
                <CardDescription>Configure bulk ID card generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-2">
                  <p>
                    <strong>Selected Students:</strong> {selectedStudents.length}
                  </p>
                  <p>
                    <strong>Format:</strong> Physical ID Card with QR Code
                  </p>
                  <p>
                    <strong>Output:</strong> PDF Document
                  </p>
                </div>

                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Generating cards...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {generatedCards.length > 0 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>Successfully generated {generatedCards.length} ID cards</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Button
                    onClick={generateBulkCards}
                    disabled={selectedStudents.length === 0 || isGenerating}
                    className="w-full"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {isGenerating ? "Generating..." : `Generate ${selectedStudents.length} ID Cards`}
                  </Button>

                  {generatedCards.length > 0 && (
                    <Button onClick={downloadAllCards} variant="outline" className="w-full bg-transparent">
                      <Download className="w-4 h-4 mr-2" />
                      Download All Cards (PDF)
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preview of Generated Cards */}
            {generatedCards.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Cards Preview</CardTitle>
                  <CardDescription>Preview of generated ID cards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {generatedCards.slice(0, 3).map((card, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">
                            {card.student.first_name} {card.student.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{card.student.student_id}</p>
                        </div>
                        <div className="w-8 h-8 bg-white rounded border">
                          <img
                            src={card.qrCode || "/placeholder.svg"}
                            alt="QR"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    ))}
                    {generatedCards.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{generatedCards.length - 3} more cards generated
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
