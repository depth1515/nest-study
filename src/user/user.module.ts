import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.mysql.entity';
import { UserRoleService } from './user-role.service';
import { UserRoleEntity } from './entities/role/user-role.mysql.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserRoleEntity])],
  providers: [UserService, UserRoleService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
