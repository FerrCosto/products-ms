import { registerEnumType } from '@nestjs/graphql';

export enum StateImage {
  HOVER = 'HOVER',
  NORMAL = 'NORMAL',
}

registerEnumType(StateImage, {
  name: 'StateImage',
});
