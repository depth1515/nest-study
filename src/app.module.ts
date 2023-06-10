import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getConfig } from 'utils';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { PermModule } from './perm/perm.module';
import { MenuModule } from './menu/menu.module';
import { DeptModule } from './dept/dept.module';
import { DataSource } from 'typeorm';
import { UserEntity } from './user/entities/user.mysql.entity';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AllowNoPerm } from './auth/role.strategy';
import { RolesGuard } from './auth/role.guard';
import { RedisModule } from './redis/redis.module';
import { RedisClientOptions } from '@liaoliaots/nestjs-redis';
import { RoleEntity } from './role/entities/role.entity';
import { MenuEntity } from './menu/entities/menu.mysql.entity';
import { RoleMenuEntity } from './role/entities/role-menu.entity';
import { MenuPermEntity } from './menu/entities/menu-perm.entity';
import { UserRoleEntity } from './user/entities/role/user-role.mysql.entity';
import { join } from 'path';

@Module({
  // ConfigModule.forRoot();
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      load: [getConfig],
    }),
    // TypeOrmModule.forRootAsync(MYSQL_DATABASE_CONFIG),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          // entities: [join(__dirname, `../../**/**/*.*.entity{.ts,.js}`)],
          entities: [
            UserEntity,
            UserRoleEntity,
            RoleEntity,
            RoleMenuEntity,
            MenuEntity,
            MenuPermEntity,
          ],
          logging: true,
          ...config.get('MYSQL_CONFIG'),
        } as TypeOrmModuleOptions;
      },
    }),
    RedisModule.forRootAsync(
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          return {
            closeClient: true,
            config: config.get<RedisClientOptions>('redis'),
          };
        },
      },
      true,
    ),
    UserModule,
    RoleModule,
    PermModule,
    MenuModule,
    DeptModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: AllowNoPerm,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
