import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomBytes } from 'crypto';

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  // Allowed file types
  private readonly ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  // Max file size: 5MB
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024;

  constructor(private readonly configService: ConfigService) {
    const awsConfig = this.configService.get('aws');

    this.region = awsConfig.region;
    this.bucketName = awsConfig.s3BucketName;

    // Only initialize S3 client if AWS credentials are provided
    if (awsConfig?.accessKeyId && awsConfig.accessKeyId !== 'local-dev-skip') {
      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: awsConfig.accessKeyId,
          secretAccessKey: awsConfig.secretAccessKey,
        },
      });
    }
  }

  async getPresignedUploadUrl(
    fileName: string,
    fileType: string,
  ): Promise<{ uploadUrl: string; fileUrl: string; key: string }> {
    // Validate file type
    if (!this.ALLOWED_FILE_TYPES.includes(fileType)) {
      throw new BadRequestException('Invalid file type');
    }

    // Generate unique key
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${randomBytes(16).toString('hex')}.${fileExtension}`;
    const key = `profile-images/${uniqueFileName}`;

    // Return mock URLs in development mode (no S3 client)
    if (!this.s3Client) {
      const mockUrl = `http://localhost:4000/uploads/${uniqueFileName}`;
      return {
        uploadUrl: mockUrl,
        fileUrl: mockUrl,
        key,
      };
    }

    // Create PutObject command
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: fileType,
      ACL: 'public-read', // Make files publicly readable
    });

    try {
      // Generate presigned URL (valid for 5 minutes)
      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 300,
      });

      // Construct public file URL
      const fileUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

      return {
        uploadUrl,
        fileUrl,
        key,
      };
    } catch (error) {
      throw new BadRequestException('Failed to generate upload URL');
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    // Skip deletion in development mode
    if (!this.s3Client) {
      console.log('[DEV MODE] File deletion skipped:', fileUrl);
      return;
    }

    try {
      // Extract key from URL
      const key = this.extractKeyFromUrl(fileUrl);

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new BadRequestException('Failed to delete file');
    }
  }

  private extractKeyFromUrl(fileUrl: string): string {
    // Extract key from S3 URL
    const url = new URL(fileUrl);
    return url.pathname.slice(1); // Remove leading slash
  }
}
