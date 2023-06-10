import { Provider } from '@nestjs/common';
import { join } from 'path';
import { UserEntity } from 'src/user/entities/user.mysql.entity';
import { DataSource, DataSourceOptions } from 'typeorm';
import { getConfig } from 'utils';

// 设置数据库类型
const databaseType: DataSourceOptions['type'] = 'mysql';
const { MYSQL_CONFIG, MONGODB_CONFIG } = getConfig();

export const MONGODB_DATABASE_CONFIG: DataSourceOptions = {
  ...MONGODB_CONFIG,
  type: databaseType,
  entities: [
    join(__dirname, `../../**/**/*.${MONGODB_CONFIG.entities}.entity{.ts,.js}`),
  ],
};

export const MYSQL_DATABASE_CONFIG: DataSourceOptions = {
  ...MYSQL_CONFIG,
  type: databaseType,
  // entities: [
  //   UserEntity,
  // join(__dirname, `../../**/**/*.${MYSQL_CONFIG.entities}.entity{.ts,.js}`),
  // ],
  logging: true,
};

const MYSQL_DATA_SOURCE = new DataSource(MYSQL_DATABASE_CONFIG);

// 数据库注入
export const DatabaseProviders: Provider[] = [
  {
    provide: 'MYSQL_DATA_SOURCE',
    useFactory: async () => {
      await MYSQL_DATA_SOURCE.initialize();
      return MYSQL_DATA_SOURCE;
    },
  },
];
