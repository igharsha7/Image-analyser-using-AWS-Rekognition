"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Eye, Zap } from "lucide-react"
import { FaceOverlay } from "./face-overlay"

interface ImageCardProps {
  image: {
    id: string
    imageUrl: string
    labels: string[]
    faces: any[]
    metadata: any
  }
}

export function ImageCard({ image }: ImageCardProps) {
  const [showFaceBoxes, setShowFaceBoxes] = useState(false)
  const [showAttributes, setShowAttributes] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const visibleLabels = image.labels.slice(0, 5)
  const hiddenLabelsCount = Math.max(0, image.labels.length - 5)

  return (
    <Card className="group overflow-hidden border-border/50 bg-card/50 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={image.imageUrl || "/placeholder.svg"}
          alt="Gallery image"
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onLoadingComplete={() => setImageLoaded(true)}
        />

        {/* Face Count Badge */}
        {image.faces.length > 0 && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-primary/90 px-2 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm">
            <Users className="h-3 w-3" />
            {image.faces.length}
          </div>
        )}

        {/* Face Overlay */}
        {imageLoaded && (showFaceBoxes || showAttributes || showDetails) && (
          <FaceOverlay
            faces={image.faces}
            showBoxes={showFaceBoxes}
            showAttributes={showAttributes}
            showDetails={showDetails}
          />
        )}
      </div>

      {/* Content */}
      <div className="space-y-4 p-4">
        {/* Labels */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {visibleLabels.map((label) => (
              <Badge key={label} variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
                {label}
              </Badge>
            ))}
            {hiddenLabelsCount > 0 && (
              <Badge variant="outline" className="border-border/50">
                +{hiddenLabelsCount} more
              </Badge>
            )}
          </div>
        </div>

        {/* Toggle Buttons */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant={showFaceBoxes ? "default" : "outline"}
              onClick={() => setShowFaceBoxes(!showFaceBoxes)}
              className={showFaceBoxes ? "bg-primary text-primary-foreground" : ""}
              disabled={image.faces.length === 0}
            >
              <Eye className="mr-1 h-3 w-3" />
              Boxes
            </Button>
            <Button
              size="sm"
              variant={showAttributes ? "default" : "outline"}
              onClick={() => setShowAttributes(!showAttributes)}
              className={showAttributes ? "bg-primary text-primary-foreground" : ""}
              disabled={image.faces.length === 0}
            >
              <Zap className="mr-1 h-3 w-3" />
              Attributes
            </Button>
          </div>
          <Button
            size="sm"
            variant={showDetails ? "default" : "outline"}
            onClick={() => setShowDetails(!showDetails)}
            className={`w-full ${showDetails ? "bg-primary text-primary-foreground" : ""}`}
            disabled={image.faces.length === 0}
          >
            Details
          </Button>
        </div>

        {/* Details Panel */}
        {showDetails && image.faces.length > 0 && (
          <div className="space-y-2 rounded-lg bg-muted/30 p-3 text-xs">
            {image.faces.map((face, idx) => (
              <div key={idx} className="space-y-1 border-b border-border/30 pb-2 last:border-0">
                <div className="font-medium text-foreground">Face {idx + 1}</div>
                <div className="text-muted-foreground">
                  Age: {face.ageRange.low}-{face.ageRange.high}
                </div>
                <div className="text-muted-foreground">Gender: {face.gender}</div>
                {face.emotions && face.emotions.length > 0 && (
                  <div className="text-muted-foreground">
                    Emotion: {face.emotions[0].type} ({face.emotions[0].confidence}%)
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
