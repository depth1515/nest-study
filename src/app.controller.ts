import {
  Controller,
  Get,
  Post,
  Render,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { Public } from './auth/public.guard';

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @Get('index')
  @Render('index')
  root() {
    return { message: 'Hello world!' };
  }

  /**
   * 我们使用 P assport-local 策略提供的内置AuthGuard 来装饰路由，意味着
   * req 参数将包含一个用户属性(在 passport-local 身份验证流期间由 Passport 填充)
   */
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Public()
  @Get('p')
  findAll() {
    return [];
  }
}
