import { IsString, IsOptional } from 'class-validator';

export class TrackViewDto {
  @IsString()
  @IsOptional()
  referrer?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
}
