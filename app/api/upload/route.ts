import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from 'uuid'
import {
  getGoogleDriveService,
  getCompressionService,
  getRekognitionService,
  getS3Service,
} from '@/lib/config'

/**
 * POST /api/upload
 * Handles the complete image processing pipeline:
 * 1. Fetch images from Google Drive
 * 2. Compress large images
 * 3. Analyze with AWS Rekognition
 * 4. Upload to S3 with metadata
 */
export async function POST(request: NextRequest) {
  try {
    const { folderUrl } = await request.json()

    if (!folderUrl) {
      return NextResponse.json({ success: false, message: "Folder URL is required" }, { status: 400 })
    }

    console.log(`\nStarting image processing for folder: ${folderUrl}`)

    // Initialize all required services
    const driveService = getGoogleDriveService()
    const compressionService = getCompressionService()
    const rekognitionService = getRekognitionService()
    const s3Service = getS3Service()

    // Initialize Rekognition face collection (create if doesn't exist)
    console.log('\nInitializing AWS Rekognition face collection...')
    await rekognitionService.initializeFaceCollection()

    // Step 1: Fetch images from Google Drive
    console.log('\nStep 1: Fetching images from Google Drive...')
    const images = await driveService.fetchImagesFromFolder(folderUrl)

    if (images.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No images found in the provided folder",
      }, { status: 404 })
    }

    console.log(`Found ${images.length} image(s) to process`)

    // Step 2: Compress images (if needed - images over 40MB will be compressed to ~10MB)
    console.log('\nStep 2: Compressing images...')
    const processedImages = []

    for (const image of images) {
      const compressionResult = await compressionService.compressImage(image.data, image.mimeType)
      processedImages.push({
        name: image.name,
        data: compressionResult.data,
        mimeType: image.mimeType,
        originalSize: compressionResult.originalSize,
        compressedSize: compressionResult.compressedSize,
      })
    }

    // Step 3: Analyze with AWS Rekognition (detect labels, faces, emotions, etc.)
    console.log('\nStep 3: Analyzing images with AWS Rekognition...')
    const analysisResults = []

    for (let i = 0; i < processedImages.length; i++) {
      const image = processedImages[i]
      const imageId = uuidv4()

      console.log(`\nAnalyzing image ${i + 1}/${processedImages.length}: ${image.name}`)
      
      const analysis = await rekognitionService.analyzeImage(image.data, imageId)
      
      analysisResults.push({
        id: imageId,
        name: image.name,
        data: image.data,
        mimeType: image.mimeType,
        size: image.compressedSize,
        labels: analysis.labels,
        faces: analysis.faces,
      })
    }

    // Step 4: Upload images and metadata to AWS S3
    console.log('\nStep 4: Uploading to AWS S3...')
    const uploadedImages = []

    for (const result of analysisResults) {
      console.log(`Uploading: ${result.name}`)
      
      const metadata = await s3Service.uploadImageWithMetadata(
        result.data,
        result.name,
        result.mimeType,
        {
          id: result.id,
          labels: result.labels,
          faces: result.faces,
        }
      )

      uploadedImages.push(metadata)
    }

    console.log(`\nSuccessfully processed ${uploadedImages.length} image(s)`)

    return NextResponse.json({
      success: true,
      processedCount: uploadedImages.length,
      message: `Successfully processed ${uploadedImages.length} images from the folder`,
    })
  } catch (error: any) {
    console.error('Upload failed:', error)
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to process images",
    }, { status: 500 })
  }
}
