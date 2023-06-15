import { Construct } from 'constructs';
import { aws_ecs as ecs } from 'aws-cdk-lib';
import { aws_elasticloadbalancingv2 as elbv2 } from 'aws-cdk-lib';
import { aws_ecs_patterns as ecsPatterns } from 'aws-cdk-lib';

/**
 * An enum representing the different kinds of Route53 Alias records that can be
 * created by this construct
 */
export declare enum MMApplicationLoadBalancedServiceAliasRecordType {
  /**
   * This represents no record. If this value is provided, no DNS record will
   * be created by this construct.
   */
  NONE = 0,
  /**
   * This represents a weighted record. If this value is provided, a weighted
   * record will be created for this construct. Weighted records allow for
   * active-active configurations where Route53 will respond with all healthy
   * records in the set.
   */
  WEIGHTED = 1,
  /**
   * This represents a primary record member of a failover recordset. If this
   * value is provided, a failover primary record will be created. Route53 will
   * respond with the value for the record created by this construct unless the
   * target is considered unhealthy.
   */
  FAILOVER_PRIMARY = 2,
  /**
   * This represents a secondary record member of a failover recordset. If this
   * value is provided, a failover secondary record will be created. Route53 will
   * respond with the value for the primary record member of this recordset
   * unless that record is marked unhealthy
   */
  FAILOVER_SECONDARY = 3,
}

export interface MMApplicationLoadBalancedFargateServiceProps
  extends ecsPatterns.ApplicationLoadBalancedFargateServiceProps {
  /**
   * ARN of certificate to use for SSL on generated load balancer. If no
   * certificateArn or certificate is provided, load balancer will be deployed
   * without a secure listener. Adding a certificate or certificateArn will
   * create a secure listener. If certificate is provided, this property will
   * be ignored.
   */
  readonly certificateArn?: string;
  /**
   * Physical name of the ecs cluster where this service will be deployed.
   *
   * @default
   *
   * Uses SSM to find the physical name of the destination cluster
   */
  readonly clusterName?: string;
  /**
   * Physical name of the SSM parameter where the physical name of the
   * destination cluster is located. Override this parameter if you specified
   * a custom parameter name at cluster creation.
   *
   * @default
   *
   * The standard mm ssm parameter format:
   * /abc/ecs/dev/CLUSTER_NAME
   */
  readonly clusterNameSSMParameterName?: string;
  /**
   * Registry where the main task container image is located. Either this and
   * taskImageTag or taskImageOptions or taskDefinition must be provided.
   *
   * @example
   *
   * artifactory.ual.com:443/dockerlocal/cto-cloud-devops.homepage
   */
  readonly taskRegistry?: string;
  /**
   * Image tag to request from taskRegistry
   *
   * @example
   *
   * 1.2.3
   */
  readonly taskImageTag?: string;
  /**
   * Properties to provide credentials when requesting an image from a private
   * registry. Only used if taskRegistry and taskImageTag are both provided.
   */
  readonly taskImageRepositoryProperties?: ecs.RepositoryImageProps;
  /**
   * Environment variables to add to main task container
   *
   * @example
   *
   * {"ASPNETCORE_ENVIRONMENT": "Development"}
   */
  readonly containerEnvironment?: {
    [key: string]: string;
  };
  /**
   * Vpc id where this service should be deployed
   *
   * @default
   *
   * Uses vpc discovered by MMNetwork construct
   */
  readonly vpcId?: string;
  /**
   * Port on main container to send traffic from load balancer
   */
  readonly containerPort?: number;
  /**
   * Specifies whether an alias record should be created and which type it
   * should have.
   *
   * @default
   *
   * MMApplicationLoadBalancedServiceAliasRecordType.WEIGHTED
   */
  readonly aliasRecordType?: MMApplicationLoadBalancedServiceAliasRecordType;
  /**
   * The name of the hosted zone where the record for this load balancer will
   * be created.
   *
   * @default
   *
   * environment.application-ci.aws.mm.com
   *
   */
  readonly hostedZoneName?: string;
  /**
   * If using weighted records, the weight to assign to this record
   *
   * @default
   *
   * 100
   */
  readonly weight?: number;

  /**
   * The health check configuration to add to the load balancer
   */
  readonly healthCheck?: elbv2.HealthCheck;
}
export class MMAuthFargateALB extends ecsPatterns.ApplicationLoadBalancedFargateService {
  /**
   * Creates a new MMApplicationLoadBalancedFargateService
   *
   * @param scope Parent of this MMApplicationLoadBalancedFargateService,
   * usually a `MMStack`, but could be any construct in a `MMStack`.
   * @param id The id of this construct. If `serviceName` is not explicitly
   * defined, this id (and any parent IDs) will be used to define the physical
   * names of resources created by this construct.
   * @param props MMApplicationLoadBalancedFargateService properties
   */
  constructor(
    scope: Construct,
    id: string,
    props: MMApplicationLoadBalancedFargateServiceProps
  ) {
    super(scope, id, props);
  }
}
