import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.mysql.entity';
import { Like, Repository } from 'typeorm';
import { ResultData } from 'src/common/result';
import { FindUserListDto } from './dto/find-user-list.dto';
import { UserRoleService } from './user-role.service';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class UserService {
  private readonly users: any[];

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly userRoleService: UserRoleService,
  ) {
    this.users = [
      {
        userId: 1,
        username: 'john',
        password: 'changeme',
      },
      {
        userId: 2,
        username: 'chris',
        password: 'secret',
      },
      {
        userId: 3,
        username: 'maria',
        password: 'guess',
      },
    ];
  }

  create(user: CreateUserDto) {
    return this.userRepo.save(user);
  }

  /** 查询用户列表, 需要重新写， 包含查询 角色、部门等 */
  async findList(dto: FindUserListDto): Promise<ResultData> {
    const {
      page,
      size,
      account,
      status,
      roleId,
      hasCurrRole = 0,
      deptId,
      hasCurrDept = 0,
    } = dto;
    if (roleId) {
      const result = await this.userRoleService.findUserByRoleId(
        roleId,
        page,
        size,
        !!Number(hasCurrRole),
      );
      return result;
    }
    const where = {
      ...(status ? { status } : null),
      ...(account ? { account: Like(`%${account}%`) } : null),
    };
    const users = await this.userRepo.findAndCount({
      where,
      order: {
        id: 'DESC',
      },
      skip: size * (page - 1),
      take: size,
    });
    return ResultData.ok({ list: instanceToPlain(users[0]), total: users[1] });
  }

  async findOne(account: string): Promise<any> {
    // return this.users.find((user) => user.username === username);
    return await this.userRepo.findOneBy({ account });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
