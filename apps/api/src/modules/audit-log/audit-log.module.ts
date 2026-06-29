import { Module } from '@nestjs/common';
import { AuditLogResolver } from './audit-log.resolver';
import { AuditLogService } from './audit-log.service';

@Module({
  providers: [AuditLogResolver, AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogModule {}
