import { Module } from '@nestjs/common';
import { OrangTuaResolver } from './orang-tua.resolver';
import { OrangTuaService } from './orang-tua.service';

@Module({
  providers: [OrangTuaResolver, OrangTuaService],
  exports: [OrangTuaService],
})
export class OrangTuaModule {}
