"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface Face {
  boundingBox: { top: number; left: number; width: number; height: number }
  ageRange: { low: number; high: number }
  emotions: Array<{ type: string; confidence: number }>
  gender: string
}

interface ImageData {
  id: string
  imageUrl: string
  labels: string[]
  faces: Face[]
  metadata: { uploadedAt: string }
}

interface ImageViewerModalProps {
  image: ImageData | null
  isOpen: boolean
  onClose: () => void
}

export function ImageViewerModal({ image, isOpen, onClose }: ImageViewerModalProps) {
  const [showFaceOverlays, setShowFaceOverlays] = useState(true)
  const [selectedFaceIndex, setSelectedFaceIndex] = useState<number | null>(null)

  if (!image) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl border-border/50 bg-card/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Image Details - {image.id}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Image with Face Overlays */}
          <div className="md:col-span-2">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image src={image.imageUrl || "/placeholder.svg"} alt="Detailed view" fill className="object-cover" />

              {/* Face Detection Overlays */}
              {showFaceOverlays &&
                image.faces.map((face, idx) => {
                  const isSelected = selectedFaceIndex === idx
                  const bbox = face.boundingBox
                  return (
                    <div
                      key={idx}
                      className="absolute cursor-pointer transition-all"
                      style={{
                        top: `${bbox.top * 100}%`,
                        left: `${bbox.left * 100}%`,
                        width: `${bbox.width * 100}%`,
                        height: `${bbox.height * 100}%`,
                      }}
                      onClick={() => setSelectedFaceIndex(isSelected ? null : idx)}
                    >
                      <div
                        className={`h-full w-full border-2 transition-all ${
                          isSelected
                            ? "border-accent bg-accent/10"
                            : "border-primary/60 bg-primary/5 hover:border-accent hover:bg-accent/10"
                        }`}
                      />
                      {/* Face Number Badge */}
                      <div
                        className={`absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${
                          isSelected ? "bg-accent" : "bg-primary"
                        }`}
                      >
                        {idx + 1}
                      </div>
                    </div>
                  )
                })}
            </div>

            {/* Controls */}
            <div className="mt-4 flex gap-2">
              <Button
                variant={showFaceOverlays ? "default" : "outline"}
                onClick={() => setShowFaceOverlays(!showFaceOverlays)}
                className="flex-1"
              >
                {showFaceOverlays ? "Hide" : "Show"} Face Overlays
              </Button>
              <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Close
              </Button>
            </div>
          </div>

          {/* Details Panel */}
          <div className="space-y-6">
            {/* Labels */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Detected Labels</h3>
              <div className="flex flex-wrap gap-2">
                {image.labels.map((label) => (
                  <Badge key={label} variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Faces List */}
            {image.faces.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Detected Faces ({image.faces.length})</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {image.faces.map((face, idx) => (
                    <div
                      key={idx}
                      className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                        selectedFaceIndex === idx
                          ? "border-accent bg-accent/10"
                          : "border-border/50 bg-muted/50 hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedFaceIndex(selectedFaceIndex === idx ? null : idx)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Face {idx + 1}</span>
                        <Badge variant="outline" className="text-xs">
                          {face.gender}
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <div>
                          Age: {face.ageRange.low}-{face.ageRange.high} years
                        </div>
                        <div>
                          Emotion: {face.emotions[0]?.type} ({face.emotions[0]?.confidence}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="space-y-2 border-t border-border/50 pt-4">
              <h3 className="font-semibold text-foreground">Metadata</h3>
              <div className="text-xs text-muted-foreground">
                <div>ID: {image.id}</div>
                <div>Uploaded: {new Date(image.metadata.uploadedAt).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
