"use client"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, ImageIcon, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * @param {Object} props
 * @param {function(string): void} props.onImageSelect - Callback when image is selected
 * @param {boolean} props.isProcessing - Whether image is being processed
 */
export function ImageUpload({ onImageSelect, isProcessing }) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [fileName, setFileName] = useState("")
  const fileInputRef = useRef(null)

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleChange = useCallback((e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }, [])

  const handleFile = (file) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png"]
    if (!validTypes.includes(file.type)) {
      alert("Please select a valid image file (JPG, JPEG, or PNG)")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB")
      return
    }

    setFileName(file.name)

    // Convert to base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      setSelectedImage(result)
    }
    reader.readAsDataURL(file)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleProcess = () => {
    if (selectedImage) {
      onImageSelect(selectedImage)
    }
  }

  const handleReset = () => {
    setSelectedImage(null)
    setFileName("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Upload Image for Recognition</h2>
        <p className="text-muted-foreground">Select an image file or drag and drop it below</p>
      </div>

      {!selectedImage ? (
        <Card
          className={cn(
            "border-2 border-dashed transition-colors cursor-pointer",
            dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>

            <h3 className="text-lg font-semibold mb-2">
              {dragActive ? "Drop your image here" : "Choose an image to upload"}
            </h3>

            <p className="text-sm text-muted-foreground text-center mb-4">
              Drag and drop your image here, or click to browse
            </p>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Supports: JPG, JPEG, PNG</span>
              <span>•</span>
              <span>Max size: 10MB</span>
            </div>

            <Button className="mt-4 bg-transparent" variant="outline">
              <ImageIcon className="mr-2 h-4 w-4" />
              Browse Files
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold">Selected Image</h3>
                <p className="text-sm text-muted-foreground">{fileName}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset} disabled={isProcessing}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="relative mb-6">
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="Selected for recognition"
                className="w-full max-w-md mx-auto rounded-lg border"
              />
            </div>

            {isProcessing && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Processing image...</span>
                </div>
                <Progress value={undefined} className="w-full" />
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={handleProcess} disabled={isProcessing} className="flex-1">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Recognize Face"
                )}
              </Button>

              <Button variant="outline" onClick={handleReset} disabled={isProcessing}>
                Choose Different Image
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png" onChange={handleChange} className="hidden" />
    </div>
  )
}
