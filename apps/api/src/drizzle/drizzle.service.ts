import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { db, conn } from '@workspace/db';

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  readonly db: typeof db = db;

  async onModuleDestroy() {
    await conn.end();
  }
}
