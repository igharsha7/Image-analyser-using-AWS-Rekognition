import {
  RekognitionClient,
  DetectLabelsCommand,
  DetectFacesCommand,
  IndexFacesCommand,
  CreateCollectionCommand,
  ListCollectionsCommand,
} from '@aws-sdk/client-rekognition';

interface Label {
  name: string;
  confidence: number;
}

interface FaceDetail {
  boundingBox: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  ageRange: {
    low: number;
    high: number;
  };
  emotions: Array<{
    type: string;
    confidence: number;
  }>;
  gender: string;
  confidence?: number;
}

interface RekognitionResult {
  labels: string[];
  faces: FaceDetail[];
  faceIds?: string[]; // Face IDs from IndexFaces
}

/**
 * AWS Rekognition Service
 * Analyzes images for labels, faces, and facial attributes
 */
export class RekognitionService {
  private rekognitionClient: RekognitionClient;
  private collectionId: string;

  constructor(region: string, collectionId: string = 'faces-collection') {
    this.rekognitionClient = new RekognitionClient({ region });
    this.collectionId = collectionId;
  }

  /**
   * Initialize the face collection (create if doesn't exist)
   */
  async initializeFaceCollection(): Promise<void> {
    try {
      // Check if collection exists
      const listCommand = new ListCollectionsCommand({});
      const listResponse = await this.rekognitionClient.send(listCommand);
      
      const collectionExists = listResponse.CollectionIds?.includes(this.collectionId);

      if (!collectionExists) {
        console.log(`Creating face collection: ${this.collectionId}`);
        const createCommand = new CreateCollectionCommand({
          CollectionId: this.collectionId,
        });
        await this.rekognitionClient.send(createCommand);
        console.log(`✓ Face collection created: ${this.collectionId}`);
      } else {
        console.log(`Face collection already exists: ${this.collectionId}`);
      }
    } catch (error) {
      console.error('Failed to initialize face collection:', error);
      // Don't throw - we can still use DetectLabels and DetectFaces
    }
  }

  /**
   * Detect labels in an image
   * @param imageBuffer - Image data
   * @returns Array of detected labels
   */
  async detectLabels(imageBuffer: Buffer): Promise<string[]> {
    const command = new DetectLabelsCommand({
      Image: {
        Bytes: imageBuffer,
      },
      MaxLabels: 10,
      MinConfidence: 70,
    });

    try {
      const response = await this.rekognitionClient.send(command);
      const labels = response.Labels?.map((label) => label.Name || '') || [];
      
      console.log(`✓ Detected ${labels.length} labels:`, labels.join(', '));
      return labels;
    } catch (error) {
      console.error('DetectLabels failed:', error);
      return [];
    }
  }

  /**
   * Detect faces and their attributes in an image
   * @param imageBuffer - Image data
   * @returns Array of face details
   */
  async detectFaces(imageBuffer: Buffer): Promise<FaceDetail[]> {
    const command = new DetectFacesCommand({
      Image: {
        Bytes: imageBuffer,
      },
      Attributes: ['ALL'], // Get all face attributes
    });

    try {
      const response = await this.rekognitionClient.send(command);
      const faceDetails = response.FaceDetails || [];

      const faces: FaceDetail[] = faceDetails.map((face) => ({
        boundingBox: {
          top: face.BoundingBox?.Top || 0,
          left: face.BoundingBox?.Left || 0,
          width: face.BoundingBox?.Width || 0,
          height: face.BoundingBox?.Height || 0,
        },
        ageRange: {
          low: face.AgeRange?.Low || 0,
          high: face.AgeRange?.High || 100,
        },
        emotions: (face.Emotions || [])
          .sort((a, b) => (b.Confidence || 0) - (a.Confidence || 0))
          .map((emotion) => ({
            type: emotion.Type || 'UNKNOWN',
            confidence: Math.round(emotion.Confidence || 0),
          })),
        gender: face.Gender?.Value || 'Unknown',
        confidence: face.Confidence,
      }));

      console.log(`✓ Detected ${faces.length} face(s)`);
      return faces;
    } catch (error) {
      console.error('DetectFaces failed:', error);
      return [];
    }
  }

  /**
   * Index faces for facial recognition
   * @param imageBuffer - Image data
   * @param externalImageId - External ID for the image
   * @returns Array of indexed face IDs
   */
  async indexFaces(imageBuffer: Buffer, externalImageId: string): Promise<string[]> {
    const command = new IndexFacesCommand({
      CollectionId: this.collectionId,
      Image: {
        Bytes: imageBuffer,
      },
      ExternalImageId: externalImageId,
      DetectionAttributes: ['ALL'],
      MaxFaces: 10,
      QualityFilter: 'AUTO',
    });

    try {
      const response = await this.rekognitionClient.send(command);
      const faceRecords = response.FaceRecords || [];
      const faceIds = faceRecords.map((record) => record.Face?.FaceId || '').filter(Boolean);

      console.log(`✓ Indexed ${faceIds.length} face(s) to collection`);
      return faceIds;
    } catch (error) {
      console.error('IndexFaces failed:', error);
      // This might fail if collection doesn't exist - that's okay
      return [];
    }
  }

  /**
   * Analyze an image completely (labels + faces + indexing)
   * @param imageBuffer - Image data
   * @param imageId - Unique image identifier
   * @returns Complete analysis results
   */
  async analyzeImage(imageBuffer: Buffer, imageId: string): Promise<RekognitionResult> {
    console.log(`\nAnalyzing image: ${imageId}`);

    // Run all analyses in parallel for speed
    const [labels, faces, faceIds] = await Promise.all([
      this.detectLabels(imageBuffer),
      this.detectFaces(imageBuffer),
      this.indexFaces(imageBuffer, imageId).catch(() => []), // Don't fail if indexing fails
    ]);

    return {
      labels,
      faces,
      faceIds,
    };
  }

  /**
   * Batch analyze multiple images
   * @param images - Array of image buffers with IDs
   * @returns Array of analysis results
   */
  async analyzeMultiple(
    images: Array<{ buffer: Buffer; id: string }>
  ): Promise<Array<RekognitionResult & { id: string }>> {
    const results = [];

    for (const image of images) {
      const analysis = await this.analyzeImage(image.buffer, image.id);
      results.push({
        ...analysis,
        id: image.id,
      });
    }

    return results;
  }
}
