"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ImageUpload } from "@/components/image-upload"
import { WebcamCapture } from "@/components/webcam-capture"
import { ResultsDisplay } from "@/components/results-display"
import { HistorySection } from "@/components/history-section"
import { Camera, Upload, Shield, Zap, Brain } from "lucide-react"

export default function FaceRecognitionSystem() {
  const [activeMode, setActiveMode] = useState<"upload" | "camera" | null>(null)
  const [recognitionResult, setRecognitionResult] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [history, setHistory] = useState<any[]>([])

  const handleImageProcess = async (imageData: string) => {
    setIsProcessing(true)
    try {
      // API call to backend
      const response = await fetch("http://localhost:5000/recognize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageData }),
      })

      const result = await response.json()
      setRecognitionResult(result)

      // Add to history
      const historyEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        result: result,
        image: imageData,
      }
      setHistory((prev) => [historyEntry, ...prev])
    } catch (error) {
      console.error("Recognition failed:", error)
      setRecognitionResult({ error: "Backend not responding" })
    } finally {
      setIsProcessing(false)
    }
  }

  const resetToHome = () => {
    setActiveMode(null)
    setRecognitionResult(null)
  }

  if (activeMode === "camera") {
    return <WebcamCapture onCapture={handleImageProcess} onBack={resetToHome} isProcessing={isProcessing} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 text-sm font-medium">
            AI-Powered Recognition
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
            Advanced Face Recognition
            <span className="text-primary block mt-2">System</span>
          </h1>

          <p className="text-xl text-muted-foreground text-balance mb-12 max-w-2xl mx-auto">
            Upload an image or use your camera to identify faces with cutting-edge AI technology. Fast, accurate, and
            secure recognition powered by advanced machine learning.
          </p>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">AI-Powered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Advanced neural networks for accurate face detection and recognition
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Real-time processing with results in seconds, not minutes
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your images are processed securely with privacy protection
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="w-full sm:w-auto" onClick={() => setActiveMode("upload")}>
              <Upload className="mr-2 h-5 w-5" />
              Upload Image
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-transparent"
              onClick={() => setActiveMode("camera")}
            >
              <Camera className="mr-2 h-5 w-5" />
              Open Camera
            </Button>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      {activeMode === "upload" && (
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <ImageUpload onImageSelect={handleImageProcess} isProcessing={isProcessing} />
          </div>
        </section>
      )}

      {/* Results Section */}
      {recognitionResult && (
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <ResultsDisplay result={recognitionResult} onReset={resetToHome} />
          </div>
        </section>
      )}

      {/* History Section */}
      {history.length > 0 && (
        <section className="py-12 px-4 border-t">
          <div className="max-w-4xl mx-auto">
            <HistorySection history={history} />
          </div>
        </section>
      )}
    </div>
  )
}
