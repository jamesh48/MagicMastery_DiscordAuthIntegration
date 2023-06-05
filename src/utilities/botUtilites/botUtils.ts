import axios from 'axios';

export const registerNewEmail = async (email: string, discordId: string) => {
  try {
    const { data } = await axios.post(
      `${process.env.MM_AUTH_URL}/acmpActivate`,
      {
        email,
        discordId,
      }
    );
    return data.message;
  } catch (err) {
    return err.response.data.error;
  }
};
