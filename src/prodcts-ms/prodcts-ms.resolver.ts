import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ProdctsMsService } from './prodcts-ms.service';
import { ProdctsM } from './entities/prodcts-m.entity';

import { UpdateProdctsMInput, CreateProdctsMInput } from './dto/inputs';

@Resolver(() => ProdctsM)
export class ProdctsMsResolver {
  constructor(private readonly prodctsMsService: ProdctsMsService) {}

  @Mutation(() => ProdctsM, { name: 'createProducts' })
  async createProdctsM(
    @Args('createProdctsMInput') createProdctsMInput: CreateProdctsMInput,
  ): Promise<ProdctsM> {
    return this.prodctsMsService.create(createProdctsMInput);
  }

  @Query(() => [ProdctsM], { name: 'findAllProducts' })
  async findAll(): Promise<ProdctsM[]> {
    return this.prodctsMsService.findAll();
  }

  @Query(() => ProdctsM, { name: 'findOneProduct' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.prodctsMsService.findOne(id);
  }

  @Mutation(() => ProdctsM, { name: 'updateProduct' })
  updateProdctsM(
    @Args('updateProdctsMInput') updateProdctsMInput: UpdateProdctsMInput,
  ): Promise<ProdctsM> {
    return this.prodctsMsService.update(
      updateProdctsMInput.id,
      updateProdctsMInput,
    );
  }

  @Mutation(() => ProdctsM, { name: 'deleteProduct' })
  async removeProdctsM(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<ProdctsM> {
    return this.prodctsMsService.remove(id);
  }
}
