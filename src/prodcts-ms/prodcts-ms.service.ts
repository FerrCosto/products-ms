import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { UpdateProdctsMInput, CreateProdctsMInput } from './dto/inputs';
import { PrismaClient } from '@prisma/client';
import { CategoryProductsService } from 'src/category-products/category-products.service';
import { ProdctsM } from './entities';
import { StateImage } from './enums/state-image.enum';
import { Decimal } from '@prisma/client/runtime/library';
import { CurrencyFormatter } from 'src/helpers';

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
    try {
      const { categoryProducts, img_Products, ...resData } =
        createProdctsMInput;
      // const category = await this.categoryProductsService.findCategoryById();
      console.log(resData);

      const category = await this.categoryProductsService.findCategoryById({
        name: categoryProducts.name,
      });

      console.log(category);
      const producto = await this.products.create({
        data: {
          ...resData,
          date_update: new Date(),
          price: new Decimal(resData.price),
          img_products: {
            create: img_Products.map((img) => ({
              alt: img.alt,
              url: img.url,
              state_image: img.state_image,
            })),
          },
          categoryproducts: {
            connect: { id: category.id },
          },
        },
      });
      console.log(category, resData);

      return await this.findOne(producto.id);
    } catch (error) {
      console.log(error);
    }
  }

  findAll() {
    return `This action returns all prodctsMs`;
  }

  async findOne(id: number): Promise<ProdctsM> {
    const producto = await this.products.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        date_update: true,
        id_categoryproducts: false,
        price: true,
        img_products: {
          select: {
            id: true,
            alt: true,
            state_image: true,
            url: true,
          },
        },
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
      img_products: producto.img_products.map((img) => ({
        alt: img.alt,
        url: img.url,
        state_image: img.state_image as StateImage,
      })),
      date_update: producto.date_update.toISOString(),
      categoryproducts: producto.categoryproducts,
      price: CurrencyFormatter.formatCurrency(producto.price.toNumber()),
    };
  }

  update(id: number, updateProdctsMInput: UpdateProdctsMInput) {
    return `This action updates a #${id} prodctsM`;
  }

  remove(id: number) {
    return `This action removes a #${id} prodctsM`;
  }
}
