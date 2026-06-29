import { Module } from '@nestjs/common';
import { Fase34Resolver } from './fase-3-4.resolver';
import { Fase34Service } from './fase-3-4.service';

@Module({
  providers: [Fase34Resolver, Fase34Service],
  exports: [Fase34Service],
})
export class Fase34Module {}
