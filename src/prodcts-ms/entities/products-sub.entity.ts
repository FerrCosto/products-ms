import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ImgProducts {
  @Field(() => String)
  url: string;
  @Field(() => String)
  alt: string;
}
