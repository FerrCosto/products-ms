import { Module } from '@nestjs/common';
import { CategoryProductsService } from './category-products.service';
import { CategoryProductsResolver } from './category-products.resolver';

@Module({
  providers: [CategoryProductsResolver, CategoryProductsService],
  exports: [CategoryProductsService],
})
export class CategoryProductsModule {}
