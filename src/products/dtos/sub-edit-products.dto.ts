import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { StateImage } from 'src/products/enums/state-image.enum';

export class ImgProductsEditDto {
  @IsPositive()
  @IsInt()
  @IsOptional()
  id?: number;

  @IsString()
  @IsOptional()
  url?: string;

  alt?: string;

  @IsEnum(() => StateImage)
  @IsOptional()
  state_image?: StateImage;

  @IsBoolean()
  @IsOptional()
  delete?: boolean = false;
}
