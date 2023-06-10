import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.guard';
import { ALLOW_NO_PERM } from './role.strategy';
import { UserType } from 'src/common/enums/common.enum';
import { PermService } from 'src/perm/perm.service';
import { pathToRegexp } from 'path-to-regexp';

@Injectable()
export class RolesGuard implements CanActivate {
  private globalWhiteList = [];
  constructor(
    private readonly reflector: Reflector,
    private readonly permService: PermService,
    private readonly config: ConfigService,
  ) {
    console.log(this.config);

    this.globalWhiteList = [].concat(config.get('perm.router.whiteList') || []);
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    // 1. 首先 无 token 的 不需要 对比权限
    const IS_PUBLIC = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (IS_PUBLIC) return true;

    // 全局配置，
    const req = ctx.switchToHttp().getRequest();

    const checkRouteHasRole = (route) => {
      // 请求方法类型相同
      if (req.method.toUpperCase() === route.method.toUpperCase()) {
        // 对比 url
        const reqUrl = req.url.split('?')[0];
        return !!pathToRegexp(route.path).exec(reqUrl);
      }
      return false;
    };

    const i = this.globalWhiteList.findIndex(checkRouteHasRole);

    // 2. 判断是否在白名单内，在白名单内 则 进行下一步， i === -1 ，则不在白名单，需要 比对是否有当前接口权限
    if (i > -1) return true;

    // 3. 函数请求头配置 AllowNoPerm 装饰器 无需验证权限
    const allowNoPerm = this.reflector.getAllAndOverride<boolean>(
      ALLOW_NO_PERM,
      [ctx.getHandler(), ctx.getClass()],
    );
    if (allowNoPerm) return true;
    // 4. 需要比对 该用户所拥有的 接口权限
    const user = req.user;
    // 没有挈带 token 直接返回 false
    if (!user) return false;
    // 5. 超级管理员拥有所有权限
    if (user.type === UserType.SUPER_ADMIN) return true;
    // 6. 判断是否有该接口的权限
    const userPermApi = await this.permService.findUserPerms(user.id);

    const index = userPermApi.findIndex(checkRouteHasRole);

    if (index === -1) throw new ForbiddenException('您无权限访问该接口');

    return true;
  }
}
