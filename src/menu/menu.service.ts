import { Injectable } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ResultData } from 'src/common/result';

@Injectable()
export class MenuService {
  async create(dto: CreateMenuDto): Promise<ResultData> {
    // if (dto.parentId !== '0') {
    //   // 查询当前父级菜单是否存在
    //   const parentMenu = await this.menuRepo.findOne({
    //     where: { id: dto.parentId },
    //   });
    //   if (!parentMenu)
    //     return ResultData.fail(
    //       AppHttpCode.MENU_NOT_FOUND,
    //       '当前父级菜单不存在，请调整后重新添加',
    //     );
    // }
    // const menu = await this.menuManager.transaction(
    //   async (transactionalEntityManager) => {
    //     const menuResult = await transactionalEntityManager.save<MenuEntity>(
    //       plainToInstance(MenuEntity, dto),
    //     );
    //     await transactionalEntityManager.save<MenuPermEntity>(
    //       plainToInstance(
    //         MenuPermEntity,
    //         dto.menuPermList.map((perm) => {
    //           return { menuId: menuResult.id, ...perm };
    //         }),
    //       ),
    //     );
    //     return menuResult;
    //   },
    // );
    // if (!menu)
    //   return ResultData.fail(
    //     AppHttpCode.SERVICE_ERROR,
    //     '菜单创建失败，请稍后重试',
    //   );
    return ResultData.ok();
  }

  findAll() {
    return `This action returns all menu`;
  }

  findOne(id: number) {
    return `This action returns a #${id} menu`;
  }

  update(id: number, updateMenuDto: UpdateMenuDto) {
    return `This action updates a #${id} menu`;
  }

  remove(id: number) {
    return `This action removes a #${id} menu`;
  }
}
