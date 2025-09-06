"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Printer, Download } from "lucide-react"
import { StudentIDCard } from "./student-id-card"



interface IDCardPrinterProps {
  cards: any[]
  onPrint?: () => void
  onDownload?: () => void
}

export function IDCardPrinter({ cards, onPrint, onDownload }: IDCardPrinterProps) {
  const [printLayout, setPrintLayout] = useState<"single" | "multiple">("multiple")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Print Layout</CardTitle>
          <CardDescription>Choose how to arrange the ID cards for printing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Button variant={printLayout === "single" ? "default" : "outline"} onClick={() => setPrintLayout("single")}>
              Single Card per Page
            </Button>
            <Button
              variant={printLayout === "multiple" ? "default" : "outline"}
              onClick={() => setPrintLayout("multiple")}
            >
              Multiple Cards per Page
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={onPrint} className="flex-1">
              <Printer className="w-4 h-4 mr-2" />
              Print Cards
            </Button>
            <Button onClick={onDownload} variant="outline" className="flex-1 bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Print Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Print Preview</CardTitle>
          <CardDescription>Preview of how the cards will be printed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 ${printLayout === "multiple" ? "grid-cols-2" : "grid-cols-1"}`}>
            {cards.slice(0, printLayout === "multiple" ? 4 : 1).map((card, index) => (
              <div key={index} className="transform scale-75 origin-top-left">
                <StudentIDCard student={card.student} cardData={card.cardData} qrCode={card.qrCode} />
              </div>
            ))}
          </div>
          {cards.length > (printLayout === "multiple" ? 4 : 1) && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              +{cards.length - (printLayout === "multiple" ? 4 : 1)} more cards will be printed
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
