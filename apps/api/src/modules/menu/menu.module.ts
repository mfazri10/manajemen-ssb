import { Module } from '@nestjs/common';
import { MenuResolver } from './menu.resolver';
import { MenuService } from './menu.service';

@Module({
  providers: [MenuResolver, MenuService],
  exports: [MenuService],
})
export class MenuModule {}
