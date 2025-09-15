// Face Recognition API utilities and types

export interface RecognitionRequest {
  image: string // base64 encoded image
}

export interface RecognitionResponse {
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
  processingTime?: number
}

export class FaceRecognitionAPI {
  private baseUrl: string
  private timeout: number

  constructor(baseUrl = "http://localhost:5000", timeout = 30000) {
    this.baseUrl = baseUrl
    this.timeout = timeout
  }

  /**
   * Send image for face recognition
   */
  async recognizeFace(imageData: string): Promise<RecognitionResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(`${this.baseUrl}/recognize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageData }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return { error: "Request timeout - please try again" }
        }
        if (error.message.includes("Failed to fetch")) {
          return { error: "Backend not responding - please check if the server is running" }
        }
        return { error: error.message }
      }

      return { error: "Unknown error occurred during recognition" }
    }
  }

  /**
   * Check if the backend API is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        timeout: 5000,
      })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Get API status and information
   */
  async getStatus(): Promise<{
    status: "online" | "offline"
    version?: string
    models?: string[]
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/status`)
      if (response.ok) {
        const data = await response.json()
        return { status: "online", ...data }
      }
    } catch {
      // API is offline
    }
    return { status: "offline" }
  }
}

// Utility functions for image processing
export const imageUtils = {
  /**
   * Convert File to base64 string
   */
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  },

  /**
   * Compress image if it's too large
   */
  compressImage: (imageData: string, maxWidth = 1280, maxHeight = 720, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        const compressedData = canvas.toDataURL("image/jpeg", quality)
        resolve(compressedData)
      }

      img.src = imageData
    })
  },

  /**
   * Validate image format and size
   */
  validateImage: (file: File): { valid: boolean; error?: string } => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png"]
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Invalid file type. Please use JPG, JPEG, or PNG files.",
      }
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: "File too large. Please use files smaller than 10MB.",
      }
    }

    return { valid: true }
  },
}

// Create default API instance
export const faceRecognitionAPI = new FaceRecognitionAPI()
