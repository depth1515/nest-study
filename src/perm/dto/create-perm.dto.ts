import { ApiProperty } from '@nestjs/swagger';
import { RouterMethods } from 'src/common/enums/routerMethod.enum';
import { $enum } from 'ts-enum-util';

export class CreatePermDto {
  /** 路由 path */
  @ApiProperty({ description: 'api 路径' })
  path: string;
  /** 路由方法 */
  @ApiProperty({
    description: 'api 方法',
    enum: $enum(RouterMethods).getValues(),
  })
  method: RouterMethods;
  /** 路由描述 */
  @ApiProperty({ description: 'api 描述说明', required: false })
  desc?: string;
}
