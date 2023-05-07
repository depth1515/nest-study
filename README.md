# Nest

## 基础

### 控制反转 IoC

> ioc.js

## 配置

### Fastify

通过 `CLI` 默认生成的项目框架中，底层平台使用的是 `Express`

安装对应的适配器依赖 `@nestjs/platform-fastify`其次，使用 `FastifyAdapter` 替换默认的 `Express` 。

### 版本控制

#### 单个请求控制

```typescript
import { VersioningType } from '@nestjs/common';
// 接口版本化管理
app.enableVersioning({
  type: VersioningType.URI,
});
```

```typescript
import { Controller, Version } from '@nestjs/common';

@Get()
@Version('1')
findAll() {
return this.userService.findAll();
}
```

http://localhost:3020/v1/user

#### 全局配置请求控制

对全局 进行版本控制

```diff
app.enableVersioning({
+   defaultVersion: '1',
    type: VersioningType.URI,
});
```

```diff
- @Get()
- @Version('1')
+ @Controller({
+  path: 'user',
+  version: '1',
+ })
```

此时访问所有接口都需要添加 v1 前缀

我们想针对一些接口做兼容性的更新，而其他的请求是不需要携带版本，又或者请求有多个版本的时候，而默认请求想指定一个版本的话，我们可以在 enableVersioning 添加 defaultVersion 参数达到上述的要求：

```diff
+ import { VersioningType, VERSION_NEUTRAL } from '@nestjs/common';
  app.enableVersioning({
-    defaultVersion: '1',
+    defaultVersion: [VERSION_NEUTRAL, '1', '2']
  });
```

```typescript
  @Get()
  @Version([VERSION_NEUTRAL])
  findAll() {
    return this.userService.findAll();
  }

  @Get()
  @Version(['1'])
  findAll1() {
    return this.userService.findAll();
  }

  @Get()
  @Version('2')
  findAll2() {
    return this.userService.findAll();
  }
```

此时接口情况如下：

> [Nest] 6856 - 2023/05/07 10:20:41 LOG [RouterExplorer] Mapped {/user, GET} (version: Neutral) route +0ms
> [Nest] 6856 - 2023/05/07 10:20:41 LOG [RouterExplorer] Mapped {/user, GET} (version: 1) route +2ms
> [Nest] 6856 - 2023/05/07 10:20:41 LOG [RouterExplorer] Mapped {/user, GET} (version: 2) route +1ms

### 全局返回参数

输出标准的返回数据格式

```json
{
    data, // 数据
    status: 0, // 接口状态值
    extra: {}, // 拓展信息
    message: 'success', // 异常信息
    success：true // 接口业务返回状态
}
```

1. 新建 src/common/interceptors/transform.interceptor.ts 文件

   ```typescript
   import {
     Injectable,
     NestInterceptor,
     ExecutionContext,
     CallHandler,
   } from '@nestjs/common';
   import { Observable } from 'rxjs';
   import { map } from 'rxjs/operators';

   interface Response<T> {
     data: T;
   }

   @Injectable()
   export class TransformInterceptor<T>
     implements NestInterceptor<T, Response<T>>
   {
     intercept(
       context: ExecutionContext,
       next: CallHandler,
     ): Observable<Response<T>> {
       return next.handle().pipe(
         map((data) => ({
           data,
           status: 0,
           extra: {},
           message: 'success',
           success: true,
         })),
       );
     }
   }
   ```

2. 修改 main.ts 文件，添加 useGlobalInterceptors 全局拦截器，处理返回值

   ```diff
   + import { TransformInterceptor } from './common/interceptors/transform.interceptor';
   // 统一响应体格式
   + app.useGlobalInterceptors(new TransformInterceptor());
   ```

### 全局异常拦截

