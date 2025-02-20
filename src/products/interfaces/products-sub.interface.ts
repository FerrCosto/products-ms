import { StateImage } from '../enums/state-image.enum';

export interface ImgProducts {
  id: number;

  url: string;

  alt?: string;

  state_image: StateImage;
}
