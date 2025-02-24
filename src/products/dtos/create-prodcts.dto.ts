import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { CategoryProducts, ImgProducts } from '../interfaces';

export class CreateProdctsDto {
  @IsString()
  @MinLength(1)
  name: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsInt()
  @Min(5)
  @IsPositive()
  inStock: string;
  @IsString()
  price: string;
  @IsArray()
  img_Products: ImgProducts[];
  @IsArray()
  categoryProducts: CategoryProducts[];
}