1.  新建 src/common/exceptions/base.exception.filter.ts 与 http.exception.filter.ts 两个文件，从命名中可以看出它们分别处理统一异常与 HTTP 类型的接口相关异常。

    base.exception.filter => Catch 的参数为空时，默认捕获所有异常

    ```typescript
    import { FastifyReply, FastifyRequest } from 'fastify';
    import {
      ExceptionFilter,
      Catch,
      ArgumentsHost,
      HttpStatus,
      ServiceUnavailableException,
      HttpException,
    } from '@nestjs/common';

    @Catch()
    export class AllExceptionsFilter implements ExceptionFilter {
      catch(exception: Error, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();
        const request = ctx.getRequest<FastifyRequest>();

        request.log.error(exception);

        // 非 HTTP 标准异常的处理。
        response.status(HttpStatus.SERVICE_UNAVAILABLE).send({
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          timestamp: new Date().toISOString(),
          path: request.url,
          message: new ServiceUnavailableException().getResponse(),
        });
      }
    }
    ```

    http.exception.filter.ts => Catch 的参数为 HttpException 将只捕获 HTTP 相关的异常错误

    ```typescript
    import { FastifyReply, FastifyRequest } from 'fastify';
    import {
      ExceptionFilter,
      Catch,
      ArgumentsHost,
      HttpException,
    } from '@nestjs/common';

    @Catch(HttpException)
    export class HttpExceptionFilter implements ExceptionFilter {
      catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();
        const request = ctx.getRequest<FastifyRequest>();
        const status = exception.getStatus();

        response.status(status).send({
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          message: exception.getResponse(),
        });
      }
    }
    ```

2.  在 main.ts 文件中添加 useGlobalFilters 全局过滤器：

    ```diff
    + import { AllExceptionsFilter } from './common/exceptions/base.exception.filter';
    + import { HttpExceptionFilter } from './common/exceptions/http.exception.filter';
    // 异常过滤器
    + app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
    ```

除了全局异常拦截处理之外，我们需要再新建一个 business.exception.ts 来处理业务运行中预知且主动抛出的异常：

```typescript
import { HttpException, HttpStatus } from '@nestjs/common';
import { BUSINESS_ERROR_CODE } from './business.error.codes';

type BusinessError = {
  code: number;
  message: string;
};

export class BusinessException extends HttpException {
  constructor(err: BusinessError | string) {
    if (typeof err === 'string') {
      err = {
        code: BUSINESS_ERROR_CODE.COMMON,
        message: err,
      };
    }
    super(err, HttpStatus.OK);
  }

  static throwForbidden() {
    throw new BusinessException({
      code: BUSINESS_ERROR_CODE.ACCESS_FORBIDDEN,
      message: '抱歉哦，您无此权限！',
    });
  }
}
```

```typescript
export const BUSINESS_ERROR_CODE = {
  // 公共错误码
  COMMON: 10001,
  // 特殊错误码
  TOKEN_INVALID: 10002,
  // 禁止访问
  ACCESS_FORBIDDEN: 10003,
  // 权限已禁用
  PERMISSION_DISABLED: 10003,
  // 用户已冻结
  USER_DISABLED: 10004,
};
```

简单改造一下 HttpExceptionFilter，在处理 HTTP 异常返回之前先处理业务异常：

```diff
+ // 处理业务异常
+    if (exception instanceof BusinessException) {
+      const error = exception.getResponse();
+      response.status(HttpStatus.OK).send({
+        data: null,
+        status: error['code'],
+        extra: {},
+        message: error['message'],
+        success: false,
+      });
+      return;
+    }
```

测试

```typescript
@Get('findBusinessError')
@Version([VERSION_NEUTRAL, '1'])
findBusinessError() {
    const a: any = [];
    try {
        console.log(a.b.c);
    } catch (error) {
        throw new BusinessException('参数错误');
    }
    return this.userService.findAll();
}
```

### 环境配置

一般在项目开发中，至少会经历过 Dev -> Test -> Prod 三个环境。每个环境可能都会有多套配置,
在实际项目开发中，多环境的配置非常必要。

#### 自带环境配置

`NestJs`本身自带多环境配置方法

1. 安装 `@nestjs/config`

   ```ruby
   npm i @nestjs/config
   ```

