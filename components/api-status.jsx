"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, RefreshCw, Server, Play } from "lucide-react"
import { faceRecognitionAPI } from "@/lib/face-recognition-api"

/**
 * @param {Object} props
 * @param {string} [props.apiUrl="http://localhost:5000"] - API base URL
 */
export function ApiStatus({ apiUrl = "http://localhost:5000" }) {
  const [status, setStatus] = useState("checking")
  const [lastChecked, setLastChecked] = useState(null)
  const [error, setError] = useState("")
  const [isDemoMode, setIsDemoMode] = useState(faceRecognitionAPI.demoMode)

  const checkApiStatus = async () => {
    setStatus("checking")
    setError("")

    try {
      const apiStatus = await faceRecognitionAPI.getStatus()

      if (apiStatus.demoMode) {
        setStatus("demo")
        setIsDemoMode(true)
      } else if (apiStatus.status === "online") {
        setStatus("online")
        setIsDemoMode(false)
      } else {
        setStatus("offline")
        setIsDemoMode(false)
        setError("Unable to connect to the API server")
      }
    } catch (err) {
      setStatus("offline")
      setIsDemoMode(false)
      setError("Unable to connect to the API server")
    } finally {
      setLastChecked(new Date())
    }
  }

  useEffect(() => {
    checkApiStatus()
    // Check status every 30 seconds
    const interval = setInterval(checkApiStatus, 30000)
    return () => clearInterval(interval)
  }, [apiUrl])

  const getStatusIcon = () => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "demo":
        return <Play className="h-4 w-4 text-blue-600" />
      case "offline":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      default:
        return <Server className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case "online":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Online</Badge>
      case "demo":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Demo Mode</Badge>
      case "offline":
        return <Badge variant="destructive">Offline</Badge>
      case "checking":
        return <Badge variant="secondary">Checking...</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">API Server</span>
                {getStatusBadge()}
              </div>
              <div className="text-sm text-muted-foreground">{isDemoMode ? "Demo Mode - Mock responses" : apiUrl}</div>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={checkApiStatus} disabled={status === "checking"}>
            <RefreshCw className={`h-4 w-4 ${status === "checking" ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {isDemoMode && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              🎭 Demo Mode Active - The app will show mock face recognition results. Connect your backend to see real
              results.
            </p>
          </div>
        )}

        {lastChecked && (
          <div className="mt-2 text-xs text-muted-foreground">Last checked: {lastChecked.toLocaleTimeString()}</div>
        )}

        {status === "offline" && !isDemoMode && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">Make sure your backend server is running on {apiUrl}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
