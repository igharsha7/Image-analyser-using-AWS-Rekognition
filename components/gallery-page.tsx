"use client"

import { useEffect, useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, X } from "lucide-react"
import Image from "next/image"
import { ImageViewerModal } from "./image-viewer-modal"

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

export function GalleryPage() {
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [showOnlyWithFaces, setShowOnlyWithFaces] = useState(false)
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("/api/images")
        const data = await response.json()
        setImages(data)
      } catch (err) {
        setError("Failed to load images")
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [])

  const allLabels = useMemo(() => {
    const labels = new Set<string>()
    images.forEach((img) => {
      img.labels.forEach((label) => labels.add(label))
    })
    return Array.from(labels).sort()
  }, [images])

  const filteredImages = useMemo(() => {
    return images.filter((image) => {
      const matchesSearch =
        searchQuery === "" ||
        image.labels.some((label) => label.toLowerCase().includes(searchQuery.toLowerCase())) ||
        image.id.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesLabels = selectedLabels.length === 0 || selectedLabels.some((label) => image.labels.includes(label))

      const matchesFaces = !showOnlyWithFaces || image.faces.length > 0

      return matchesSearch && matchesLabels && matchesFaces
    })
  }, [images, searchQuery, selectedLabels, showOnlyWithFaces])

  const handleImageClick = (image: ImageData) => {
    setSelectedImage(image)
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-background via-background to-card/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-background via-background to-card/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center text-destructive">{error}</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-background via-background to-card/20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Image Gallery
            </span>
          </h1>
          <p className="text-muted-foreground">
            {filteredImages.length} of {images.length} {images.length === 1 ? "image" : "images"} shown
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 border-border/50 bg-card/50 p-6 backdrop-blur-sm">
          <div className="space-y-4">
            {/* Search Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Search</label>
              <Input
                type="text"
                placeholder="Search by label or image ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-border/50 bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Label Filters */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Filter by Labels</label>
              <div className="flex flex-wrap gap-2">
                {allLabels.map((label) => (
                  <Badge
                    key={label}
                    variant={selectedLabels.includes(label) ? "default" : "outline"}
                    className="cursor-pointer transition-all hover:opacity-80"
                    onClick={() => {
                      setSelectedLabels((prev) =>
                        prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
                      )
                    }}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Face Detection Filter */}
            <div className="flex items-center gap-4">
              <Button
                variant={showOnlyWithFaces ? "default" : "outline"}
                onClick={() => setShowOnlyWithFaces(!showOnlyWithFaces)}
                className="text-sm"
              >
                {showOnlyWithFaces ? "Showing" : "Show"} Images with Faces
              </Button>

              {/* Clear Filters */}
              {(searchQuery || selectedLabels.length > 0 || showOnlyWithFaces) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedLabels([])
                    setShowOnlyWithFaces(false)
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="mr-1 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Gallery Grid */}
        {filteredImages.length === 0 ? (
          <Card className="border-border/50 bg-card/50 p-12 text-center backdrop-blur-sm">
            <p className="text-muted-foreground">
              {images.length === 0
                ? "No images yet. Upload some images to get started!"
                : "No images match your filters. Try adjusting your search."}
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredImages.map((image) => (
              <Card
                key={image.id}
                className="group cursor-pointer overflow-hidden border-border/50 bg-card/50 transition-all hover:border-primary/50 hover:shadow-lg backdrop-blur-sm"
                onClick={() => handleImageClick(image)}
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image
                    src={image.imageUrl || "/placeholder.svg"}
                    alt="Gallery image"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={filteredImages.indexOf(image) < 3}
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  {/* Face Count Badge */}
                  {image.faces.length > 0 && (
                    <div className="absolute right-2 top-2 rounded-full bg-primary/90 px-2 py-1 text-xs font-medium text-primary-foreground">
                      {image.faces.length} {image.faces.length === 1 ? "face" : "faces"}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-4 p-4">
                  {/* Labels */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">DETECTED LABELS</p>
                    <div className="flex flex-wrap gap-2">
                      {image.labels.slice(0, 3).map((label) => (
                        <Badge key={label} variant="secondary" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                      {image.labels.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{image.labels.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Face Info */}
                  {image.faces.length > 0 && (
                    <div className="space-y-2 border-t border-border/50 pt-4">
                      <p className="text-xs font-medium text-muted-foreground">FACES DETECTED</p>
                      <div className="space-y-2">
                        {image.faces.slice(0, 2).map((face, idx) => (
                          <div key={idx} className="rounded-lg bg-muted/50 p-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{face.gender}</span>
                              <span className="text-muted-foreground">
                                {face.ageRange.low}-{face.ageRange.high}y
                              </span>
                            </div>
                            <div className="mt-1 text-muted-foreground">
                              {face.emotions[0]?.type} ({face.emotions[0]?.confidence}%)
                            </div>
                          </div>
                        ))}
                        {image.faces.length > 2 && (
                          <p className="text-xs text-muted-foreground">+{image.faces.length - 2} more faces</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="border-t border-border/50 pt-4">
                    <p className="text-xs text-muted-foreground">
                      {new Date(image.metadata.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      <ImageViewerModal image={selectedImage} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  )
}