2. 安装完毕之后，在 `app.module.ts` 中添加 `ConfigModule` 模块

   ```typescript
   import { Module } from '@nestjs/common';
   import { AppController } from './app.controller';
   import { AppService } from './app.service';
   import { UserModule } from './user/user.module';
   import { ConfigModule } from '@nestjs/config';

   @Module({
   imports: [ConfigModule.forRoot(), UserModule],
   controllers: [AppController],
   providers: [AppService],
   })
   export class AppModule {
   ```

`@nestjs/config` 默认会从项目根目录载入并解析一个 `.env` 文件，从 `.env` 文件和 `process.env` 合并环境变量键值对，并将结果存储到一个可以通过 `ConfigService` 访问的私有结构。

`forRoot()` 方法注册了 `ConfigService` 提供者，后者提供了一个 `get()` 方法来读取这些解析/合并的配置变量。

默认的 .env 文件变量定义如下所示，配置后会默认读取此文件:

```ini
DATABASE_USER=test
DATABASE_PASSWORD=test
```

#### 自定义 YAML

1.  在使用自定义 `YAML` 配置文件之前，先要修改 `app.module.ts` 中 `ConfigModule` 的配置项 `ignoreEnvFile`，禁用默认读取 `.env` 的规则：

    ```typescript
    ConfigModule.forRoot({ ignoreEnvFile: true });
    ```

2.  然后再安装 `YAML` 的 `Node` 库 `yaml：`

    `npm i yaml`

3.  安装完毕之后，在根目录新建 `.config` 文件夹，并创建对应环境的 `yaml` 文件，如下图所示：

    ```tree
    - .config
        - .dev.yaml
        - .prod.yaml
        - .test.yaml
    ```

4.  新建 utils/index.ts 文件，添加读取 YAML 配置文件的方法：

    ```typescript
    import { parse } from 'yaml';

    import path from 'path';
    import fs from 'fs';
    // 获取项目运行环境
    export const getEnv = () => {
      return process.env.RUNNING_ENV;
    };

    // 读取项目配置
    export const getConfig = () => {
      const environment = getEnv();
      const yamlPath = path.join(
        process.cwd(),
        `./.config/.${environment}.yaml`,
      );
      const file = fs.readFileSync(yamlPath, 'utf8');
      const config = parse(file);
      return config;
    };
    ```

5.  最后添加在 app.module.ts 自定义配置项即可正常使用环境变量：

    ```diff
    + import { getConfig } from './utils';
        ConfigModule.forRoot({
          ignoreEnvFile: true,
    +     isGlobal: true,
    +     load: [getConfig]
        }),
    ```

    > 注意：load 方法中传入的 getConfig 是一个函数，并不是直接 JSON 格式的配置对象，直接添加变量会报错。

##### 使用自定义配置

完成之前的配置后，就可以使用 cross-env 指定运行环境来使用对应环境的配置变量。

1. 添加 cross-env 依赖：

   `npm i cross-env`

2. 修改启动命令：

   `"start:dev": "cross-env RUNNING_ENV=dev nest start --watch"`

### 热更新

### 文档

1. 安装以下依赖：

   ```
   // 新版本已经不需要安装 `fastify-swagger` 依赖，默认被内置在 `@nestjs/swagger` 中了。
   npm i @nestjs/swagger
   ```

2. 依赖安装完毕之后，先创建 `src/doc.ts`文件：

   ```typescript
   import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

   import * as packageConfig from '../package.json';

   export const generateDocument = (app) => {
     const options = new DocumentBuilder()
       .setTitle(packageConfig.name)
       .setDescription(packageConfig.description)
       .setVersion(packageConfig.version)
       .build();
     const document = SwaggerModule.createDocument(app, options);
     SwaggerModule.setup('/api/doc', app, document);
   };
   ```

3. 在 `main.ts` 中引入方法

   ```diff
   +  // 创建文档
   +  generateDocument(app)
   ```

添加了上述通用性基础配置后的工程模板能基本满足一个小型的业务需求，如果还有其他要求的话可以增减功能或者修改某些配置来适配，总体还是看团队自身的业务需求来定制，比如团队中有统一权限控制的插件或者构建服务的脚本都可以放在工程模板中，方便其他同学开箱即用。
