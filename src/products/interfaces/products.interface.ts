import { ImgProducts } from '.';
import { CategoryProductsDto } from '../dtos/category';

export interface ProductsInterface {
  id: number;

  name: string;

  description?: string;

  date_update: string;

  price: string;

  img_products: ImgProducts[];

  categoryproducts: CategoryProductsDto;
}
