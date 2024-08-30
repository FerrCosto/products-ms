import { Field, Int, ObjectType } from '@nestjs/graphql';

import { StateImage } from '../enums/state-image.enum';

@ObjectType()
export class ImgProducts {
  @Field(() => Int)
  id: number;
  @Field(() => String)
  url: string;
  @Field(() => String, { nullable: true })
  alt?: string;
  @Field(() => StateImage)
  state_image: StateImage;
}
