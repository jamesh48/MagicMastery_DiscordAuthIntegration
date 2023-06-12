import axios from 'axios';

export const dgAcmpReq = async (reqConfig: {
  method: 'GET' | 'PUT';
  endpoint: string;
  dataOrParams: {};
}) => {
  const acmpBaseUrl = process.env.DG_ACTIVE_CAMPAIGN_BASEURL;
  const acmpApiToken = process.env.DG_ACTIVE_CAMPAIGN_API_TOKEN;
  const { data } = await axios({
    url: `${acmpBaseUrl}/${reqConfig.endpoint}`,
    ...(reqConfig.method === 'GET' ? { params: reqConfig.dataOrParams } : {}),
    ...(reqConfig.method === 'PUT' ? { data: reqConfig.dataOrParams } : {}),
    method: reqConfig.method,
    headers: {
      'Api-Token': acmpApiToken,
      accept: 'application/json',
      'content-type': 'application/json',
    },
  });
  return data;
};

export const acmpReq = async (reqConfig: {
  method: 'GET' | 'PUT';
  endpoint: string;
  dataOrParams: {};
}) => {
  const acmpBaseUrl = process.env.ACTIVE_CAMPAIGN_BASEURL;
  const acmpApiToken = process.env.ACTIVE_CAMPAIGN_API_TOKEN;
  const { data } = await axios({
    url: `${acmpBaseUrl}/${reqConfig.endpoint}`,
    ...(reqConfig.method === 'GET' ? { params: reqConfig.dataOrParams } : {}),
    ...(reqConfig.method === 'PUT' ? { data: reqConfig.dataOrParams } : {}),
    method: reqConfig.method,
    headers: {
      'Api-Token': acmpApiToken,
      accept: 'application/json',
      'content-type': 'application/json',
    },
  });
  return data;
};
