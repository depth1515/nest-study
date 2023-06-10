import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public.guard';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    // const req = ctx.switchToHttp().getRequest()
    // const res = ctx.switchToHttp().getResponse()
    // const accessToken = req.get('Authorization')
    // if (!accessToken) throw new ForbiddenException('请先登录')
    // const atUserId = this.userService.verifyToken(accessToken) // 自定义 token 校验
    // if (!atUserId) throw new UnauthorizedException('当前登录已过期，请重新登录')
    return super.canActivate(context);
  }
}
