import { Controller } from '@nestjs/common';
import { ProductsService } from './products.service';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { CreateProdctsDto, UpdateProdctsMInput } from './dtos';
import {
  CategoryPriceProductsDto,
  CategoryProductsDto,
  FindByValueInput,
} from './dtos/category';
import { UpdateProductStockDto } from './dtos/update-stock.product.dto';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern('product.category.create')
  createCategory(@Payload() categoryProductsDto: CategoryProductsDto) {
    return this.productsService.createCategory(categoryProductsDto);
  }

  @MessagePattern('product.category.findOne')
  findCategoryById(@Payload() value: FindByValueInput) {
    return this.productsService.findCategoryByIdOrName(value);
  }

  @MessagePattern('product.category.finAll')
  findCategoriesProducts() {
    return this.productsService.findCategoriesProducts();
  }

  @MessagePattern('product.category.delete')
  deleteCategory(@Payload() name: string) {
    return this.productsService.deleteCategory(name);
  }
  @MessagePattern('product.create')
  createProduct(@Payload() createProdctsDto: CreateProdctsDto) {
    return this.productsService.create(createProdctsDto);
  }

  @MessagePattern('product.findAll')
  findAllProducts() {
    return this.productsService.findAll();
  }

  @MessagePattern('product.findOne')
  findOneProduct(id: number) {
    return this.productsService.findOne(id);
  }

  @MessagePattern('product.findOneBySlug')
  findOneBySlugProduct(slug: string) {
    return this.productsService.findOneBySlug(slug);
  }

  @MessagePattern('product.findManyByCategories')
  findManyByCategories(categoryProductsDto: CategoryPriceProductsDto) {
    return this.productsService.findManyByCategories(categoryProductsDto);
  }

  @MessagePattern('product.update')
  updateProduct(@Payload() updateProdctsMInput: UpdateProdctsMInput) {
    return this.productsService.update(
      updateProdctsMInput.id,
      updateProdctsMInput,
    );
  }

  @MessagePattern('product.delete')
  deleteProduct(id: number) {
    return this.productsService.remove(id);
  }

  @MessagePattern('products.validate')
  validateProducts(updateProductStockDto: UpdateProductStockDto[]) {
    return this.productsService.validateProducts(updateProductStockDto);
  }

  @MessagePattern('products.count')
  countProducts() {
    return this.productsService.countProduct();
  }

  @EventPattern('product.updateStock')
  updateStock(updateProductStockDto: UpdateProductStockDto[]) {
    return this.productsService.updateStockProduct(updateProductStockDto);
  }
}
