import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateOrderDto {
  @IsIn(['card', 'square', 'circle', 'triangle', 'custom'])
  shape: 'card' | 'square' | 'circle' | 'triangle' | 'custom';

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsOptional()
  layout?: {
    title?: { x: number; y: number };
    subtitle?: { x: number; y: number };
    image?: { x: number; y: number };
  };

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  shippingName: string;

  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @IsString()
  @IsNotEmpty()
  shippingCity: string;

  @IsString()
  @IsNotEmpty()
  shippingCountry: string;

  @IsString()
  @IsNotEmpty()
  shippingPhone: string;
}
