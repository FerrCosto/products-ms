import { Field, InputType } from '@nestjs/graphql';
import { StateImage } from 'src/prodcts-ms/enums/state-image.enum';

@InputType()
export class ImgProductsInput {
  @Field(() => String)
  url: string;
  @Field(() => String, { nullable: true })
  alt?: string;
  @Field(() => StateImage)
  state_image: StateImage;
}
