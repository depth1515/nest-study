import { Provider } from '@nestjs/common';
import { User } from './user.mongo.entity';

export const UserProvider: Provider[] = [
  {
    provide: 'USER_REPOSITORY',
    useFactory: async (AppDataSource) =>
      await AppDataSource.getRepository(User),
    inject: ['MONGODB_DATA_SOURCE'],
  },
];
