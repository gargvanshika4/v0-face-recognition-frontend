"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, User, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Trash2, Download, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface HistoryEntry {
  id: number
  timestamp: string
  result: {
    name?: string
    confidence?: number
    error?: string
    faces?: Array<{
      name: string
      confidence: number
    }>
  }
  image: string
}

interface HistorySectionProps {
  history: HistoryEntry[]
}

export function HistorySection({ history }: HistorySectionProps) {
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null)

  const getStatusIcon = (result: HistoryEntry["result"]) => {
    if (result.error) {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    if (result.name || (result.faces && result.faces.length > 0)) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return <XCircle className="h-4 w-4 text-yellow-500" />
  }

  const getStatusText = (result: HistoryEntry["result"]) => {
    if (result.error) return "Error"
    if (result.name) return result.name
    if (result.faces && result.faces.length > 0) {
      return `${result.faces.length} face${result.faces.length > 1 ? "s" : ""} detected`
    }
    return "No match found"
  }

  const getStatusBadge = (result: HistoryEntry["result"]) => {
    if (result.error) {
      return <Badge variant="destructive">Failed</Badge>
    }
    if (result.name || (result.faces && result.faces.length > 0)) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Recognized
        </Badge>
      )
    }
    return <Badge variant="secondary">Unknown</Badge>
  }

  const clearHistory = () => {
    // This would typically call a parent function to clear history
    console.log("Clear history requested")
  }

  const downloadEntry = (entry: HistoryEntry) => {
    // Create download link for the result
    const data = {
      timestamp: entry.timestamp,
      result: entry.result,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `recognition-result-${entry.id}.json`
    a.click()
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
          <p className="text-muted-foreground">View your past recognition attempts and results</p>
        </div>

        {history.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearHistory}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear History
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <History className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No History Yet</h3>
            <p className="text-sm text-muted-foreground text-center">
              Your recognition history will appear here after you process some images
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* History List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <div className="space-y-1 p-4">
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedEntry?.id === entry.id ? "bg-muted border-primary" : ""
                      }`}
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="mt-0.5">{getStatusIcon(entry.result)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{getStatusText(entry.result)}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getStatusBadge(entry.result)}
                          {entry.result.confidence && (
                            <span className="text-xs text-muted-foreground">
                              {(entry.result.confidence * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Selected Entry Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{selectedEntry ? "Entry Details" : "Select an Entry"}</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedEntry ? (
                <div className="space-y-4">
                  {/* Image Preview */}
                  <div className="relative">
                    <img
                      src={selectedEntry.image || "/placeholder.svg"}
                      alt="Recognition attempt"
                      className="w-full max-w-sm mx-auto rounded-lg border"
                    />
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Processed:</span>
                    <span className="font-medium">{new Date(selectedEntry.timestamp).toLocaleString()}</span>
                  </div>

                  {/* Results */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      {getStatusIcon(selectedEntry.result)}
                      Recognition Result
                    </h4>

                    {selectedEntry.result.error ? (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">{selectedEntry.result.error}</p>
                      </div>
                    ) : selectedEntry.result.name ? (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">{selectedEntry.result.name}</span>
                        </div>
                        {selectedEntry.result.confidence && (
                          <p className="text-sm text-green-700">
                            Confidence: {(selectedEntry.result.confidence * 100).toFixed(1)}%
                          </p>
                        )}
                      </div>
                    ) : selectedEntry.result.faces && selectedEntry.result.faces.length > 0 ? (
                      <div className="space-y-2">
                        {selectedEntry.result.faces.map((face, index) => (
                          <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-800">{face.name}</span>
                            </div>
                            <p className="text-sm text-green-700">Confidence: {(face.confidence * 100).toFixed(1)}%</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">No matching face found</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm" onClick={() => downloadEntry(selectedEntry)} className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Eye className="h-4 w-4 mr-2" />
                      View Full
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Eye className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Select an entry from the history list to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
