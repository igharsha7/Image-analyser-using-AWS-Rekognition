"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

type UploadState = "idle" | "loading" | "success" | "error"

export function UploadPage() {
  const [folderUrl, setFolderUrl] = useState("")
  const [state, setState] = useState<UploadState>("idle")
  const [processedCount, setProcessedCount] = useState(0)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState<"fetching" | "analyzing" | "uploading" | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folderUrl.trim()) {
      setError("Please enter a Google Drive folder URL")
      setState("error")
      return
    }

    setState("loading")
    setError("")
    setProgress("fetching")

    try {
      // Simulate progress stages
      await new Promise((resolve) => setTimeout(resolve, 800))
      setProgress("analyzing")
      await new Promise((resolve) => setTimeout(resolve, 1200))
      setProgress("uploading")

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderUrl }),
      })

      const data = await response.json()

      if (data.success) {
        setProcessedCount(data.processedCount)
        setState("success")
        setProgress(null)
        setFolderUrl("")
      } else {
        setError(data.message || "Failed to process images")
        setState("error")
        setProgress(null)
      }
    } catch (err) {
      setError("An error occurred while processing images")
      setState("error")
      setProgress(null)
    }
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-background via-background to-card/20">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              AI Image Analyzer
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload images from Google Drive and analyze them with AWS Rekognition
          </p>
        </div>

        {/* Main Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Input Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Google Drive Folder URL</label>
                <Input
                  type="url"
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={folderUrl}
                  onChange={(e) => setFolderUrl(e.target.value)}
                  disabled={state === "loading"}
                  className="border-border/50 bg-input text-foreground placeholder:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Supports public Google Drive folder links with nested subfolders
                </p>
              </div>

              {/* Progress Indicator */}
              {state === "loading" && progress && (
                <div className="space-y-3 rounded-lg bg-muted/30 p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {progress === "fetching" && "Fetching images..."}
                      {progress === "analyzing" && "Analyzing images..."}
                      {progress === "uploading" && "Uploading results..."}
                    </span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{
                        width: progress === "fetching" ? "33%" : progress === "analyzing" ? "66%" : "100%",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Success Message */}
              {state === "success" && (
                <div className="flex gap-3 rounded-lg bg-green-500/10 p-4">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
                  <div>
                    <p className="font-medium text-green-500">Success!</p>
                    <p className="text-sm text-green-500/80">
                      Successfully processed {processedCount} images. View them in the{" "}
                      <a href="/gallery" className="underline hover:no-underline">
                        Gallery
                      </a>
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {state === "error" && error && (
                <div className="flex gap-3 rounded-lg bg-destructive/10 p-4">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">Error</p>
                    <p className="text-sm text-destructive/80">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={state === "loading" || !folderUrl.trim()}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                size="lg"
              >
                {state === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Process & Upload Images"
                )}
              </Button>
            </form>
          </div>
        </Card>

        {/* Info Section */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Card className="border-border/50 bg-card/30 p-4">
            <div className="text-sm font-medium text-primary">Supported</div>
            <p className="mt-1 text-xs text-muted-foreground">Public Google Drive folders with nested subfolders</p>
          </Card>
          <Card className="border-border/50 bg-card/30 p-4">
            <div className="text-sm font-medium text-primary">Analysis</div>
            <p className="mt-1 text-xs text-muted-foreground">AWS Rekognition for labels, faces, and attributes</p>
          </Card>
          <Card className="border-border/50 bg-card/30 p-4">
            <div className="text-sm font-medium text-primary">Features</div>
            <p className="mt-1 text-xs text-muted-foreground">Search, filter, and visualize face detection</p>
          </Card>
        </div>
      </div>
    </main>
  )
}
