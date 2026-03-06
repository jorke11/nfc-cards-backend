import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
  IsObject,
  IsUrl,
  IsArray,
} from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Username can only contain lowercase letters, numbers, and hyphens',
  })
  username?: string;

  @IsOptional()
  photoUrl?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  jobTitle?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  company?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;

  @IsArray()
  @IsOptional()
  phones?: { label: string; number: string }[];

  @IsString()
  @IsOptional()
  emailPublic?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsObject()
  @IsOptional()
  socialLinks?: Record<string, string>;

  @IsObject()
  @IsOptional()
  themeSettings?: Record<string, any>;
}
