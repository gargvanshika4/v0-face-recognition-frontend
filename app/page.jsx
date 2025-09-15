"use client"

import { useState } from "react"
import { ImageUpload } from "@/components/image-upload"
import { WebcamCapture } from "@/components/webcam-capture"
import { ResultsDisplay } from "@/components/results-display"
import { HistorySection } from "@/components/history-section"
import { ApiStatus } from "@/components/api-status"
import { useFaceRecognition } from "@/hooks/use-face-recognition"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Upload, History, Brain, Play } from "lucide-react"

export default function Page() {
  const [currentView, setCurrentView] = useState("upload") // "upload", "webcam", "results"
  const [history, setHistory] = useState([])
  const { isProcessing, result, error, recognizeFace, reset } = useFaceRecognition()

  const handleImageSelect = async (imageData) => {
    await recognizeFace(imageData)

    // Add to history
    const historyEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      image: imageData,
      result: result || { error: error },
    }
    setHistory((prev) => [historyEntry, ...prev])

    setCurrentView("results")
  }

  const handleReset = () => {
    reset()
    setCurrentView("upload")
  }

  const handleWebcamCapture = async (imageData) => {
    await recognizeFace(imageData)

    // Add to history
    const historyEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      image: imageData,
      result: result || { error: error },
    }
    setHistory((prev) => [historyEntry, ...prev])

    setCurrentView("results")
  }

  if (currentView === "webcam") {
    return (
      <WebcamCapture
        onCapture={handleWebcamCapture}
        onBack={() => setCurrentView("upload")}
        isProcessing={isProcessing}
      />
    )
  }

  if (currentView === "results" && (result || error)) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <ResultsDisplay result={result || { error }} onReset={handleReset} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4">
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Play className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Demo Mode:</strong> This app is running with mock face recognition responses. Connect your backend
            API to see real results.
          </AlertDescription>
        </Alert>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Face Recognition System</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced face detection and recognition powered by AI. Upload an image or use your camera to identify faces
            with high accuracy.
          </p>
        </div>

        {/* API Status */}
        <div className="mb-8">
          <ApiStatus />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="recognition" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="recognition" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Face Recognition
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History ({history.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recognition" className="space-y-8">
            {/* Input Method Selection */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-center">Choose Input Method</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2 bg-transparent"
                    onClick={() => setCurrentView("upload")}
                  >
                    <Upload className="h-8 w-8" />
                    <div>
                      <div className="font-semibold">Upload Image</div>
                      <div className="text-sm text-muted-foreground">Select from your device</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2 bg-transparent"
                    onClick={() => setCurrentView("webcam")}
                  >
                    <Camera className="h-8 w-8" />
                    <div>
                      <div className="font-semibold">Use Camera</div>
                      <div className="text-sm text-muted-foreground">Take a photo with webcam</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Image Upload Component */}
            {currentView === "upload" && <ImageUpload onImageSelect={handleImageSelect} isProcessing={isProcessing} />}

            {/* Features Section */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="rounded-full bg-blue-100 p-3 mx-auto mb-4 w-fit">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">AI-Powered Detection</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced machine learning algorithms for accurate face detection and recognition
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="rounded-full bg-green-100 p-3 mx-auto mb-4 w-fit">
                    <Camera className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Multiple Input Methods</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload images from your device or capture photos directly with your camera
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="rounded-full bg-purple-100 p-3 mx-auto mb-4 w-fit">
                    <History className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Recognition History</h3>
                  <p className="text-sm text-muted-foreground">
                    Track and review all your face recognition results with detailed analytics
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <HistorySection history={history} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
