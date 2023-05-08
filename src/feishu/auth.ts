import { getConfig } from 'utils';
import { methodV } from 'utils/request';

const {
  FETSH_CONFIG: { FEISHU_APP_ID, FEISHU_APP_SECRET },
} = getConfig();

export type GetAppTokenRes = {
  code: number;
  msg: string;
  app_access_token: string;
  expire: number;
};

export const getAppToken = async () => {
  const { data } = await methodV({
    url: '/auth/v3/app_access_token/internal',
    method: 'POST',
    params: {
      app_id: FEISHU_APP_ID,
      app_secret: FEISHU_APP_SECRET,
    },
  });
  return data as GetAppTokenRes;
};
