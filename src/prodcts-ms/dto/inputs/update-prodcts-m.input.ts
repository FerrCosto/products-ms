import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { InputType, Field, Int } from '@nestjs/graphql';
import { ImgProductsEditInput } from './sub-edit-products-m.input';
import { CategoryProductsInput } from 'src/category-products/dto/inputs/category-products.input';

@InputType()
export class UpdateProdctsMInput {
  @Field(() => Int)
  @IsInt()
  id: number;
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MinLength(1)
  name?: string;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  price?: string;
  @Field(() => [ImgProductsEditInput], { nullable: true })
  @IsArray()
  @IsOptional()
  img_Products?: ImgProductsEditInput[];
  @Field(() => CategoryProductsInput, { nullable: true })
  @IsObject()
  @IsOptional()
  categoryProducts?: CategoryProductsInput;
}
