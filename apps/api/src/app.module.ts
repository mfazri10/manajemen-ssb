import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import appConfig from './config/app.config';
import { DrizzleModule } from './drizzle/drizzle.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { MenuModule } from './modules/menu/menu.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { MasterDataModule } from './modules/master-data/master-data.module';
import { APP_FILTER } from '@nestjs/core';
import { GraphQLExceptionFilter } from './common/filters/graphql-exception.filter';
import { AppResolver } from './app.resolver';

@Module({
  imports: [
    // Configurations
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),

    // Database
    DrizzleModule,

    // GraphQL Code-First
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true, // Playground active
      context: ({ req, res }: { req: unknown; res: unknown }) => ({ req, res }), // Inject request to context for guards
    }),

    // Modules
    AuthModule,
    UserModule,
    RoleModule,
    MenuModule,
    TenantModule,
    MasterDataModule,
  ],
  providers: [
    AppResolver,
    {
      provide: APP_FILTER,
      useClass: GraphQLExceptionFilter,
    },
  ],
})
export class AppModule {}
