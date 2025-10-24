import sharp from 'sharp';

interface CompressionResult {
  data: Buffer;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  wasCompressed: boolean;
}

/**
 * Image Compression Service
 * Compresses images larger than 40MB to approximately 10MB
 */
export class ImageCompressionService {
  private readonly SIZE_THRESHOLD = 40 * 1024 * 1024; // 40MB
  private readonly TARGET_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Compress image if it exceeds the size threshold
   * @param imageBuffer - Original image buffer
   * @param mimeType - Image MIME type
   * @returns Compressed image data and metadata
   */
  async compressImage(imageBuffer: Buffer, mimeType: string): Promise<CompressionResult> {
    const originalSize = imageBuffer.length;

    // Skip compression if image is under threshold
    if (originalSize <= this.SIZE_THRESHOLD) {
      console.log(`Image size (${this.formatBytes(originalSize)}) is under threshold. Skipping compression.`);
      return {
        data: imageBuffer,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1,
        wasCompressed: false,
      };
    }

    console.log(`Compressing image from ${this.formatBytes(originalSize)}...`);

    try {
      let compressedBuffer: Buffer;
      let quality = 80; // Start with 80% quality

      // Get image metadata
      const metadata = await sharp(imageBuffer).metadata();
      
      // Determine output format based on input
      const isJPEG = mimeType.includes('jpeg') || mimeType.includes('jpg');
      const isPNG = mimeType.includes('png');
      const isWebP = mimeType.includes('webp');

      // Initial compression attempt
      if (isWebP) {
        compressedBuffer = await sharp(imageBuffer)
          .webp({ quality })
          .toBuffer();
      } else if (isPNG) {
        // Convert PNG to JPEG for better compression
        compressedBuffer = await sharp(imageBuffer)
          .jpeg({ quality, mozjpeg: true })
          .toBuffer();
      } else {
        // JPEG or other formats
        compressedBuffer = await sharp(imageBuffer)
          .jpeg({ quality, mozjpeg: true })
          .toBuffer();
      }

      // Iteratively reduce quality if still too large
      while (compressedBuffer.length > this.TARGET_SIZE && quality > 30) {
        quality -= 10;
        console.log(`Still too large (${this.formatBytes(compressedBuffer.length)}). Trying quality: ${quality}%`);

        if (isWebP) {
          compressedBuffer = await sharp(imageBuffer)
            .webp({ quality })
            .toBuffer();
        } else {
          compressedBuffer = await sharp(imageBuffer)
            .jpeg({ quality, mozjpeg: true })
            .toBuffer();
        }
      }

      // If still too large, resize the image
      if (compressedBuffer.length > this.TARGET_SIZE) {
        console.log(`Resizing image to reduce size further...`);
        const scaleFactor = Math.sqrt(this.TARGET_SIZE / compressedBuffer.length);
        const newWidth = Math.floor((metadata.width || 1920) * scaleFactor);
        const newHeight = Math.floor((metadata.height || 1080) * scaleFactor);

        if (isWebP) {
          compressedBuffer = await sharp(imageBuffer)
            .resize(newWidth, newHeight, { fit: 'inside' })
            .webp({ quality: 75 })
            .toBuffer();
        } else {
          compressedBuffer = await sharp(imageBuffer)
            .resize(newWidth, newHeight, { fit: 'inside' })
            .jpeg({ quality: 75, mozjpeg: true })
            .toBuffer();
        }
      }

      const compressedSize = compressedBuffer.length;
      const compressionRatio = originalSize / compressedSize;

      console.log(`✓ Compressed to ${this.formatBytes(compressedSize)} (${compressionRatio.toFixed(2)}x reduction)`);

      return {
        data: compressedBuffer,
        originalSize,
        compressedSize,
        compressionRatio,
        wasCompressed: true,
      };
    } catch (error) {
      console.error('Compression failed:', error);
      // Return original if compression fails
      return {
        data: imageBuffer,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1,
        wasCompressed: false,
      };
    }
  }

  /**
   * Batch compress multiple images
   */
  async compressMultiple(
    images: Array<{ data: Buffer; mimeType: string; name: string }>
  ): Promise<Array<CompressionResult & { name: string }>> {
    const results = [];

    for (const image of images) {
      console.log(`\nProcessing: ${image.name}`);
      const result = await this.compressImage(image.data, image.mimeType);
      results.push({
        ...result,
        name: image.name,
      });
    }

    return results;
  }

  /**
   * Format bytes to human-readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Convert image to JPEG format (useful for Rekognition)
   */
  async convertToJPEG(imageBuffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .jpeg({ quality: 90, mozjpeg: true })
        .toBuffer();
    } catch (error) {
      console.error('JPEG conversion failed:', error);
      return imageBuffer;
    }
  }
}
