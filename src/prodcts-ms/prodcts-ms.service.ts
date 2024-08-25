import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { UpdateProdctsMInput, CreateProdctsMInput } from './dto/inputs';
import { PrismaClient } from '@prisma/client';
import { CategoryProductsService } from 'src/category-products/category-products.service';
import { ProdctsM } from './entities';

@Injectable()
export class ProdctsMsService extends PrismaClient implements OnModuleInit {
  constructor(
    private readonly categoryProductsService: CategoryProductsService,
  ) {
    super();
  }
  async onModuleInit() {
    await this.$connect();
  }

  async create(createProdctsMInput: CreateProdctsMInput): Promise<ProdctsM> {
    const { categoryProducts, ...resData } = createProdctsMInput;
    // const category = await this.categoryProductsService.findCategoryById();

    const category = await this.categoryProductsService.findCategoryById({
      name: categoryProducts.name,
    });
    const producto = await this.products.create({
      data: {
        ...resData,
        date_update: new Date(),
        categoryproducts: {
          connect: { id: category.id },
        },
      },
    });

    console.log(category, resData);
    return await this.findOne(producto.id);
  }

  findAll() {
    return `This action returns all prodctsMs`;
  }

  async findOne(id: number) {
    const producto = await this.products.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        date_update: true,
        img_product: true,
        id_categoryproducts: false,
        price: true,
        categoryproducts: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!producto) throw new NotFoundException(`Product with #${id} not found`);

    return {
      ...producto,
      date_update: producto.date_update.toISOString(),
    };
  }

  update(id: number, updateProdctsMInput: UpdateProdctsMInput) {
    return `This action updates a #${id} prodctsM`;
  }

  remove(id: number) {
    return `This action removes a #${id} prodctsM`;
  }
}
