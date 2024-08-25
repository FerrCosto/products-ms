import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ImgProducts } from '.';
import { CategoryProducts } from 'src/category-products/entities/category-product.entity';

@ObjectType()
export class ProdctsM {
  @Field(() => ID)
  id: number;
  @Field(() => String)
  name: string;
  @Field(() => String)
  @Field(() => String, { nullable: true })
  description?: string;
  @Field(() => String)
  date_update: string;
  @Field(() => [ImgProducts])
  img_product: ImgProducts[];
  @Field(() => [CategoryProducts])
  categoryproducts: CategoryProducts[];
}
