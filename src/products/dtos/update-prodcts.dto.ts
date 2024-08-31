import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ImgProductsEditDto } from './sub-edit-products.dto';
import { CategoryProductsDto } from './category';

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

  @IsObject()
  @IsOptional()
  categoryProducts?: CategoryProductsDto;
}
