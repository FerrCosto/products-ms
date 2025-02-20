import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ImgProductsEditDto } from './sub-edit-products.dto';
import { CategoryProductsEditDto } from './sub-edit-category.dto';

export class UpdateProdctsMInput {
  @IsInt()
  id: number;

  @IsString()
  @IsOptional()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsOptional()
  price?: string;

  @IsArray()
  @IsOptional()
  img_Products?: ImgProductsEditDto[];

  @IsArray()
  @IsOptional()
  categoryProducts?: CategoryProductsEditDto[];
}
