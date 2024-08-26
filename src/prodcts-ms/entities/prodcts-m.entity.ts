import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { ImgProducts } from '.';
import { CategoryProducts } from 'src/category-products/entities/category-product.entity';

@ObjectType()
export class ProdctsM {
  @Field(() => ID)
  id: number;
  @Field(() => String)
  name: string;
  @Field(() => String, { nullable: true })
  description?: string;
  @Field(() => String)
  date_update: string;
  @Field(() => String)
  price: string;
  @Field(() => [ImgProducts])
  img_products: ImgProducts[];
  @Field(() => CategoryProducts)
  categoryproducts: CategoryProducts;
}
