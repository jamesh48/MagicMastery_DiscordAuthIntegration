import type { StackProps } from 'aws-cdk-lib';

export interface MmIacStackProps extends StackProps {
  applyHttpsSettings: boolean;
}

export type EnvKeys =
  | 'ACM_CERTIFICATE_ARN'
  | 'ACTIVE_CAMPAIGN_API_TOKEN'
  | 'ACTIVE_CAMPAIGN_BASEURL'
  | 'DISCORD_BOT_TOKEN'
  | 'EXPRESS_SERVER_PORT'
  | 'MM_AUTH_URL'
  | 'DISCORD_REGISTRATION_CHANNEL_ID';
