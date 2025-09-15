"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, AlertCircle, ArrowLeft, User, Clock, Percent } from "lucide-react"

/**
 * @param {Object} props
 * @param {Object} props.result - Recognition result object
 * @param {function(): void} props.onReset - Callback to reset and go back
 */
export function ResultsDisplay({ result, onReset }) {
  const hasError = result?.error
  const faces = result?.faces || []
  const processingTime = result?.processing_time || 0

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceBadge = (confidence) => {
    if (confidence >= 0.8) return "default"
    if (confidence >= 0.6) return "secondary"
    return "destructive"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recognition Results</h2>
          <p className="text-muted-foreground">Analysis complete</p>
        </div>
        <Button variant="outline" onClick={onReset}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Upload
        </Button>
      </div>

      {hasError ? (
        <Card className="border-destructive/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="h-6 w-6 text-destructive" />
              <div>
                <h3 className="font-semibold text-destructive">Recognition Failed</h3>
                <p className="text-sm text-muted-foreground">{result.error}</p>
              </div>
            </div>

            <div className="bg-destructive/5 p-4 rounded-lg">
              <p className="text-sm">
                Please ensure your backend server is running on http://localhost:5000 and try again.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{faces.length}</div>
                  <div className="text-sm text-muted-foreground">Faces Detected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{processingTime.toFixed(2)}s</div>
                  <div className="text-sm text-muted-foreground">Processing Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{faces.length > 0 ? "✓" : "✗"}</div>
                  <div className="text-sm text-muted-foreground">Recognition Status</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Faces Results */}
          {faces.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Detected Faces</h3>
              {faces.map((face, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Face {index + 1}</h4>
                          <p className="text-sm text-muted-foreground">
                            Position: ({face.bbox?.x || 0}, {face.bbox?.y || 0})
                          </p>
                        </div>
                      </div>

                      {face.confidence && (
                        <Badge variant={getConfidenceBadge(face.confidence)}>
                          <Percent className="mr-1 h-3 w-3" />
                          {(face.confidence * 100).toFixed(1)}%
                        </Badge>
                      )}
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">Bounding Box</h5>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>X: {face.bbox?.x || 0}px</div>
                          <div>Y: {face.bbox?.y || 0}px</div>
                          <div>Width: {face.bbox?.width || 0}px</div>
                          <div>Height: {face.bbox?.height || 0}px</div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Recognition Details</h5>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {face.identity ? <div>Identity: {face.identity}</div> : <div>Identity: Unknown</div>}
                          {face.confidence && (
                            <div className={getConfidenceColor(face.confidence)}>
                              Confidence: {(face.confidence * 100).toFixed(1)}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {face.landmarks && (
                      <>
                        <Separator className="my-4" />
                        <div>
                          <h5 className="font-medium mb-2">Facial Landmarks</h5>
                          <div className="text-sm text-muted-foreground">
                            {Object.keys(face.landmarks).length} landmarks detected
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Faces Detected</h3>
                <p className="text-sm text-muted-foreground">
                  The image was processed successfully, but no faces were found. Try uploading an image with clearly
                  visible faces.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Processing Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Processing Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processing Time:</span>
                  <span>{processingTime.toFixed(3)} seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timestamp:</span>
                  <span>{new Date().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-green-600">Completed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
