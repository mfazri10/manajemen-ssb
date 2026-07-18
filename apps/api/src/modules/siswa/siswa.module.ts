import { Module } from '@nestjs/common';
import { SiswaResolver } from './siswa.resolver';
import { SiswaService } from './siswa.service';
import { SiswaImportController } from './siswa-import.controller';
import { DrizzleModule } from '../../drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [SiswaImportController],
  providers: [SiswaResolver, SiswaService],
  exports: [SiswaService],
})
export class SiswaModule {}
