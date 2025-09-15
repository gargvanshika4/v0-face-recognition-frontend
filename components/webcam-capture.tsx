"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Camera, ArrowLeft, RotateCcw, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface WebcamCaptureProps {
  onCapture: (imageData: string) => void
  onBack: () => void
  isProcessing: boolean
}

export function WebcamCapture({ onCapture, onBack, isProcessing }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string>("")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)

  const startCamera = useCallback(async () => {
    try {
      setError("")
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      })

      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
        setIsStreaming(true)
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("Unable to access camera. Please check permissions and try again.")
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      setIsStreaming(false)
    }
  }, [stream])

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    // Start countdown
    setCountdown(3)
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval)

          // Capture the image
          const canvas = canvasRef.current!
          const video = videoRef.current!
          const context = canvas.getContext("2d")!

          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          context.drawImage(video, 0, 0)

          const imageData = canvas.toDataURL("image/jpeg", 0.8)
          setCapturedImage(imageData)
          stopCamera()

          return null
        }
        return prev! - 1
      })
    }, 1000)
  }, [stopCamera])

  const handleConfirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage)
    }
  }

  const handleRetake = () => {
    setCapturedImage(null)
    setCountdown(null)
    startCamera()
  }

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [startCamera, stopCamera])

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack} disabled={isProcessing}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Camera Capture</h1>
            <p className="text-muted-foreground">Position your face in the frame and capture</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Camera/Preview Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              {/* Video Stream */}
              {isStreaming && !capturedImage && (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full max-w-2xl mx-auto rounded-lg bg-black"
                  />

                  {/* Countdown Overlay */}
                  {countdown && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                      <div className="text-6xl font-bold text-white animate-pulse">{countdown}</div>
                    </div>
                  )}

                  {/* Face Detection Guide */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-2 border-primary border-dashed rounded-full w-64 h-64 opacity-50"></div>
                  </div>
                </div>
              )}

              {/* Captured Image Preview */}
              {capturedImage && (
                <div className="relative">
                  <img
                    src={capturedImage || "/placeholder.svg"}
                    alt="Captured"
                    className="w-full max-w-2xl mx-auto rounded-lg"
                  />
                </div>
              )}

              {/* Loading State */}
              {!isStreaming && !capturedImage && !error && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <p className="text-muted-foreground">Starting camera...</p>
                </div>
              )}
            </div>

            {/* Processing Progress */}
            {isProcessing && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Processing captured image...</span>
                </div>
                <Progress value={undefined} className="w-full" />
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-4 mt-6">
              {isStreaming && !capturedImage && (
                <>
                  <Button onClick={captureImage} disabled={countdown !== null} size="lg" className="px-8">
                    <Camera className="mr-2 h-5 w-5" />
                    {countdown ? `Capturing in ${countdown}...` : "Capture Photo"}
                  </Button>
                </>
              )}

              {capturedImage && !isProcessing && (
                <>
                  <Button onClick={handleConfirmCapture} size="lg" className="px-8">
                    Recognize Face
                  </Button>
                  <Button onClick={handleRetake} variant="outline" size="lg">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Retake
                  </Button>
                </>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                {isStreaming && !capturedImage
                  ? "Position your face within the circle and click capture"
                  : capturedImage
                    ? "Review your photo and confirm to proceed with recognition"
                    : "Preparing camera..."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
