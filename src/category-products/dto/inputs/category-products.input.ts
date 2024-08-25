import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CategoryProductsInput {
  @Field(() => String)
  name: string;
}
