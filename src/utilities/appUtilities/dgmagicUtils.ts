import axios from 'axios';

export const assignBadge = async (userEmail: string) => {
  const { WIX_WEBSITE_NAME, WIX_API_KEY } = process.env;

  await axios.post(`${WIX_WEBSITE_NAME}/_functions/assignBadge`, null, {
    params: { email: userEmail.trim() },
    headers: {
      Authorization: WIX_API_KEY,
    },
  });
  return 'ok';
};

export const assignBadgesFromTags = async (tags: string, userEmail: string) => {
  const { WIX_WEBSITE_NAME, WIX_API_KEY } = process.env;
  await axios.post(
    `${WIX_WEBSITE_NAME}/_functions/assignBadgesFromTags`,
    null,
    {
      params: { tags, email: userEmail.trim() },
      headers: {
        Authorization: WIX_API_KEY,
      },
    }
  );
  return 'ok';
};

export const removeBadgesFromTags = async (tags: string, userEmail: string) => {
  const { WIX_WEBSITE_NAME, WIX_API_KEY } = process.env;
  await axios.post(
    `${WIX_WEBSITE_NAME}/_functions/removeBadgesFromTags`,
    null,
    {
      params: { tags, email: userEmail.trim() },
      headers: {
        Authorization: WIX_API_KEY,
      },
    }
  );
  return 'ok';
};
