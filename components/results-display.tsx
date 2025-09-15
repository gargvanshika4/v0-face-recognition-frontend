"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, User, RotateCcw, Download, Share2 } from "lucide-react"

interface RecognitionResult {
  name?: string
  confidence?: number
  error?: string
  faces?: Array<{
    name: string
    confidence: number
    boundingBox?: {
      x: number
      y: number
      width: number
      height: number
    }
  }>
}

interface ResultsDisplayProps {
  result: RecognitionResult
  onReset: () => void
}

export function ResultsDisplay({ result, onReset }: ResultsDisplayProps) {
  const hasError = !!result.error
  const hasRecognition = result.name || (result.faces && result.faces.length > 0)
  const isUnknown = !hasError && !hasRecognition

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High Confidence"
    if (confidence >= 0.6) return "Medium Confidence"
    return "Low Confidence"
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Recognition Results</h2>
        <p className="text-muted-foreground">Analysis complete - see the results below</p>
      </div>

      {/* Error State */}
      {hasError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      )}

      {/* Success State */}
      {hasRecognition && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-800">Face Recognized</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Single face result */}
            {result.name && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{result.name}</h3>
                    <p className="text-sm text-muted-foreground">Identified Person</p>
                  </div>
                </div>

                {result.confidence && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Confidence Score</span>
                      <Badge variant="secondary" className={getConfidenceColor(result.confidence)}>
                        {getConfidenceLabel(result.confidence)}
                      </Badge>
                    </div>
                    <Progress value={result.confidence * 100} className="h-2" />
                    <p className="text-sm text-muted-foreground text-right">
                      {(result.confidence * 100).toFixed(1)}% match
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Multiple faces result */}
            {result.faces && result.faces.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">
                  {result.faces.length} Face{result.faces.length > 1 ? "s" : ""} Detected
                </h3>
                {result.faces.map((face, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{face.name}</h4>
                        <p className="text-sm text-muted-foreground">Face #{index + 1}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Confidence</span>
                        <Badge variant="secondary" className={getConfidenceColor(face.confidence)}>
                          {getConfidenceLabel(face.confidence)}
                        </Badge>
                      </div>
                      <Progress value={face.confidence * 100} className="h-2" />
                      <p className="text-sm text-muted-foreground text-right">
                        {(face.confidence * 100).toFixed(1)}% match
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Unknown/No Match State */}
      {isUnknown && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-yellow-800">No Match Found</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="rounded-full bg-yellow-100 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <User className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold mb-2">Unknown Person</h3>
              <p className="text-sm text-muted-foreground">
                No matching face found in the database. The person may not be registered or the image quality might need
                improvement.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={onReset} variant="outline" className="flex-1 sm:flex-none bg-transparent">
          <RotateCcw className="mr-2 h-4 w-4" />
          Try Another Image
        </Button>

        <Button variant="outline" className="flex-1 sm:flex-none bg-transparent">
          <Download className="mr-2 h-4 w-4" />
          Download Results
        </Button>

        <Button variant="outline" className="flex-1 sm:flex-none bg-transparent">
          <Share2 className="mr-2 h-4 w-4" />
          Share Results
        </Button>
      </div>

      {/* Additional Info */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h4 className="font-medium">Recognition Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Processing Time:</span>
                <p className="font-medium">2.3 seconds</p>
              </div>
              <div>
                <span className="text-muted-foreground">Algorithm:</span>
                <p className="font-medium">Deep Neural Network</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
