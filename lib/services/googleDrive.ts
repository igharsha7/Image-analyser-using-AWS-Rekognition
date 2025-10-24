import { google } from 'googleapis';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
}

interface ImageFile {
  name: string;
  data: Buffer;
  mimeType: string;
  size: number;
}

/**
 * Google Drive Service
 * Fetches images from public Google Drive folders
 */
export class GoogleDriveService {
  private drive;

  constructor(apiKey: string) {
    this.drive = google.drive({
      version: 'v3',
      auth: apiKey,
    });
  }

  /**
   * Extract folder ID from Google Drive URL
   * Supports formats:
   * - https://drive.google.com/drive/folders/FOLDER_ID
   * - https://drive.google.com/drive/folders/FOLDER_ID?usp=sharing
   */
  extractFolderId(url: string): string | null {
    const patterns = [
      /folders\/([a-zA-Z0-9-_]+)/,
      /id=([a-zA-Z0-9-_]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * List all files in a folder (including subfolders recursively)
   */
  private async listFilesRecursive(folderId: string): Promise<DriveFile[]> {
    const allFiles: DriveFile[] = [];
    const foldersToProcess = [folderId];

    while (foldersToProcess.length > 0) {
      const currentFolderId = foldersToProcess.pop()!;

      try {
        const response = await this.drive.files.list({
          q: `'${currentFolderId}' in parents and trashed=false`,
          fields: 'files(id, name, mimeType, size)',
          pageSize: 1000,
        });

        const files = response.data.files || [];

        for (const file of files) {
          if (file.mimeType === 'application/vnd.google-apps.folder') {
            // Add folder to processing queue
            foldersToProcess.push(file.id!);
          } else if (this.isImageFile(file.mimeType || '')) {
            // Add image file to results
            allFiles.push(file as DriveFile);
          }
        }
      } catch (error) {
        console.error(`Error listing files in folder ${currentFolderId}:`, error);
        throw new Error(`Failed to access folder: ${currentFolderId}`);
      }
    }

    return allFiles;
  }

  /**
   * Check if file is an image
   */
  private isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * Download a file from Google Drive
   */
  private async downloadFile(fileId: string): Promise<Buffer> {
    try {
      const response = await this.drive.files.get(
        {
          fileId: fileId,
          alt: 'media',
        },
        {
          responseType: 'arraybuffer',
        }
      );

      return Buffer.from(response.data as ArrayBuffer);
    } catch (error) {
      console.error(`Error downloading file ${fileId}:`, error);
      throw new Error(`Failed to download file: ${fileId}`);
    }
  }

  /**
   * Fetch all images from a Google Drive folder URL
   * @param folderUrl - Public Google Drive folder URL
   * @returns Array of image files with their data
   */
  async fetchImagesFromFolder(folderUrl: string): Promise<ImageFile[]> {
    const folderId = this.extractFolderId(folderUrl);
    
    if (!folderId) {
      throw new Error('Invalid Google Drive folder URL');
    }

    console.log(`Fetching images from folder: ${folderId}`);

    // List all image files
    const imageFiles = await this.listFilesRecursive(folderId);
    console.log(`Found ${imageFiles.length} image(s)`);

    // Download all images
    const downloadedImages: ImageFile[] = [];

    for (const file of imageFiles) {
      try {
        console.log(`Downloading: ${file.name}`);
        const data = await this.downloadFile(file.id);
        
        downloadedImages.push({
          name: file.name,
          data: data,
          mimeType: file.mimeType,
          size: parseInt(file.size || '0'),
        });
      } catch (error) {
        console.error(`Failed to download ${file.name}:`, error);
        // Continue with other files
      }
    }

    return downloadedImages;
  }

  /**
   * Verify if folder is accessible
   */
  async verifyFolderAccess(folderUrl: string): Promise<boolean> {
    const folderId = this.extractFolderId(folderUrl);
    
    if (!folderId) {
      return false;
    }

    try {
      await this.drive.files.get({
        fileId: folderId,
        fields: 'id, name',
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
