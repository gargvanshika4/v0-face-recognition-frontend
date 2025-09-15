"use client"

import { useState, useCallback } from "react"
import { faceRecognitionAPI, type RecognitionResponse } from "@/lib/face-recognition-api"
import { useToast } from "@/hooks/use-toast"

export interface HistoryEntry {
  id: number
  timestamp: string
  result: RecognitionResponse
  image: string
}

export function useFaceRecognition() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const { toast } = useToast()

  const recognizeImage = useCallback(
    async (imageData: string): Promise<RecognitionResponse> => {
      setIsProcessing(true)

      try {
        const result = await faceRecognitionAPI.recognizeFace(imageData)

        // Add to history
        const historyEntry: HistoryEntry = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          result,
          image: imageData,
        }

        setHistory((prev) => [historyEntry, ...prev.slice(0, 49)]) // Keep last 50 entries

        // Show toast notification
        if (result.error) {
          toast({
            title: "Recognition Failed",
            description: result.error,
            variant: "destructive",
          })
        } else if (result.name || (result.faces && result.faces.length > 0)) {
          const message = result.name ? `Recognized: ${result.name}` : `Detected ${result.faces?.length} face(s)`

          toast({
            title: "Recognition Successful",
            description: message,
          })
        } else {
          toast({
            title: "No Match Found",
            description: "No matching faces found in the database",
            variant: "default",
          })
        }

        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
        const errorResult: RecognitionResponse = { error: errorMessage }

        toast({
          title: "Recognition Error",
          description: errorMessage,
          variant: "destructive",
        })

        return errorResult
      } finally {
        setIsProcessing(false)
      }
    },
    [toast],
  )

  const clearHistory = useCallback(() => {
    setHistory([])
    toast({
      title: "History Cleared",
      description: "All recognition history has been cleared",
    })
  }, [toast])

  const checkAPIStatus = useCallback(async () => {
    try {
      const status = await faceRecognitionAPI.getStatus()
      return status
    } catch {
      return { status: "offline" as const }
    }
  }, [])

  return {
    recognizeImage,
    isProcessing,
    history,
    clearHistory,
    checkAPIStatus,
  }
}
