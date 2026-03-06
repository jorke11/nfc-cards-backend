import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @IsNotEmpty()
  password: string;

  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  lastName: string;
}
