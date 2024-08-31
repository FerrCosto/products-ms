import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
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
  @IsString()
  price: string;
  @IsArray()
  img_Products: ImgProducts[];
  @IsObject()
  categoryProducts: CategoryProducts;
}
