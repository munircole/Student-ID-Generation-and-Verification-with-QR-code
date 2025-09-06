"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Square } from "lucide-react"
import jsQR from "jsqr"

interface QRScannerProps {
  onScan: (data: string) => void
  isScanning: boolean
  onStartScan: () => void
  onStopScan: () => void
}

export function QRScanner({ onScan, isScanning, onStartScan, onStopScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState("")

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        onStartScan()
        setError("")
        requestAnimationFrame(scanFrame) // start scanning loop
      }
    } catch (err) {
      setError("Camera access denied or not available")
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    onStopScan()
  }

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const qrCode = jsQR(imageData.data, canvas.width, canvas.height)

    if (qrCode) {
      onScan(qrCode.data)
      stopCamera()
      return
    }

    // keep scanning
    requestAnimationFrame(scanFrame)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code Scanner</CardTitle>
        <CardDescription>
          {isScanning ? "Point camera at student ID card QR code" : "Click to start scanning"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isScanning ? (
            <Button
              onClick={startCamera}
              className="w-full bg-green-700 text-white hover:bg-green-700"
              size="lg"
            >
              <Camera className="w-5 h-5 mr-2" />
              Start Camera
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />
                {/* QR Code targeting overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <Square className="w-32 h-32 text-white opacity-50" strokeWidth={2} />
                    <div className="absolute inset-0 border-2 border-white border-dashed rounded-lg animate-pulse"></div>
                  </div>
                </div>
                {/* Corner guides */}
                <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-white"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-white"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-white"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-white"></div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-2">
                <Button onClick={stopCamera} variant="outline" className="flex-1">
                  Stop Camera
                </Button>
              </div>
              <p className="text-sm text-gray-600 text-center">
                Position the QR code within the frame. Scanning happens automatically.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
