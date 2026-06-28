import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MenuService } from './menu.service';
import { Menu } from './entities/menu.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Resolver(() => Menu)
@UseGuards(AuthGuard, PermissionsGuard)
export class MenuResolver {
  constructor(private readonly menuService: MenuService) {}

  @Query(() => [Menu], { name: 'activeMenuTree' })
  async getActiveMenuTree() {
    return this.menuService.findActiveMenuTree();
  }

  @Query(() => [Menu], { name: 'menus' })
  @RequirePermissions('user.manage')
  async getMenus() {
    return this.menuService.findAllMenus();
  }

  @Mutation(() => Menu, { name: 'createMenu' })
  @RequirePermissions('user.manage')
  async createMenu(
    @Args('name') name: string,
    @Args('slug') slug: string,
    @Args('route', { nullable: true }) route?: string,
    @Args('icon', { nullable: true }) icon?: string,
    @Args('parentId', { type: () => Int, nullable: true }) parentId?: number,
    @Args('orderNo', { type: () => Int, defaultValue: 0 }) orderNo: number = 0,
    @Args('isActive', { type: () => Boolean, defaultValue: true }) isActive: boolean = true,
  ) {
    const data: {
      name: string;
      slug: string;
      route?: string;
      icon?: string;
      parentId?: number;
      orderNo: number;
      isActive: boolean;
    } = { name, slug, orderNo, isActive };
    
    if (route !== undefined) data.route = route;
    if (icon !== undefined) data.icon = icon;
    if (parentId !== undefined) data.parentId = parentId;

    return this.menuService.createMenu(data);
  }

  @Mutation(() => Menu, { name: 'updateMenu' })
  @RequirePermissions('user.manage')
  async updateMenu(
    @Args('id', { type: () => Int }) id: number,
    @Args('name', { nullable: true }) name?: string,
    @Args('slug', { nullable: true }) slug?: string,
    @Args('route', { nullable: true }) route?: string,
    @Args('icon', { nullable: true }) icon?: string,
    @Args('parentId', { type: () => Int, nullable: true }) parentId?: number,
    @Args('orderNo', { type: () => Int, nullable: true }) orderNo?: number,
    @Args('isActive', { type: () => Boolean, nullable: true }) isActive?: boolean,
  ) {
    const data: {
      name?: string;
      slug?: string;
      route?: string;
      icon?: string;
      parentId?: number;
      orderNo?: number;
      isActive?: boolean;
    } = {};

    if (name !== undefined) data.name = name;
    if (slug !== undefined) data.slug = slug;
    if (route !== undefined) data.route = route;
    if (icon !== undefined) data.icon = icon;
    if (parentId !== undefined) data.parentId = parentId;
    if (orderNo !== undefined) data.orderNo = orderNo;
    if (isActive !== undefined) data.isActive = isActive;

    return this.menuService.updateMenu(id, data);
  }

  @Mutation(() => Menu, { name: 'deleteMenu' })
  @RequirePermissions('user.manage')
  async deleteMenu(@Args('id', { type: () => Int }) id: number) {
    return this.menuService.deleteMenu(id);
  }
}
