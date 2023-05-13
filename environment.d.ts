declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: 'development' | 'production' | 'test';
      DISCORD_BOT_TOKEN: string;
      DISCORD_CLIENT_ID: string;
      DISCORD_CLIENT_SECRET: string;
      DISCORD_DEFAULT_CHANNELID: string;
      MM_AUTH_URL: string;
      MM_GUILD_ID: string;
      EXPRESS_SERVER_PORT: string;
    }
  }
}

export {};
