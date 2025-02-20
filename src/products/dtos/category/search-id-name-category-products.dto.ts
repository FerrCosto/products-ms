import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class FindByValueInput {
  @IsInt()
  @Min(1)
  @IsPositive()
  @IsOptional()
  id?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;
}
