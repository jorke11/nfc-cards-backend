import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class GetUploadUrlDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
  fileType: string;
}
