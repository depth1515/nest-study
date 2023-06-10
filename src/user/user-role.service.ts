import { Injectable } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { ResultData } from 'src/common/result';
import { DataSource } from 'typeorm';

@Injectable()
export class UserRoleService {
  constructor(private readonly dataSource: DataSource) {}

  async findUserByRoleId(
    roleId: string,
    page: number,
    size: number,
    isCorrelation: boolean,
  ): Promise<ResultData> {
    let res;
    if (isCorrelation) {
      res = await this.dataSource
        .createQueryBuilder('sys_user', 'su')
        .leftJoinAndSelect('sys_user_role', 'ur', 'ur.user_id = su.id')
        .where('su.status = 1 and ur.role_id = :roleId', { roleId })
        .skip(size * (page - 1))
        .take(size)
        .getManyAndCount();
    } else {
      res = await this.dataSource
        .createQueryBuilder('sys_user', 'su')
        .where((qb: any) => {
          const subQuery = qb
            .subQuery()
            .select(['sur.user_id'])
            .from('sys_user_role', 'sur')
            .where('sur.role_id = :roleId', { roleId })
            .getQuery();
          return `su.status = 1 and su.id not in ${subQuery}`;
        })
        .skip(size * (page - 1))
        .take(size)
        .getManyAndCount();
    }
    return ResultData.ok({ list: instanceToPlain(res[0]), total: res[1] });
  }
}
