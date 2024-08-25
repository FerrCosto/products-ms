import { InputType, Field, Float } from '@nestjs/graphql';
import { ImgProductsInput } from './sub-products-m.input';
import { CategoryProductsInput } from 'src/category-products/dto/inputs/category-products.input';

@InputType()
export class CreateProdctsMInput {
  @Field(() => String)
  name: string;
  @Field(() => String, { nullable: true })
  description?: string;
  @Field(() => Float)
  price: number;
  @Field(() => [ImgProductsInput])
  img_Products: ImgProductsInput[];
  @Field(() => CategoryProductsInput)
  categoryProducts: CategoryProductsInput;
}
