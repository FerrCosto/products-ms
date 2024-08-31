import { IsString } from 'class-validator';

export class CategoryProductsDto {
  @IsString()
  name: string;
}
