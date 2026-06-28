import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserRolesInput } from './dto/update-user-roles.input';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Resolver(() => User)
@UseGuards(AuthGuard, PermissionsGuard)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User], { name: 'users' })
  @RequirePermissions('user.manage')
  async getUsers() {
    return this.userService.findAll();
  }

  @Query(() => User, { name: 'user' })
  @RequirePermissions('user.manage')
  async getUser(@Args('id', { type: () => String }) id: string) {
    return this.userService.findById(id);
  }

  @Mutation(() => User, { name: 'createUser' })
  @RequirePermissions('user.manage')
  async createUser(@Args('input', { type: () => CreateUserInput }) input: CreateUserInput) {
    return this.userService.create(input);
  }

  @Mutation(() => User, { name: 'updateUserRoles' })
  @RequirePermissions('user.manage')
  async updateUserRoles(@Args('input', { type: () => UpdateUserRolesInput }) input: UpdateUserRolesInput) {
    return this.userService.updateRoles(input.userId, input.roleIds);
  }

  @Mutation(() => Boolean, { name: 'deleteUser' })
  @RequirePermissions('user.manage')
  async deleteUser(@Args('id', { type: () => String }) id: string) {
    return this.userService.delete(id);
  }
}
