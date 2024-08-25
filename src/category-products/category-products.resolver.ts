import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CategoryProductsService } from './category-products.service';
import { CategoryProducts } from './entities/category-product.entity';
import { CategoryProductsInput } from './dto/inputs/category-products.input';
import { FindByValueInput } from './dto/inputs/search-id-name-category-products.input';

@Resolver()
export class CategoryProductsResolver {
  constructor(
    private readonly categoryProductsService: CategoryProductsService,
  ) {}
  @Mutation(() => CategoryProducts)
  async createCategory(
    @Args('createCategoryProducts')
    categoryProduuctsInput: CategoryProductsInput,
  ): Promise<CategoryProductsInput> {
    return this.categoryProductsService.createCategory(categoryProduuctsInput);
  }

  @Query(() => CategoryProducts, { name: 'findOneCategory' })
  async findCategoryById(
    @Args('value') value: FindByValueInput,
  ): Promise<CategoryProducts> {
    return this.categoryProductsService.findCategoryById(value);
  }

  @Query(() => [CategoryProducts], { name: 'findAllCategories' })
  async findCategoriesProducts(): Promise<CategoryProducts[]> {
    return this.categoryProductsService.findCategoriesProducts();
  }
}
