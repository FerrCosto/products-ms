import { IsEnum, IsString, IsUrl } from 'class-validator';
import { StateImage } from 'src/products/enums/state-image.enum';

export class ImgProductsInput {
  @IsUrl()
  url: string;
  @IsString()
  alt?: string;
  @IsEnum(() => StateImage)
  state_image: StateImage;
}
