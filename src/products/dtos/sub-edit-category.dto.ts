import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CategoryProductsEditDto {
  @IsPositive()
  @IsInt()
  @IsOptional()
  id?: number;
  @IsOptional()
  @IsString()
  name?: string;
  @IsBoolean()
  @IsOptional()
  delete?: boolean = false;
}
