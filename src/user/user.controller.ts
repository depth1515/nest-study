import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from '../auth/public.guard';
import { ResultData } from 'src/common/result';
import { UserEntity } from './entities/user.mysql.entity';
import { FindUserListDto } from './dto/find-user-list.dto';

@Controller('user')
@ApiBearerAuth()
@ApiExtraModels(ResultData, UserEntity)
@Public()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/list')
  async findList(@Query() dto?: FindUserListDto): Promise<ResultData> {
    return await this.userService.findList(dto);
  }

  @Post('/create')
  @ApiOperation({ summary: '添加用户' })
  async createUser(@Body() dto: CreateUserDto): Promise<any> {
    return await this.userService.create(dto);
  }

  @Get(':account')
  async findOneByUsername(@Param('account') account: string) {
    return await this.userService.findOne(account);
  }
}
