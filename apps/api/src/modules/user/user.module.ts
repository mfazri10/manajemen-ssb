import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';

@Module({
  providers: [UserResolver, UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
