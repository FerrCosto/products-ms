import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import {
  UpdateProdctsMInput,
  CreateProdctsMInput,
  ImgProductsEditInput,
  ImgProductsInput,
} from './dto/inputs';
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
    const { categoryProducts, img_Products, ...resData } = createProdctsMInput;
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

  async findAll(): Promise<ProdctsM[]> {
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
  ): Promise<ProdctsM> {
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
                  data: img,
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
    const category = await this.categoryProductsService.findCategoryById({
      name: name,
    });

    return category;
  }
  async remove(id: number): Promise<ProdctsM> {
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
}
