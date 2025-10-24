import { GoogleDriveService } from './services/googleDrive';
import { ImageCompressionService } from './services/compression';
import { S3Service } from './services/s3';
import { RekognitionService } from './services/rekognition';

/**
 * Service Configuration
 * Initializes all services with environment variables
 */

// Validate environment variables
function getEnvVar(key: string, required: boolean = true): string {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || '';
}

// Initialize services (singleton pattern)
let googleDriveService: GoogleDriveService | null = null;
let compressionService: ImageCompressionService | null = null;
let s3Service: S3Service | null = null;
let rekognitionService: RekognitionService | null = null;

export function getGoogleDriveService(): GoogleDriveService {
  if (!googleDriveService) {
    const apiKey = getEnvVar('GOOGLE_DRIVE_API_KEY');
    googleDriveService = new GoogleDriveService(apiKey);
  }
  return googleDriveService;
}

export function getCompressionService(): ImageCompressionService {
  if (!compressionService) {
    compressionService = new ImageCompressionService();
  }
  return compressionService;
}

export function getS3Service(): S3Service {
  if (!s3Service) {
    const region = getEnvVar('AWS_REGION', false) || 'us-east-1';
    const bucketName = getEnvVar('AWS_S3_BUCKET_NAME');
    s3Service = new S3Service(region, bucketName);
  }
  return s3Service;
}

export function getRekognitionService(): RekognitionService {
  if (!rekognitionService) {
    const region = getEnvVar('AWS_REKOGNITION_REGION', false) || getEnvVar('AWS_REGION', false) || 'ap-southeast-1';
    const collectionId = getEnvVar('AWS_REKOGNITION_COLLECTION_ID', false) || 'faces-collection';
    rekognitionService = new RekognitionService(region, collectionId);
  }
  return rekognitionService;
}

/**
 * Initialize all AWS services (call this on app startup)
 */
export async function initializeServices(): Promise<void> {
  try {
    console.log('Initializing services...');
    
    // Initialize Rekognition collection
    const rekognition = getRekognitionService();
    await rekognition.initializeFaceCollection();
    
    console.log('SUCCESS: All services initialized');
  } catch (error) {
    console.error('Failed to initialize services:', error);
    throw error;
  }
}
