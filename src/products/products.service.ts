import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { UpdateProdctsMInput, CreateProdctsDto } from './dtos';
import { PrismaClient, product } from '@prisma/client';

import { CategoryProducts, ProductsInterface } from './interfaces';
import { StateImage } from '../products/enums/state-image.enum';
import { Decimal } from '@prisma/client/runtime/library';
import { CurrencyFormatter } from 'src/helpers';
import {
  CategoryPriceProductsDto,
  CategoryProductsDto,
  FindByValueInput,
} from './dtos/category';
import { envs } from 'src/config/envs.config';
import { RpcException } from '@nestjs/microservices';
import { CategoryProductsEdit } from './interfaces/category-product.entity';
import { UpdateProductStockDto } from './dtos/update-stock.product.dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
  }
  async onModuleInit() {
    await this.$connect();
    console.log('Conectado a la base de datos', envs.database_url);
  }

  // TODO: Creacion de la categoria
  async createCategory(
    categoryProductsDto: CategoryProductsDto,
  ): Promise<CategoryProductsDto> {
    try {
      const categoryOne = await this.category.findFirst({
        where: { name: categoryProductsDto.name },
      });

      if (categoryOne) {
        throw new RpcException({
          status: 400,
          message: `Already exist "${categoryProductsDto.name}" category`,
        });
      }
      const category = await this.category.create({
        data: categoryProductsDto,
      });

      return category;
    } catch (error) {
      console.log(error);
      throw new RpcException(error);
    }
  }

  // TODO: Encontrar categoria de los productos

  async findCategoriesProducts(): Promise<CategoryProducts[]> {
    const categories = await this.category.findMany();
    return categories;
  }

  // TODO: EncontrarCategoria por nombre o nombre

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

  // TODO: Encontrar categoria por nombre

  async findCategoriesByName(names: string[]): Promise<CategoryProducts[]> {
    const categories = await Promise.all(
      names.map((name) => this.category.findFirst({ where: { name } })),
    );
    return categories;
  }

  // TODO: Eliminar categoria
  //! Solo si no esta relacionada a productos si no no se puede eliminar
  async deleteCategory(name: string): Promise<CategoryProducts> {
    const category = await this.findCategoryByIdOrName({ name });
    return await this.category.delete({
      where: {
        id: category.id,
      },
    });
  }

  // TODO: Crear Producto
  async create(createProdctsDto: CreateProdctsDto): Promise<ProductsInterface> {
    try {
      const { categoryProducts, name, img_Products, inStock, ...resData } =
        createProdctsDto;
      // const category = await this.categoryProductsService.findCategoryByIdOrName();
      const slug = name
        .trim()
        .toLocaleLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", '');

      const productOne = await this.product.findFirst({ where: { slug } });
      if (productOne) {
        throw new RpcException({
          status: 400,
          message: `The product ${slug} already exits`,
        });
      }

      const category: CategoryProducts[] = await this.findCategoriesByName(
        categoryProducts.map((cate) => cate.name),
      );

      const producto = await this.product.create({
        data: {
          ...resData,
          name,
          slug,
          inStock: parseInt(inStock),
          create_at: new Date(),
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
    } catch (error) {
      throw new RpcException({
        status: 500,
        message: 'Check server logs',
      });
    }
  }

  // TODO: Encontrar Productos
  async findAll(): Promise<ProductsInterface[]> {
    const productos = await this.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        inStock: true,
        date_update: true,
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
      orderBy: {
        id: 'asc',
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

  // TODO: Encontrar producto por id
  async findOne(id: number): Promise<ProductsInterface> {
    const producto = await this.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        inStock: true,
        date_update: true,
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

  async findManyByCategories(
    categoryProductsDto: CategoryPriceProductsDto,
  ): Promise<ProductsInterface[]> {
    console.log({
      categoryProductsDto,
      category: categoryProductsDto.categories,
    });
    const category = await this.category.findMany({
      where: {
        name: {
          in: categoryProductsDto.categories.map((category) => category.name),
        },
      },
    });

    const minPrice = categoryProductsDto.price?.min
      ? new Decimal(categoryProductsDto.price.min)
      : undefined;
    const maxPrice = categoryProductsDto.price?.max
      ? new Decimal(categoryProductsDto.price.max)
      : undefined;

    console.log(category);

    const categoriesIds = category.map((category) => category.id);
    const products = await this.product.findMany({
      where: {
        price: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        },
        AND: categoriesIds.map((id) => ({
          categories: {
            some: {
              categoryId: id,
            },
          },
        })),
      },
      select: {
        id: true,
        name: true,
        description: true,
        inStock: true,
        date_update: true,
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
      orderBy: {
        id: 'asc',
      },
    });
    return products.map((producto) => ({
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

  // TODO: Encontarr producto por slug
  async findOneBySlug(slug: string): Promise<ProductsInterface> {
    const producto = await this.product.findFirst({
      where: { slug },
      select: {
        id: true,
        name: true,
        description: true,
        inStock: true,
        date_update: true,
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

  // TODO: Editar Producto
  async update(
    id: number,
    updateProdctsMInput: UpdateProdctsMInput,
  ): Promise<ProductsInterface> {
    try {
      const {
        categoryProducts,
        id: idProduct,
        img_Products,
        price,
        name,
        ...products
      } = updateProdctsMInput;
      console.log({ updateProdctsMInput });
      let slug = '';
      if (name) {
        slug = name
          .trim()
          .toLocaleLowerCase()
          .replaceAll(' ', '_')
          .replaceAll("'", '');

        const productOne = await this.product.findFirst({ where: { slug } });
        if (productOne) {
          throw new RpcException({
            status: 400,
            message: `The product ${slug} already exits`,
          });
        }
      }

      if (categoryProducts) {
        const foundCategories = await this.findCategoriesByName(
          categoryProducts.map((cate) => cate.name),
        );

        const category: CategoryProductsEdit[] =
          categoryProducts && foundCategories.every((c) => c !== null)
            ? foundCategories.flatMap((cate) => {
                return categoryProducts.map(
                  (categ) =>
                    cate.name === categ.name && {
                      name: cate.name,
                      id: cate.id,
                      delete: categ.delete,
                    },
                );
              })
            : categoryProducts.map(
                (category) => category as CategoryProductsEdit,
              );

        console.log({ category });
        const categoryDelete: CategoryProductsEdit[] = category.filter(
          (category) => Boolean(category.id) && category.delete,
        );

        const categoryCreate: CategoryProductsEdit[] = category.filter(
          (category) => category.delete === false,
        );
        console.log({ categoryDelete });

        console.log(
          category.some(
            (category) =>
              (category.id !== null || category.id !== undefined) &&
              category.delete === false,
          ),
        );

        if (categoryDelete.length > 0) {
          console.log(
            'Eliminando categorías:',
            categoryDelete.map((c) => c.name),
          );
          await Promise.all(
            categoryDelete.map(async (category) => {
              await this.product_category.deleteMany({
                where: {
                  productId: id,
                  categoryId: category.id,
                },
              });
            }),
          );

          console.log(
            'Categorías después de eliminar:',
            await this.product.findUnique({
              where: { id },
              select: { categories: true },
            }),
          );
        }

        if (categoryCreate.length > 0) {
          console.log(
            categoryCreate.length,
            categoryCreate.map((cate) => cate.name),
          );
          const newCategories = await Promise.all(
            categoryCreate.map(async (cate) => {
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

              console.log({
                categoryId: foundCategory.id,
              });
              return {
                categoryId: foundCategory.id,
              };
            }),
          );

          await this.product.update({
            where: { id },
            data: {
              categories: {
                create: newCategories,
              },
            },
          });
        }
      }

      await this.product.update({
        where: {
          id,
        },
        data: {
          ...products,
          ...(name !== undefined && { name }),
          ...(name !== undefined && { slug }),
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
        },
      });
      return await this.findOne(id);
    } catch (error) {
      console.log(error);
      throw new RpcException({ status: 500, message: 'Internal Server error' });
    }
  }

  // TODO:Encontart Categoria
  async findCategory(name: string) {
    const category = await this.findCategoryByIdOrName({
      name: name,
    });

    return category;
  }
  // TODO: Eliminar Producto
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

  // TODO: Validar productos existen
  async validateProducts(updateProductStock: UpdateProductStockDto[]) {
    const ids: number[] = updateProductStock.map((prod) => prod.id);

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
    products.map((prod) => {
      const product = updateProductStock.find((pro) => pro.id === prod.id);

      if (!product) {
        throw new RpcException({
          status: 400,
          message: `No coinciden los productos ${prod.id}`,
        });
      }

      if (
        product.quantity > prod.inStock ||
        (prod.inStock === 0 && !product.isFind)
      ) {
        throw new RpcException({
          status: 400,
          message: `No hay suficientes productos en el stock para el producto ${prod.slug}`,
        });
      }
    });
    return products;
  }

  // TODO: Tratamiento del stock cuando compran
  //? Se trenda en cuenta que la cantidad del pedido no supere a la del stock

  async updateStockProduct(updateProductStock: UpdateProductStockDto[]) {
    try {
      const ids: number[] = updateProductStock.map((prod) => prod.id);

      console.log(ids);
      const products = await this.validateProducts(updateProductStock);

      const updateStock = products.map((prod) => {
        const product = updateProductStock.find((pro) => pro.id === prod.id);

        if (!product) {
          throw new RpcException({
            status: 400,
            message: `No coinciden los productos ${prod.id}`,
          });
        }

        if (prod.inStock === 0 || product.quantity > prod.inStock) {
          throw new RpcException({
            status: 400,
            message: `No hay suficientes productos en el stock para el producto ${prod.slug}`,
          });
        }
        return {
          id: prod.id,
          inStock: prod.inStock - product.quantity,
        };
      });

      console.log(
        updateStock.map((prod) => ({
          id: prod.id,
          inStock: prod.inStock,
        })),
      );
      await Promise.all(
        updateStock.map((prod) =>
          this.product.update({
            where: { id: prod.id },
            data: {
              inStock: prod.inStock,
            },
          }),
        ),
      );
    } catch (error) {
      console.log(error);
      throw new RpcException({
        status: 500,
        message: 'Mirar los logs',
      });
    }
  }

  // TODO: Busqueda de cantidades de productos
  async countProduct() {
    try {
      const [totalProducts, neverInStock, productsLessThenFive] =
        await Promise.all([
          this.product.count(),
          this.product.count({ where: { inStock: { equals: 0 } } }),
          this.product.count({ where: { inStock: { lte: 5 } } }),
        ]);

      return {
        totalProducts,
        neverInStock,
        productsLessThenFive,
      };
    } catch (error) {
      console.log(error);
      throw new RpcException({
        status: 500,
        message: 'Mirar los logs',
      });
    }
  }
}
