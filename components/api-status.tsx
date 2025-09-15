"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, RefreshCw, Server } from "lucide-react"
import { faceRecognitionAPI } from "@/lib/face-recognition-api"

export function APIStatus() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking")
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const checkStatus = async () => {
    setIsRefreshing(true)
    try {
      const isOnline = await faceRecognitionAPI.healthCheck()
      setStatus(isOnline ? "online" : "offline")
      setLastChecked(new Date())
    } catch {
      setStatus("offline")
      setLastChecked(new Date())
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    checkStatus()
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = () => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "offline":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <RefreshCw className="h-4 w-4 text-gray-500 animate-spin" />
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case "online":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Online
          </Badge>
        )
      case "offline":
        return <Badge variant="destructive">Offline</Badge>
      default:
        return <Badge variant="secondary">Checking...</Badge>
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">API Status</span>
          </div>
          {getStatusBadge()}
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm text-muted-foreground">
              {status === "online"
                ? "Backend connected"
                : status === "offline"
                  ? "Backend unavailable"
                  : "Checking connection..."}
            </span>
          </div>

          <Button variant="ghost" size="sm" onClick={checkStatus} disabled={isRefreshing}>
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {lastChecked && (
          <p className="text-xs text-muted-foreground mt-2">Last checked: {lastChecked.toLocaleTimeString()}</p>
        )}

        {status === "offline" && (
          <p className="text-xs text-red-600 mt-2">Make sure the backend server is running on localhost:5000</p>
        )}
      </CardContent>
    </Card>
  )
}
