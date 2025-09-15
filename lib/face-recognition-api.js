// Face Recognition API utilities

/**
 * @typedef {Object} RecognitionRequest
 * @property {string} image - base64 encoded image
 */

/**
 * @typedef {Object} BoundingBox
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {Object} Face
 * @property {string} name
 * @property {number} confidence
 * @property {BoundingBox} [boundingBox]
 */

/**
 * @typedef {Object} RecognitionResponse
 * @property {string} [name]
 * @property {number} [confidence]
 * @property {string} [error]
 * @property {Face[]} [faces]
 * @property {number} [processingTime]
 */

export class FaceRecognitionAPI {
  /**
   * @param {string} baseUrl
   * @param {number} timeout
   * @param {boolean} demoMode - Enable demo mode with mock responses
   */
  constructor(baseUrl = "http://localhost:5000", timeout = 30000, demoMode = true) {
    this.baseUrl = baseUrl
    this.timeout = timeout
    this.demoMode = demoMode
  }

  /**
   * Send image for face recognition
   * @param {string} imageData - base64 encoded image
   * @returns {Promise<RecognitionResponse>}
   */
  async recognizeFace(imageData) {
    if (this.demoMode) {
      return this.getMockRecognitionResult()
    }

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
   * @returns {Promise<boolean>}
   */
  async healthCheck() {
    if (this.demoMode) {
      return false
    }

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
   * @returns {Promise<{status: "online" | "offline", version?: string, models?: string[]}>}
   */
  async getStatus() {
    if (this.demoMode) {
      return {
        status: "offline",
        message: "Demo Mode - Backend not connected",
        demoMode: true,
      }
    }

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

  /**
   * Generate mock recognition results for demo purposes
   * @returns {Promise<RecognitionResponse>}
   */
  async getMockRecognitionResult() {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000))

    const mockResults = [
      {
        faces: [
          {
            name: "John Doe",
            confidence: 0.92,
            boundingBox: { x: 120, y: 80, width: 180, height: 220 },
          },
        ],
        processingTime: 1.2,
      },
      {
        faces: [
          {
            name: "Jane Smith",
            confidence: 0.87,
            boundingBox: { x: 95, y: 65, width: 160, height: 200 },
          },
          {
            name: "Unknown Person",
            confidence: 0.45,
            boundingBox: { x: 300, y: 90, width: 140, height: 180 },
          },
        ],
        processingTime: 1.8,
      },
      {
        faces: [
          {
            name: "Unknown Person",
            confidence: 0.34,
            boundingBox: { x: 150, y: 100, width: 170, height: 210 },
          },
        ],
        processingTime: 0.9,
      },
      {
        faces: [],
        processingTime: 0.6,
      },
    ]

    // Return random result
    return mockResults[Math.floor(Math.random() * mockResults.length)]
  }
}

// Utility functions for image processing
export const imageUtils = {
  /**
   * Convert File to base64 string
   * @param {File} file
   * @returns {Promise<string>}
   */
  fileToBase64: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result
        resolve(result)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  },

  /**
   * Compress image if it's too large
   * @param {string} imageData
   * @param {number} maxWidth
   * @param {number} maxHeight
   * @param {number} quality
   * @returns {Promise<string>}
   */
  compressImage: (imageData, maxWidth = 1280, maxHeight = 720, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
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
   * @param {File} file
   * @returns {{valid: boolean, error?: string}}
   */
  validateImage: (file) => {
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

export const faceRecognitionAPI = new FaceRecognitionAPI(undefined, undefined, true)
