import { Injectable, BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly imagesDir = path.join(process.cwd(), 'public', 'images');

  // Allowed file types
  private readonly ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  // Max file size: 5MB
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024;

  async getPresignedUploadUrl(
    fileName: string,
    fileType: string,
  ): Promise<{ uploadUrl: string; fileUrl: string; key: string }> {
    if (!this.ALLOWED_FILE_TYPES.includes(fileType)) {
      throw new BadRequestException('Invalid file type');
    }

    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${randomBytes(16).toString('hex')}.${fileExtension}`;
    const key = `profile-images/${uniqueFileName}`;

    const baseUrl = process.env.APP_URL || 'http://localhost:4000';
    const uploadUrl = `${baseUrl}/public/images/${uniqueFileName}`;
    const fileUrl = `${baseUrl}/public/images/${uniqueFileName}`;

    return { uploadUrl, fileUrl, key };
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const url = new URL(fileUrl);
      const filename = path.basename(url.pathname);
      const filePath = path.join(this.imagesDir, filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new BadRequestException('Failed to delete file');
    }
  }
}
