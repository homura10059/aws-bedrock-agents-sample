#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BedrockAgentStack } from './stacks/bedrock-agent-stack';

const app = new cdk.App();

new BedrockAgentStack(app, 'BedrockAgentStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'AWS Bedrock Agents sample implementation',
});

app.synth();