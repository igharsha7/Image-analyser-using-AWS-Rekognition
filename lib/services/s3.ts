import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface UploadResult {
  key: string;
  url: string;
  bucket: string;
}

interface ImageMetadata {
  id: string;
  imageUrl: string;
  labels: string[];
  faces: any[];
  metadata: {
    uploadedAt: string;
    originalName: string;
    size: number;
  };
}

/**
 * AWS S3 Service
 * Handles uploading images and metadata to S3
 */
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(region: string, bucketName: string) {
    this.s3Client = new S3Client({ region });
    this.bucketName = bucketName;
  }

  /**
   * Upload an image to S3
   * @param imageBuffer - Image data
   * @param fileName - Name for the file
   * @param contentType - MIME type
   * @returns Upload result with URL
   */
  async uploadImage(
    imageBuffer: Buffer,
    fileName: string,
    contentType: string
  ): Promise<UploadResult> {
    const key = `images/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: imageBuffer,
      ContentType: contentType,
    });

    try {
      await this.s3Client.send(command);
      
      // Generate a signed URL that expires in 7 days
      const url = await this.getSignedUrl(key);

      console.log(`✓ Uploaded image to S3: ${key}`);

      return {
        key,
        url,
        bucket: this.bucketName,
      };
    } catch (error) {
      console.error('S3 upload failed:', error);
      throw new Error(`Failed to upload image to S3: ${error}`);
    }
  }

  /**
   * Upload metadata as JSON file to S3
   * @param imageId - Unique image identifier
   * @param metadata - Metadata object
   */
  async uploadMetadata(imageId: string, metadata: ImageMetadata): Promise<void> {
    const key = `metadata/${imageId}.json`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: JSON.stringify(metadata, null, 2),
      ContentType: 'application/json',
    });

    try {
      await this.s3Client.send(command);
      console.log(`✓ Uploaded metadata to S3: ${key}`);
    } catch (error) {
      console.error('Metadata upload failed:', error);
      throw new Error(`Failed to upload metadata: ${error}`);
    }
  }

  /**
   * Get a signed URL for private S3 objects
   * @param key - S3 object key
   * @param expiresIn - Expiration time in seconds (default: 7 days)
   */
  async getSignedUrl(key: string, expiresIn: number = 604800): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      console.error('Failed to generate signed URL:', error);
      throw new Error(`Failed to generate signed URL: ${error}`);
    }
  }

  /**
   * List all metadata files in S3
   */
  async listAllMetadata(): Promise<ImageMetadata[]> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: 'metadata/',
    });

    try {
      const response = await this.s3Client.send(command);
      const metadataFiles = response.Contents || [];

      const allMetadata: ImageMetadata[] = [];

      // Fetch each metadata file
      for (const file of metadataFiles) {
        if (file.Key && file.Key.endsWith('.json')) {
          try {
            const metadata = await this.getMetadata(file.Key);
            if (metadata) {
              allMetadata.push(metadata);
            }
          } catch (error) {
            console.error(`Failed to fetch metadata for ${file.Key}:`, error);
          }
        }
      }

      return allMetadata;
    } catch (error) {
      console.error('Failed to list metadata:', error);
      return [];
    }
  }

  /**
   * Get metadata from S3
   * @param key - S3 key for metadata file
   */
  private async getMetadata(key: string): Promise<ImageMetadata | null> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      const response = await this.s3Client.send(command);
      const bodyString = await response.Body?.transformToString();
      
      if (bodyString) {
        return JSON.parse(bodyString) as ImageMetadata;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get metadata for ${key}:`, error);
      return null;
    }
  }

  /**
   * Upload image and its metadata together
   * @param imageBuffer - Image data
   * @param fileName - Original file name
   * @param contentType - MIME type
   * @param metadata - Additional metadata (labels, faces, etc.)
   */
  async uploadImageWithMetadata(
    imageBuffer: Buffer,
    fileName: string,
    contentType: string,
    metadata: Partial<ImageMetadata>
  ): Promise<ImageMetadata> {
    // Upload image
    const uploadResult = await this.uploadImage(imageBuffer, fileName, contentType);

    // Create full metadata object
    const fullMetadata: ImageMetadata = {
      id: metadata.id || uploadResult.key.split('/')[1].split('-')[0],
      imageUrl: uploadResult.url,
      labels: metadata.labels || [],
      faces: metadata.faces || [],
      metadata: {
        uploadedAt: new Date().toISOString(),
        originalName: fileName,
        size: imageBuffer.length,
        ...metadata.metadata,
      },
    };

    // Upload metadata
    await this.uploadMetadata(fullMetadata.id, fullMetadata);

    return fullMetadata;
  }

  /**
   * Refresh signed URLs for all images
   * (Call this periodically to keep URLs fresh)
   */
  async refreshAllUrls(): Promise<ImageMetadata[]> {
    const allMetadata = await this.listAllMetadata();

    for (const metadata of allMetadata) {
      // Extract the S3 key from the old URL or reconstruct it
      const imageKey = metadata.imageUrl.includes('amazonaws.com')
        ? decodeURIComponent(metadata.imageUrl.split('.com/')[1].split('?')[0])
        : `images/${metadata.id}`;

      try {
        metadata.imageUrl = await this.getSignedUrl(imageKey);
        await this.uploadMetadata(metadata.id, metadata);
      } catch (error) {
        console.error(`Failed to refresh URL for ${metadata.id}:`, error);
      }
    }

    return allMetadata;
  }
}
