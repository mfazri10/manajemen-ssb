import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly dbService: DrizzleService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return true;
  }
}
