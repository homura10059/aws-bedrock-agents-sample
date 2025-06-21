import * as cdk from 'aws-cdk-lib';
import * as bedrock from '@aws-cdk/aws-bedrock-alpha';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import * as path from 'path';

export class BedrockAgentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda function for Action Groups
    const actionGroupLambda = new lambda.Function(this, 'ActionGroupLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'sample-actions.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../lib/lambda/action-groups')),
      environment: {
        LOG_LEVEL: 'INFO',
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      timeout: cdk.Duration.seconds(30),
    });

    // IAM role for Bedrock Agent
    const agentRole = new iam.Role(this, 'BedrockAgentRole', {
      assumedBy: new iam.ServicePrincipal('bedrock.amazonaws.com'),
      description: 'Role for Bedrock Agent to access required services',
      inlinePolicies: {
        BedrockModelAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'bedrock:InvokeModel',
              ],
              resources: [
                // Amazon Titan Text G1 - Express (cheapest option)
                `arn:aws:bedrock:${this.region}::foundation-model/amazon.titan-text-express-v1`,
              ],
            }),
          ],
        }),
      },
    });

    // IAM role for Action Groups
    const actionGroupRole = new iam.Role(this, 'ActionGroupRole', {
      assumedBy: new iam.ServicePrincipal('bedrock.amazonaws.com'),
      description: 'Role for Bedrock Agent Action Groups',
      inlinePolicies: {
        LambdaInvokeAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['lambda:InvokeFunction'],
              resources: [actionGroupLambda.functionArn],
            }),
          ],
        }),
      },
    });

    // Grant Lambda invoke permissions to Bedrock
    actionGroupLambda.grantInvoke(
      new iam.ServicePrincipal('bedrock.amazonaws.com')
    );

    // Create the Bedrock Agent
    const agent = new bedrock.Agent(this, 'SampleAgent', {
      name: 'sample-text-agent',
      description: 'A sample Bedrock Agent for text processing and Q&A',
      foundationModel: bedrock.BedrockFoundationModel.AMAZON_TITAN_TEXT_EXPRESS_V1,
      instruction: `You are a helpful assistant that can answer questions and process text.
      You have access to action groups that can perform specific tasks.
      Always be polite and helpful in your responses.
      If you're unsure about something, please say so rather than making up information.`,
      idleSessionTTL: cdk.Duration.minutes(30),
      shouldPrepareAgent: true,
      agentResourceRoleArn: agentRole.roleArn,
    });

    // Add Action Group to the Agent
    agent.addActionGroup({
      actionGroupName: 'sample-actions',
      description: 'Sample action group for basic operations',
      actionGroupExecutor: {
        lambda: actionGroupLambda,
      },
      actionGroupState: 'ENABLED',
      apiSchema: bedrock.ApiSchema.fromInline({
        openapi: '3.0.0',
        info: {
          title: 'Sample Actions API',
          version: '1.0.0',
          description: 'API for sample agent actions',
        },
        paths: {
          '/get-current-time': {
            get: {
              summary: 'Get current time',
              description: 'Returns the current date and time',
              operationId: 'getCurrentTime',
              responses: {
                '200': {
                  description: 'Successful response',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          currentTime: {
                            type: 'string',
                            description: 'Current date and time in ISO format',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '/process-text': {
            post: {
              summary: 'Process text input',
              description: 'Processes and analyzes the provided text',
              operationId: 'processText',
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        text: {
                          type: 'string',
                          description: 'Text to be processed',
                        },
                        operation: {
                          type: 'string',
                          enum: ['count_words', 'count_characters', 'to_uppercase', 'to_lowercase'],
                          description: 'Operation to perform on the text',
                        },
                      },
                      required: ['text', 'operation'],
                    },
                  },
                },
              },
              responses: {
                '200': {
                  description: 'Successful response',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          result: {
                            type: 'string',
                            description: 'Result of the text processing operation',
                          },
                          originalText: {
                            type: 'string',
                            description: 'Original input text',
                          },
                          operation: {
                            type: 'string',
                            description: 'Operation that was performed',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    });

    // Create an Agent Alias for deployment
    const agentAlias = agent.addAlias({
      aliasName: 'prod',
      description: 'Production alias for the sample agent',
    });

    // Output important information
    new cdk.CfnOutput(this, 'AgentId', {
      value: agent.agentId,
      description: 'ID of the created Bedrock Agent',
    });

    new cdk.CfnOutput(this, 'AgentAliasId', {
      value: agentAlias.aliasId,
      description: 'ID of the Agent Alias',
    });

    new cdk.CfnOutput(this, 'ActionGroupLambdaArn', {
      value: actionGroupLambda.functionArn,
      description: 'ARN of the Action Group Lambda function',
    });

    new cdk.CfnOutput(this, 'AgentArn', {
      value: agent.agentArn,
      description: 'ARN of the Bedrock Agent',
    });
  }
}