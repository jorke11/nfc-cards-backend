import {
  Controller,
  Post,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUploadUrlDto } from './dto/upload-url.dto';

@ApiTags('Storage')
@Controller('storage')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload-url')
  @ApiOperation({
    summary: 'Get presigned upload URL',
    description: 'Generates a presigned URL for direct file upload to cloud storage (S3/CloudFlare R2). Use this URL to upload profile images or other assets.',
  })
  @ApiResponse({
    status: 201,
    description: 'Presigned upload URL generated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file name or file type.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  async getUploadUrl(@Body() dto: GetUploadUrlDto) {
    return this.storageService.getPresignedUploadUrl(dto.fileName, dto.fileType);
  }

  @Delete('image')
  @ApiOperation({
    summary: 'Delete file',
    description: 'Deletes a file from cloud storage using its URL. This permanently removes the file from the storage bucket.',
  })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file URL.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  async deleteImage(@Body('fileUrl') fileUrl: string) {
    await this.storageService.deleteFile(fileUrl);
    return { message: 'File deleted successfully' };
  }
}
