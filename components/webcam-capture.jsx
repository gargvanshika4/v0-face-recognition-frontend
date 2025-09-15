"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, ArrowLeft, RotateCcw, Loader2 } from "lucide-react"

/**
 * @param {Object} props
 * @param {function(string): void} props.onCapture - Callback when image is captured
 * @param {function(): void} props.onBack - Callback to go back
 * @param {boolean} props.isProcessing - Whether image is being processed
 */
export function WebcamCapture({ onCapture, onBack, isProcessing }) {
  const [stream, setStream] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const startCamera = useCallback(async () => {
    setIsLoading(true)
    setError("")

    try {
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
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("Unable to access camera. Please check permissions.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [stream])

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    context.drawImage(video, 0, 0)

    const imageData = canvas.toDataURL("image/jpeg", 0.8)
    setCapturedImage(imageData)
  }, [])

  const startCountdown = useCallback(() => {
    setCountdown(3)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          captureImage()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [captureImage])

  const handleProcess = () => {
    if (capturedImage) {
      onCapture(capturedImage)
    }
  }

  const handleRetake = () => {
    setCapturedImage(null)
    setCountdown(0)
  }

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [startCamera, stopCamera])

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="rounded-full bg-destructive/10 p-4 mx-auto mb-4 w-fit">
              <Camera className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Camera Access Error</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2">
              <Button onClick={startCamera} className="flex-1">
                Try Again
              </Button>
              <Button variant="outline" onClick={onBack}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack} disabled={isProcessing}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Camera Capture</h1>
            <p className="text-muted-foreground">Position your face in the frame and capture</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Camera Feed */}
          <Card>
            <CardContent className="p-6">
              <div className="relative">
                {isLoading ? (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Starting camera...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full aspect-video rounded-lg bg-black"
                    />

                    {/* Face detection overlay */}
                    <div className="absolute inset-4 border-2 border-primary/50 rounded-lg pointer-events-none">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary"></div>
                    </div>

                    {/* Countdown overlay */}
                    {countdown > 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <div className="text-6xl font-bold text-white animate-pulse">{countdown}</div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  onClick={startCountdown}
                  disabled={isLoading || countdown > 0 || isProcessing}
                  className="flex-1"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {countdown > 0 ? `Capturing in ${countdown}...` : "Capture Photo"}
                </Button>

                <Button variant="outline" onClick={startCamera} disabled={isLoading || countdown > 0 || isProcessing}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Captured Image */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Captured Image</h3>
                {capturedImage && <Badge variant="secondary">Ready for processing</Badge>}
              </div>

              <div className="relative mb-4">
                {capturedImage ? (
                  <img
                    src={capturedImage || "/placeholder.svg"}
                    alt="Captured for recognition"
                    className="w-full aspect-video rounded-lg border object-cover"
                  />
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No image captured yet</p>
                    </div>
                  </div>
                )}
              </div>

              {capturedImage && (
                <div className="flex gap-3">
                  <Button onClick={handleProcess} disabled={isProcessing} className="flex-1">
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Recognize Face"
                    )}
                  </Button>

                  <Button variant="outline" onClick={handleRetake} disabled={isProcessing}>
                    Retake
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
