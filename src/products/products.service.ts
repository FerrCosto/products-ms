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
import { CategoryProductsEdit } from './interfaces/category-product.entity';

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
    const category = await this.category.create({
      data: categoryProductsDto,
    });
    return category;
  }

  async findCategoriesProducts(): Promise<CategoryProducts[]> {
    const categories = await this.category.findMany();
    return categories;
  }

  async findCategoryByIdOrName(
    value: FindByValueInput,
  ): Promise<CategoryProducts> {
    if (!value || (!value.id && !value.name))
      throw new BadRequestException('Debes ingresar el id o el name');

    const { id, name } = value;

    const category = await this.category.findFirst({
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

  async findCategoriesByName(names: string[]): Promise<CategoryProducts[]> {
    const categories = await Promise.all(
      names.map((name) => this.category.findFirst({ where: { name } })),
    );
    return categories;
  }

  async deleteCategory(name: string): Promise<CategoryProducts> {
    const category = await this.findCategoryByIdOrName({ name });
    return await this.category.delete({
      where: {
        id: category.id,
      },
    });
  }

  async create(createProdctsDto: CreateProdctsDto): Promise<ProductsInterface> {
    const { categoryProducts, name, img_Products, ...resData } =
      createProdctsDto;
    // const category = await this.categoryProductsService.findCategoryByIdOrName();

    const category: CategoryProducts[] = await this.findCategoriesByName(
      categoryProducts.map((cate) => cate.name),
    );

    const slug = name
      .trim()
      .toLocaleLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
    const producto = await this.product.create({
      data: {
        ...resData,
        name,
        slug,
        date_update: new Date(),
        price: new Decimal(resData.price),
        img_products: {
          create: img_Products.map((img) => ({
            alt: img.alt,
            url: img.url,
            state_image: img.state_image,
          })),
        },
        categories: {
          create: category.map((cate) => ({
            categoryId: cate.id,
          })),
        },
      },
    });

    return await this.findOne(producto.id);
  }

  async findAll(): Promise<ProductsInterface[]> {
    const productos = await this.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        date_update: true,
        id_categoryproducts: false,
        price: true,
        slug: true,
        img_products: {
          select: {
            id: true,
            alt: true,
            state_image: true,
            url: true,
          },
        },
        categories: {
          include: {
            categories: true,
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
      categoryproducts: producto.categories.map((cate) => cate.categories),
      price: CurrencyFormatter.formatCurrency(producto.price.toNumber()),
    }));
  }

  async findOne(id: number): Promise<ProductsInterface> {
    const producto = await this.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        date_update: true,
        id_categoryproducts: false,
        price: true,
        slug: true,
        img_products: {
          select: {
            id: true,
            alt: true,
            state_image: true,
            url: true,
          },
        },
        categories: {
          include: {
            categories: true,
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
      categoryproducts: producto.categories.map((cate) => cate.categories),
      price: CurrencyFormatter.formatCurrency(producto.price.toNumber()),
    };
  }

  async findOneBySlug(slug: string): Promise<ProductsInterface> {
    const producto = await this.product.findFirst({
      where: { slug },
      select: {
        id: true,
        name: true,
        description: true,
        date_update: true,
        id_categoryproducts: false,
        price: true,
        slug: true,
        img_products: {
          select: {
            id: true,
            alt: true,
            state_image: true,
            url: true,
          },
        },
        categories: {
          include: {
            categories: true,
          },
        },
      },
    });

    if (!producto)
      throw new RpcException({
        status: 400,
        message: `Product with "${slug}" not found`,
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
      categoryproducts: producto.categories.map((cate) => cate.categories),
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
    console.log({ categoryProducts });

    const foundCategories = await this.findCategoriesByName(
      categoryProducts.map((cate) => cate.name),
    );

    const category: CategoryProductsEdit[] =
      categoryProducts && foundCategories.every((c) => c !== null)
        ? foundCategories
        : categoryProducts.map((category) => category as CategoryProductsEdit);

    console.log({ category });
    const categoryDelete: CategoryProductsEdit[] = category.filter(
      (category) => Boolean(category.id) && category.delete !== true,
    );
    await this.findOne(id);

    console.log({ categoryDelete });

    await this.product.update({
      where: {
        id,
      },
      data: {
        ...products,
        ...(price !== undefined && { price: new Decimal(price) }),
        date_update: new Date(),
        ...(img_Products !== undefined &&
          (img_Products.some((img) => img.id === null || img.id === undefined)
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
              })),
        ...(img_Products !== undefined &&
          img_Products.some(
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
        ...(categoryProducts !== undefined &&
          category.some(
            (category) =>
              (category.id !== null || category.id !== undefined) &&
              category.delete === false,
          ) && {
            categories: {
              create: await Promise.all(
                category.map(async (cate) => {
                  try {
                    let foundCategory = await this.category.findFirst({
                      where: { name: cate.name },
                    });

                    if (!foundCategory) {
                      const newCategory = await this.createCategory({
                        name: cate.name,
                      } as CategoryProductsDto);

                      foundCategory = await this.category.findFirst({
                        where: { name: newCategory.name },
                      });
                    }

                    if (!foundCategory) {
                      throw new RpcException({
                        status: 400,
                        message: `No se pudo encontrar o crear la categoría: ${cate.name}`,
                      });
                    }

                    return { categoryId: foundCategory.id };
                  } catch (error) {
                    console.error(
                      `Error al procesar la categoría ${cate.name}:`,
                      error,
                    );
                    throw new RpcException({
                      status: 500,
                      message: `Error en la categoría ${cate.name}`,
                    });
                  }
                }),
              ),
            },
          }),
        ...(categoryProducts !== undefined &&
          categoryDelete.length > 0 && {
            categories: {
              deleteMany: {
                categoryId: {
                  in: categoryDelete.map((category) => category.id),
                },
              },
            },
          }),
      },
    });
    return await this.findOne(id);
  }

  async findCategory(name: string) {
    const category = await this.findCategoryByIdOrName({
      name: name,
    });

    return category;
  }
  async remove(id: number): Promise<ProductsInterface> {
    await this.findOne(id);

    await this.product.update({
      where: {
        id,
      },
      data: {
        img_products: {
          deleteMany: {},
        },
      },
    });

    const producto = await this.product.delete({
      where: {
        id,
      },
      include: {
        categories: {
          include: {
            categories: true,
          },
        },
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
      categoryproducts: producto.categories.map((cate) => ({
        name: cate.categories.name,
      })),
      price: CurrencyFormatter.formatCurrency(producto.price.toNumber()),
    };
  }
  async validateProducts(ids: number[]) {
    ids = Array.from(new Set(ids));

    const products = await this.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: {
        categories: {
          include: {
            categories: true,
          },
        },
        img_products: true,
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
