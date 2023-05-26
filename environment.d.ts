declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: 'development' | 'production' | 'test';
      ACM_CERTIFICATE_ARN: string;
      ACTIVE_CAMPAIGN_API_TOKEN: string;
      ACTIVE_CAMPAIGN_BASEURL: string;
      DISCORD_BOT_TOKEN: string;
      DISCORD_CLIENT_ID: string;
      DISCORD_CLIENT_SECRET: string;
      DISCORD_DEFAULT_CHANNELID: string;
      DISCORD_MAIN_REGISTRATION_CHANNEL_ID: string;
      DISCORD_PARENT_REGISTRATION_CHANNEL: string;
      MM_AUTH_URL: string;
      MM_GUILD_ID: string;
      EXPRESS_SERVER_PORT: string;
    }
  }
}

export {};
