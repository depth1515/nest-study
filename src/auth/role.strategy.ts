import { SetMetadata } from '@nestjs/common';

export const ALLOW_NO_PERM = 'allowNoPerm';
export const AllowNoPerm = () => SetMetadata(ALLOW_NO_PERM, true);
