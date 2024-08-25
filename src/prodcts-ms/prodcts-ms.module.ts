import { Module } from '@nestjs/common';
import { ProdctsMsService } from './prodcts-ms.service';
import { ProdctsMsResolver } from './prodcts-ms.resolver';
import { CategoryProductsModule } from 'src/category-products/category-products.module';

@Module({
  imports: [CategoryProductsModule],
  providers: [ProdctsMsResolver, ProdctsMsService],
})
export class ProdctsMsModule {}
