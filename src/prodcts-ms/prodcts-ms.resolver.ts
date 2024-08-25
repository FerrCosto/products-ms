import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ProdctsMsService } from './prodcts-ms.service';
import { ProdctsM } from './entities/prodcts-m.entity';

import { UpdateProdctsMInput, CreateProdctsMInput } from './dto/inputs';

@Resolver(() => ProdctsM)
export class ProdctsMsResolver {
  constructor(private readonly prodctsMsService: ProdctsMsService) {}

  @Mutation(() => ProdctsM)
  async createProdctsM(
    @Args('createProdctsMInput') createProdctsMInput: CreateProdctsMInput,
  ): Promise<ProdctsM> {
    return this.prodctsMsService.create(createProdctsMInput);
  }

  @Query(() => [ProdctsM], { name: 'prodctsMs' })
  findAll() {
    return this.prodctsMsService.findAll();
  }

  @Query(() => ProdctsM, { name: 'prodctsM' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.prodctsMsService.findOne(id);
  }

  @Mutation(() => ProdctsM)
  updateProdctsM(
    @Args('updateProdctsMInput') updateProdctsMInput: UpdateProdctsMInput,
  ) {
    return this.prodctsMsService.update(
      updateProdctsMInput.id,
      updateProdctsMInput,
    );
  }

  @Mutation(() => ProdctsM)
  removeProdctsM(@Args('id', { type: () => Int }) id: number) {
    return this.prodctsMsService.remove(id);
  }
}
