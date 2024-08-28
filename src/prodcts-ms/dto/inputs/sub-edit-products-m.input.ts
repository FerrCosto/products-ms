import { Field, InputType, Int } from '@nestjs/graphql';
import { StateImage } from 'src/prodcts-ms/enums/state-image.enum';

@InputType()
export class ImgProductsEditInput {
  @Field(() => Int)
  id: number;
  @Field(() => String)
  url: string;
  @Field(() => String, { nullable: true })
  alt?: string;
  @Field(() => StateImage)
  state_image: StateImage;
}
