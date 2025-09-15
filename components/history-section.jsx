"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { History, Eye, Download, Calendar } from "lucide-react"

/**
 * @param {Object} props
 * @param {Array} props.history - Array of recognition history entries
 */
export function HistorySection({ history }) {
  const [selectedEntry, setSelectedEntry] = useState(null)

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const getStatusBadge = (result) => {
    if (result.error) return { variant: "destructive", text: "Failed" }
    if (result.faces && result.faces.length > 0) return { variant: "default", text: "Success" }
    return { variant: "secondary", text: "No Faces" }
  }

  const downloadResult = (entry) => {
    const dataStr = JSON.stringify(entry, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `recognition-result-${entry.id}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6" />
            Recognition History
          </h2>
          <p className="text-muted-foreground">
            {history.length} recognition{history.length !== 1 ? "s" : ""} performed
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {history.map((entry) => {
          const status = getStatusBadge(entry.result)
          const facesCount = entry.result.faces?.length || 0

          return (
            <Card key={entry.id} className="transition-colors hover:bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="relative">
                      <img
                        src={entry.image || "/placeholder.svg"}
                        alt="Recognition input"
                        className="w-16 h-16 rounded-lg object-cover border"
                      />
                      {facesCount > 0 && (
                        <Badge
                          className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                          variant="default"
                        >
                          {facesCount}
                        </Badge>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={status.variant}>{status.text}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {facesCount} face{facesCount !== 1 ? "s" : ""} detected
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(entry.timestamp)}
                      </div>

                      {entry.result.processing_time && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Processed in {entry.result.processing_time.toFixed(2)}s
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedEntry(selectedEntry === entry.id ? null : entry.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button variant="ghost" size="sm" onClick={() => downloadResult(entry)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {selectedEntry === entry.id && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-3">
                      <h4 className="font-medium">Detailed Results</h4>

                      {entry.result.error ? (
                        <div className="bg-destructive/5 p-3 rounded-lg">
                          <p className="text-sm text-destructive">{entry.result.error}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {entry.result.faces?.map((face, index) => (
                            <div key={index} className="bg-muted/50 p-3 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium">Face {index + 1}</span>
                                {face.confidence && (
                                  <Badge variant="outline">{(face.confidence * 100).toFixed(1)}% confidence</Badge>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Position:</span>
                                  <div>
                                    ({face.bbox?.x || 0}, {face.bbox?.y || 0})
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Size:</span>
                                  <div>
                                    {face.bbox?.width || 0} × {face.bbox?.height || 0}
                                  </div>
                                </div>
                                {face.identity && (
                                  <div className="col-span-2">
                                    <span className="text-muted-foreground">Identity:</span>
                                    <div>{face.identity}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {history.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No History Yet</h3>
            <p className="text-sm text-muted-foreground">
              Recognition results will appear here after you process images.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
