import axios from 'axios';

export const validateDiscordUser = async (discordId: string) => {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  try {
    await axios({
      method: 'GET',
      url: `https://discord.com/api/v9/users/${discordId}`,
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    });
    return true;
  } catch (err) {
    return false;
  }
};
