declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: 'development' | 'production' | 'test';
      ACM_CERTIFICATE_ARN: string;
      ACTIVE_CAMPAIGN_API_TOKEN: string;
      ACTIVE_CAMPAIGN_BASEURL: string;
      DISCORD_BOT_TOKEN: string;
      DISCORD_REGISTRATION_CHANNEL_ID: string;
      MM_AUTH_URL: string;
      EXPRESS_SERVER_PORT: string;
    }
  }
}

export {};
