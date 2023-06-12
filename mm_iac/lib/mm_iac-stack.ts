import * as cdk from 'aws-cdk-lib';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as r53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';
import { MMAuthALB } from '../constructs/mmApplicationLoadBalancedFargateService';
import { EnvKeys, MmIacStackProps } from './types';

export class MmIacStack extends cdk.Stack {
  private isDefined(variable: string | undefined): variable is string {
    if (typeof variable === 'undefined') {
      throw new Error(`${variable} env is not defined`);
    }
    return true;
  }

  public getDefinedEnvVariables(): Record<EnvKeys, string> {
    const definedEnvVariables = Object.fromEntries(
      Object.entries(process.env).map<[EnvKeys, string] | undefined>(
        ([key, value]) => {
          if (this.isDefined(value)) {
            return [key as EnvKeys, value];
          }
          return undefined;
        }
      ) as Iterable<readonly [EnvKeys, string]>
    ) as Record<EnvKeys, string>;

    return definedEnvVariables;
  }

  constructor(scope: Construct, id: string, props: MmIacStackProps) {
    super(scope, id, props);

    const {
      ACM_CERTIFICATE_ARN,
      ACTIVE_CAMPAIGN_API_TOKEN,
      ACTIVE_CAMPAIGN_BASEURL,
      DISCORD_BOT_TOKEN,
      DISCORD_REGISTRATION_CHANNEL_ID,
      DG_ACTIVE_CAMPAIGN_BASEURL,
      DG_ACTIVE_CAMPAIGN_API_TOKEN,
      EXPRESS_SERVER_PORT,
      MM_AUTH_URL,
      WIX_API_KEY,
      WIX_WEBSITE_NAME,
    } = this.getDefinedEnvVariables();

    const httpsSettings = {
      ...(() => {
        const domainZone = r53.HostedZone.fromLookup(
          this,
          'mm-auth-hosted-zone',
          {
            domainName: 'magicmastery-auth.com',
          }
        );
        const domainName = domainZone.zoneName;

        return { domainZone, domainName };
      })(),
      certificate: acm.Certificate.fromCertificateArn(
        this,
        'mm-auth-cert',
        ACM_CERTIFICATE_ARN
      ),
      redirectHTTP: true,
      protocol: elbv2.ApplicationProtocol.HTTPS,
    };

    const service = new MMAuthALB(this, 'mm-auth-service', {
      cpu: 256,
      memoryLimitMiB: 512,
      ...(props.applyHttpsSettings ? httpsSettings : {}),
      capacityProviderStrategies: [
        { capacityProvider: 'FARGATE_SPOT', base: 1, weight: 100 },
      ],
      propagateTags: ecs.PropagatedTagSource.SERVICE,
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset('../'),
        family: 'mm-auth-family',
        containerPort: Number(process.env.EXPRESS_SERVER_PORT),
        containerName: 'mm-auth-container',
        environment: {
          ACTIVE_CAMPAIGN_API_TOKEN,
          ACTIVE_CAMPAIGN_BASEURL,
          DG_ACTIVE_CAMPAIGN_BASEURL,
          DG_ACTIVE_CAMPAIGN_API_TOKEN,
          DISCORD_BOT_TOKEN,
          DISCORD_REGISTRATION_CHANNEL_ID,
          MM_AUTH_URL,
          EXPRESS_SERVER_PORT,
          WIX_API_KEY,
          WIX_WEBSITE_NAME,
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
