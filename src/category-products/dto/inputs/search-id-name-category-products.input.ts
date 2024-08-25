import { Field, ID, InputType, Int } from '@nestjs/graphql';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

@InputType()
export class FindByValueInput {
  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsPositive()
  @IsOptional()
  id?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;
}
