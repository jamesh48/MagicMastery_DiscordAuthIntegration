import * as cdk from 'aws-cdk-lib';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';
import { MMAuthALB } from '../constructs/mmApplicationLoadBalancedFargateService';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { HostedZone } from 'aws-cdk-lib/aws-route53';

export class MmIacStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    if (!process.env.ACTIVE_CAMPAIGN_API_TOKEN) {
      throw new Error('ACTIVE_CAMPAIGN_API_TOKEN env is not Defined!');
    }

    if (!process.env.ACTIVE_CAMPAIGN_BASEURL) {
      throw new Error('ACTIVE_CAMPAIGN_BASEURL env is not Defined!');
    }

    if (!process.env.DISCORD_CLIENT_ID) {
      throw new Error('DISCORD_CLIENT_ID env is not Defined!');
    }

    if (!process.env.DISCORD_CLIENT_SECRET) {
      throw new Error('DISCORD_CLIENT_SECRET env is not Defined!');
    }

    if (!process.env.DISCORD_DEFAULT_CHANNELID) {
      throw new Error('DISCORD_DEFAULT_CHANNELID env is not Defined!');
    }

    if (!process.env.MM_GUILD_ID) {
      throw new Error('MM_GUILD_ID env is not Defined!');
    }

    if (!process.env.MM_AUTH_URL) {
      throw new Error('MM_AUTH_URL env is not Defined!');
    }

    if (!process.env.DISCORD_BOT_TOKEN) {
      throw new Error('DISCORD_BOT_TOKEN env is not Defined!');
    }

    if (!process.env.EXPRESS_SERVER_PORT) {
      throw new Error('EXPRESS_SERVER_PORT env is not Defined!');
    }

    const domainZone = HostedZone.fromLookup(this, 'mm-auth-hosted-zone', {
      domainName: 'magicmastery-auth.com',
    });

    const certificate = Certificate.fromCertificateArn(
      this,
      'mm-auth-cert',
      'arn:aws:acm:us-east-1:471507967541:certificate/97f55f29-95d2-490f-8fdc-775253b4e084'
    );

    const service = new MMAuthALB(this, 'mm-auth-service', {
      cpu: 1024,
      memoryLimitMiB: 2048,
      domainName: 'magicmastery-auth.com',
      domainZone,
      certificate,
      redirectHTTP: true,
      protocol: elbv2.ApplicationProtocol.HTTPS,
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset('../'),
        family: 'mm-auth-family',
        containerPort: Number(process.env.EXPRESS_SERVER_PORT),
        containerName: 'mm-auth-container',
        environment: {
          ACTIVE_CAMPAIGN_API_TOKEN: process.env.ACTIVE_CAMPAIGN_API_TOKEN,
          ACTIVE_CAMPAIGN_BASEURL: process.env.ACTIVE_CAMPAIGN_BASEURL,
          DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
          DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
          DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
          DISCORD_DEFAULT_CHANNELID: process.env.DISCORD_DEFAULT_CHANNELID,
          MM_AUTH_URL: process.env.MM_AUTH_URL,
          EXPRESS_SERVER_PORT: process.env.EXPRESS_SERVER_PORT,
          MM_GUILD_ID: process.env.MM_GUILD_ID,
        },
      },
    });

    service.targetGroup.configureHealthCheck({
      interval: cdk.Duration.seconds(10),
      timeout: cdk.Duration.seconds(5),
      healthyThresholdCount: 3,
      unhealthyThresholdCount: 2,
      healthyHttpCodes: '200',
      path: '/healthcheck',
      port: process.env.EXPRESS_SERVER_PORT,
      protocol: elbv2.Protocol.HTTP,
    });
  }
}
