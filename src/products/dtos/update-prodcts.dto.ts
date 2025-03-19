import {
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { ImgProductsEditDto } from './sub-edit-products.dto';
import { CategoryProductsEditDto } from './sub-edit-category.dto';

export class UpdateProdctsMInput {
  @IsInt()
  id: number;

  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @IsInt()
  @Min(5)
  @IsPositive()
  @IsOptional()
  inStock?: number;
  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsString()
  price?: string;

  @IsArray()
  @IsOptional()
  img_Products?: ImgProductsEditDto[];

  @IsArray()
  @IsOptional()
  categoryProducts?: CategoryProductsEditDto[];
}
