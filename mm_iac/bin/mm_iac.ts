#!/usr/bin/env node
import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env.prd' });
//
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MmIacStack } from '../lib/mm_iac-stack';
import { MmIacStackProps } from '../lib/types';

const app = new cdk.App();

console.info(process.env.CDK_DEFAULT_ACCOUNT);
if (process.env.CDK_DEFAULT_ACCOUNT !== '036663905174') {
  throw new Error('Invalid Account');
}

if (process.env.CDK_DEFAULT_REGION !== 'us-east-1') {
  throw new Error('Invalid Region');
}

const mmIacStackProps: MmIacStackProps = {
  applyHttpsSettings: true,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
};

new MmIacStack(app, 'MmIacStack', mmIacStackProps);
