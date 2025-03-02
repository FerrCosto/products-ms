import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

class Category {
  @IsString()
  name: string;
}

class Price {
  @IsString()
  @IsOptional()
  min?: string;
  @IsString()
  @IsOptional()
  max?: number;
}
export class CategoryPriceProductsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Category)
  categories: Category[];
  @ValidateNested()
  @Type(() => Price)
  @IsOptional()
  price?: Price;
}
