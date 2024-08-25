import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ProdctsMsModule } from './prodcts-ms/prodcts-ms.module';
import { join } from 'path';
import { CategoryProductsModule } from './category-products/category-products.module';
@Module({
  imports: [
    ProdctsMsModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: false,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    CategoryProductsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
