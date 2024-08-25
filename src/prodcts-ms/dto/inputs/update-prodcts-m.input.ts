import { CreateProdctsMInput } from './create-prodcts-m.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateProdctsMInput extends PartialType(CreateProdctsMInput) {
  @Field(() => ID)
  id: number;
}
