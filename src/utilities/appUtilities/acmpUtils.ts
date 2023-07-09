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

export const fetchAllMagicMasteryACMPContacts = async () => {
  const recurseMMTagContacts = async (input: {
    tagid: number;
    limit: number;
    offset: number;
    result: { email: string }[];
    count: number;
  }) => {
    const pageResults = await dgAcmpReq({
      method: 'GET',
      endpoint: '/contacts',
      dataOrParams: {
        tagid: input.tagid,
        limit: input.limit,
        offset: input.offset,
      },
    });

    if (pageResults.contacts.length < 100) {
      return input.result.concat(pageResults.contacts);
    }

    const recursedResult = (await recurseMMTagContacts({
      tagid: input.tagid,
      limit: input.limit,
      offset: input.offset + input.limit,
      result: input.result.concat(pageResults.contacts),
      count: input.count + 1,
    })) as { email: string }[];

    return recursedResult;
  };

  const mmMembers = await recurseMMTagContacts({
    tagid: 10,
    limit: 100,
    offset: 0,
    result: [],
    count: 0,
  });

  console.info(`${mmMembers.length} Magic Mastery Members`);
  return mmMembers;
};
