"use client"

import { useState, useCallback } from "react"
import { faceRecognitionAPI } from "@/lib/face-recognition-api"

/**
 * @typedef {Object} UseFaceRecognitionReturn
 * @property {boolean} isProcessing
 * @property {Object|null} result
 * @property {string|null} error
 * @property {function(string): Promise<void>} recognizeFace
 * @property {function(): void} reset
 * @property {function(): Promise<boolean>} checkHealth
 */

/**
 * Custom hook for face recognition functionality
 * @returns {UseFaceRecognitionReturn}
 */
export function useFaceRecognition() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const recognizeFace = useCallback(async (imageData) => {
    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      const response = await faceRecognitionAPI.recognizeFace(imageData)

      if (response.error) {
        setError(response.error)
      } else {
        setResult(response)
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setIsProcessing(false)
  }, [])

  const checkHealth = useCallback(async () => {
    return await faceRecognitionAPI.healthCheck()
  }, [])

  return {
    isProcessing,
    result,
    error,
    recognizeFace,
    reset,
    checkHealth,
  }
}
