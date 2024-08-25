import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CategoryProductsInput } from './dto/inputs/category-products.input';
import { PrismaClient } from '@prisma/client';
import { CategoryProducts } from './entities/category-product.entity';
import { FindByValueInput } from './dto/inputs/search-id-name-category-products.input';

@Injectable()
export class CategoryProductsService
  extends PrismaClient
  implements OnModuleInit
{
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async createCategory(
    categoryProductsInput: CategoryProductsInput,
  ): Promise<CategoryProductsInput> {
    const category = await this.categoryproducts.create({
      data: categoryProductsInput,
    });
    return category;
  }

  async findCategoriesProducts(): Promise<CategoryProducts[]> {
    const categories = await this.categoryproducts.findMany();
    return categories;
  }

  async findCategoryById(value: FindByValueInput): Promise<CategoryProducts> {
    if (!value || (!value.id && !value.name))
      throw new BadRequestException('Debes ingresar el id o el name');

    const { id, name } = value;

    const category = await this.categoryproducts.findFirst({
      where: {
        OR: [{ id }, { name: { contains: name, mode: 'insensitive' } }],
      },
    });
    if (!category)
      throw new NotFoundException(
        `Category with ${id ? `#${id}` : `name: '${name}'`} not found`,
      );

    return category;
  }
}
