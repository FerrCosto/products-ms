import { InputType, Field, Float } from '@nestjs/graphql';
import { ImgProductsInput } from './sub-products-m.input';
import { CategoryProductsInput } from 'src/category-products/dto/inputs/category-products.input';
import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

@InputType()
export class CreateProdctsMInput {
  @Field(() => String)
  @IsString()
  @MinLength(1)
  name: string;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
  @Field(() => String)
  @IsString()
  price: string;
  @IsArray()
  @Field(() => [ImgProductsInput])
  img_Products: ImgProductsInput[];
  @Field(() => CategoryProductsInput)
  @IsObject()
  categoryProducts: CategoryProductsInput;
}
