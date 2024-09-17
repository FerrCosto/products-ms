import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { UpdateProdctsMInput, CreateProdctsDto } from './dtos';
import { PrismaClient } from '@prisma/client';

import { CategoryProducts, ProductsInterface } from './interfaces';
import { StateImage } from '../products/enums/state-image.enum';
import { Decimal } from '@prisma/client/runtime/library';
import { CurrencyFormatter } from 'src/helpers';
import { CategoryProductsDto, FindByValueInput } from './dtos/category';
import { envs } from 'src/config/envs.config';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
  }
  async onModuleInit() {
    await this.$connect();
    console.log('Conectado a la base de datos', envs.database_url);
  }

  //? Categoria
  async createCategory(
    categoryProductsDto: CategoryProductsDto,
  ): Promise<CategoryProductsDto> {
    const category = await this.categoryproducts.create({
      data: categoryProductsDto,
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

  async deleteCategory(name: string): Promise<CategoryProducts> {
    const category = await this.findCategoryById({ name });
    return await this.categoryproducts.delete({
      where: {
        id: category.id,
      },
    });
  }

  async create(createProdctsDto: CreateProdctsDto): Promise<ProductsInterface> {
    const { categoryProducts, img_Products, ...resData } = createProdctsDto;
    // const category = await this.categoryProductsService.findCategoryById();

    const category = await this.findCategory(categoryProducts.name);

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

    return await this.findOne(producto.id);
  }

  async findAll(): Promise<ProductsInterface[]> {
    const productos = await this.products.findMany({
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

    return productos.map((producto) => ({
      ...producto,
      img_products: producto.img_products.map((img) => ({
        id: img.id,
        alt: img.alt,
        url: img.url,
        state_image: img.state_image as StateImage,
      })),
      date_update: producto.date_update.toISOString(),
      categoryproducts: producto.categoryproducts,
      price: CurrencyFormatter.formatCurrency(producto.price.toNumber()),
    }));
  }

  async findOne(id: number): Promise<ProductsInterface> {
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

    if (!producto)
      throw new RpcException({
        status: 400,
        message: `Product with #${id} not found`,
      });

    return {
      ...producto,
      img_products: producto.img_products.map((img) => ({
        id: img.id,
        alt: img.alt,
        url: img.url,
        state_image: img.state_image as StateImage,
      })),
      date_update: producto.date_update.toISOString(),
      categoryproducts: producto.categoryproducts,
      price: CurrencyFormatter.formatCurrency(producto.price.toNumber()),
    };
  }

  async update(
    id: number,
    updateProdctsMInput: UpdateProdctsMInput,
  ): Promise<ProductsInterface> {
    const {
      categoryProducts,
      id: idProduct,
      img_Products,
      price,
      ...products
    } = updateProdctsMInput;
    const category = categoryProducts
      ? await this.findCategory(categoryProducts.name)
      : undefined;
    await this.findOne(id);

    await this.products.update({
      where: {
        id,
      },
      data: {
        ...products,
        ...(price !== undefined && { price: new Decimal(price) }),
        date_update: new Date(),

        ...(img_Products.some((img) => img.id === null || img.id === undefined)
          ? {
              img_products: {
                create: img_Products.map((img) => ({
                  state_image: img.state_image,
                  alt: img.alt,
                  url: img.url,
                })),
              },
            }
          : {
              img_products: {
                update: img_Products.map((img) => ({
                  where: {
                    id: img.id,
                  },
                  data: {
                    state_image: img.state_image,
                    alt: img.alt,
                    url: img.url,
                  },
                })),
              },
            }),
        ...(img_Products.some(
          (img) => img.delete === true && img.id !== null,
        ) && {
          img_products: {
            deleteMany: {
              id: {
                in: img_Products
                  .filter((img) => img.delete === true && img.id !== null)
                  .map((img) => img.id),
              },
            },
          },
        }),
        ...(categoryProducts !== undefined && {
          categoryproducts: {
            connect: { id: category.id },
          },
        }),
      },
    });
    return await this.findOne(id);
  }

  async findCategory(name: string) {
    const category = await this.findCategoryById({
      name: name,
    });

    return category;
  }
  async remove(id: number): Promise<ProductsInterface> {
    await this.findOne(id);

    await this.products.update({
      where: {
        id,
      },
      data: {
        img_products: {
          deleteMany: {},
        },
      },
    });

    const producto = await this.products.delete({
      where: {
        id,
      },
      include: {
        categoryproducts: true,
        img_products: true,
      },
    });
    return {
      ...producto,
      img_products: producto.img_products.map((img) => ({
        id: img.id,
        alt: img.alt,
        url: img.url,
        state_image: img.state_image as StateImage,
      })),
      date_update: producto.date_update.toISOString(),
      categoryproducts: producto.categoryproducts,
      price: CurrencyFormatter.formatCurrency(producto.price.toNumber()),
    };
  }
  async validateProducts(ids: number[]) {
    ids = Array.from(new Set(ids));

    const products = await this.products.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    if (products.length !== ids.length) {
      throw new RpcException({
        status: 400,
        message: 'Some products were not found',
      });
    }

    return products;
  }
}
