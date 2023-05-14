declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: 'development' | 'production' | 'test';
      ACM_CERTIFICATE_ARN: string | undefined;
      ACTIVE_CAMPAIGN_API_TOKEN: string | undefined;
      ACTIVE_CAMPAIGN_BASEURL: string | undefined;
      CDK_DEFAULT_ACCOUNT: string | undefined;
      CDK_DEFAULT_REGION: string | undefined;
      DISCORD_BOT_TOKEN: string | undefined;
      DISCORD_CLIENT_ID: string | undefined;
      DISCORD_CLIENT_SECRET: string | undefined;
      DISCORD_DEFAULT_CHANNELID: string | undefined;
      MM_AUTH_URL: string | undefined;
      EXPRESS_SERVER_PORT: string | undefined;
    }
  }
}

export {};
