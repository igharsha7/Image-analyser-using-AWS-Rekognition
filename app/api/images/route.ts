import { NextResponse } from "next/server"
import { getS3Service } from '@/lib/config'

/**
 * Mock data store for development/testing
 * Used when AWS credentials are not configured
 */
const mockImageStore: Record<string, any> = {
  "1": {
    id: "1",
    imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=800&fit=crop",
    labels: ["Meeting", "Office", "Business", "People", "Conference"],
    faces: [
      {
        boundingBox: { top: 0.1, left: 0.2, width: 0.3, height: 0.4 },
        ageRange: { low: 25, high: 35 },
        emotions: [{ type: "HAPPY", confidence: 95 }],
        gender: "Male",
      },
      {
        boundingBox: { top: 0.15, left: 0.55, width: 0.25, height: 0.35 },
        ageRange: { low: 30, high: 40 },
        emotions: [{ type: "NEUTRAL", confidence: 88 }],
        gender: "Female",
      },
    ],
    metadata: { uploadedAt: new Date().toISOString() },
  },
  "2": {
    id: "2",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=800&fit=crop",
    labels: ["Technology", "Workspace", "Computer", "Modern", "Office"],
    faces: [
      {
        boundingBox: { top: 0.2, left: 0.3, width: 0.35, height: 0.45 },
        ageRange: { low: 20, high: 30 },
        emotions: [{ type: "FOCUSED", confidence: 92 }],
        gender: "Male",
      },
    ],
    metadata: { uploadedAt: new Date().toISOString() },
  },
  "3": {
    id: "3",
    imageUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=800&fit=crop",
    labels: ["Team", "Collaboration", "Brainstorm", "Creative", "People"],
    faces: [
      {
        boundingBox: { top: 0.1, left: 0.1, width: 0.3, height: 0.4 },
        ageRange: { low: 28, high: 38 },
        emotions: [{ type: "HAPPY", confidence: 90 }],
        gender: "Female",
      },
      {
        boundingBox: { top: 0.12, left: 0.45, width: 0.28, height: 0.38 },
        ageRange: { low: 32, high: 42 },
        emotions: [{ type: "HAPPY", confidence: 87 }],
        gender: "Male",
      },
      {
        boundingBox: { top: 0.15, left: 0.75, width: 0.2, height: 0.35 },
        ageRange: { low: 25, high: 35 },
        emotions: [{ type: "NEUTRAL", confidence: 85 }],
        gender: "Female",
      },
    ],
    metadata: { uploadedAt: new Date().toISOString() },
  },
}

/**
 * GET /api/images
 * Retrieves all processed images with their metadata
 * Falls back to mock data if AWS is not configured
 */
export async function GET() {
  try {
    // Check if AWS credentials are configured
    const hasAwsConfig = process.env.AWS_S3_BUCKET_NAME && 
                         process.env.AWS_ACCESS_KEY_ID && 
                         process.env.AWS_SECRET_ACCESS_KEY

    if (!hasAwsConfig) {
      console.log('WARNING: AWS not configured, returning mock data')
      return NextResponse.json(Object.values(mockImageStore))
    }

    // Fetch real data from S3
    console.log('Fetching images from S3...')
    const s3Service = getS3Service()
    const images = await s3Service.listAllMetadata()

    console.log(`Retrieved ${images.length} image(s) from S3`)

    // If no images in S3, return mock data for development
    if (images.length === 0) {
      console.log('WARNING: No images in S3, returning mock data')
      return NextResponse.json(Object.values(mockImageStore))
    }

    return NextResponse.json(images)
  } catch (error) {
    console.error('ERROR: Failed to fetch images:', error)
    
    // Fallback to mock data on error
    console.log('WARNING: Error occurred, returning mock data')
    return NextResponse.json(Object.values(mockImageStore))
  }
}
