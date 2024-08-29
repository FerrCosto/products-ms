import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { StateImage } from 'src/prodcts-ms/enums/state-image.enum';

@InputType()
export class ImgProductsEditInput {
  @Field(() => Int, { nullable: true })
  @IsPositive()
  @IsInt()
  @IsOptional()
  id?: number;
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  url: string;
  @Field(() => String, { nullable: true })
  alt?: string;
  @Field(() => StateImage, { nullable: true })
  @IsEnum(() => StateImage)
  @IsOptional()
  state_image: StateImage;
  @Field(() => Boolean, { defaultValue: false, nullable: true })
  @IsBoolean()
  @IsOptional()
  delete?: boolean = false;
}
