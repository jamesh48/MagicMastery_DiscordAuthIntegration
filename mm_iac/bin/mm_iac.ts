#!/usr/bin/env node
import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env.prd' });
//
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MmIacStack } from '../lib/mm_iac-stack';

const app = new cdk.App();

new MmIacStack(app, 'MmIacStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
