import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ImgProductsInput {
  @Field(() => String)
  url: string;
  @Field(() => String)
  alt: string;
}
