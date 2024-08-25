import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CategoryProducts {
  @Field(() => ID)
  id: number;
  @Field(() => String)
  name: string;
}
