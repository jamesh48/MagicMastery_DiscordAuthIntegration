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

export const fetchContactTags = async (
  contactId: string,
  dg: boolean
): Promise<string[]> => {
  if (dg) {
    const { contactTags } = await dgAcmpReq({
      method: 'GET',
      endpoint: `contacts/${contactId}/contactTags`,
      dataOrParams: {},
    });

    const fetchedContactTags = await Promise.all(
      contactTags.map((contactTag: { id: string }) => {
        return new Promise(async (resolve) => {
          const contactTagResp = await dgAcmpReq({
            method: 'GET',
            endpoint: `contactTags/${contactTag.id}/tag`,
            dataOrParams: {},
          });
          resolve(contactTagResp.tag.tag);
        });
      })
    );

    return fetchedContactTags;
  } else {
    const { contactTags } = await acmpReq({
      method: 'GET',
      endpoint: `contacts/${contactId}/contactTags`,
      dataOrParams: {},
    });

    const fetchedContactTags = await Promise.all(
      contactTags.map((contactTag: { id: string }) => {
        return new Promise(async (resolve) => {
          const contactTagResp = await acmpReq({
            method: 'GET',
            endpoint: `contactTags/${contactTag.id}/tag`,
            dataOrParams: {},
          });
          resolve(contactTagResp.tag.tag);
        });
      })
    );

    return fetchedContactTags;
  }
};
