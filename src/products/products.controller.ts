import { Controller } from '@nestjs/common';
import { ProductsService } from './products.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateProdctsDto, UpdateProdctsMInput } from './dto';
import { CategoryProductsDto, FindByValueInput } from './dto/category';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern('product.category.create')
  createCategory(@Payload() categoryProductsDto: CategoryProductsDto) {
    return this.productsService.createCategory(categoryProductsDto);
  }

  @MessagePattern('product.category.findOne')
  findCategoryById(@Payload() value: FindByValueInput) {
    return this.productsService.findCategoryById(value);
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
}
