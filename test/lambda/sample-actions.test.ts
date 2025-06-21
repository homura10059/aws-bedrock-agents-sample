import { handler } from '../../src/lambda/action-groups/sample-actions';
import { Context } from 'aws-lambda';

// Mock context for testing
const mockContext = {
  callbackWaitsForEmptyEventLoop: false,
  functionName: 'test-function',
  functionVersion: '1',
  invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test-function',
  memoryLimitInMB: '128',
  awsRequestId: 'test-request-id',
  logGroupName: '/aws/lambda/test-function',
  logStreamName: '2021/01/01/[$LATEST]test-stream',
  getRemainingTimeInMillis: () => 30000,
  done: () => {},
  fail: () => {},
  succeed: () => {},
} as Context;

describe('Sample Actions Lambda Handler', () => {
  describe('GET /get-current-time', () => {
    it('should return current time', async () => {
      const event = {
        messageVersion: '1.0',
        agent: {
          name: 'test-agent',
          version: '1',
          id: 'test-id',
          alias: 'test-alias',
        },
        inputText: 'What is the current time?',
        sessionId: 'test-session',
        actionGroup: 'sample-actions',
        apiPath: '/get-current-time',
        httpMethod: 'GET',
      };

      const response = await handler(event, mockContext);

      expect(response.messageVersion).toBe('1.0');
      expect(response.response.httpStatusCode).toBe(200);
      expect(response.response.actionGroup).toBe('sample-actions');
      expect(response.response.apiPath).toBe('/get-current-time');
      
      const responseBody = JSON.parse(response.response.responseBody['application/json'].body);
      expect(responseBody.currentTime).toBeDefined();
      expect(new Date(responseBody.currentTime)).toBeInstanceOf(Date);
    });
  });

  describe('POST /process-text', () => {
    it('should count words correctly', async () => {
      const event = {
        messageVersion: '1.0',
        agent: {
          name: 'test-agent',
          version: '1' ,
          id: 'test-id',
          alias: 'test-alias',
        },
        inputText: 'Process this text',
        sessionId: 'test-session',
        actionGroup: 'sample-actions',
        apiPath: '/process-text',
        httpMethod: 'POST',
        requestBody: {
          content: {
            'application/json': {
              text: 'Hello world test message',
              operation: 'count_words',
            },
          },
        },
      };

      const response = await handler(event, mockContext);

      expect(response.response.httpStatusCode).toBe(200);
      
      const responseBody = JSON.parse(response.response.responseBody['application/json'].body);
      expect(responseBody.result).toBe('Word count: 4');
      expect(responseBody.originalText).toBe('Hello world test message');
      expect(responseBody.operation).toBe('count_words');
    });

    it('should convert text to uppercase', async () => {
      const event = {
        messageVersion: '1.0',
        agent: {
          name: 'test-agent',
          version: '1',
          id: 'test-id',
          alias: 'test-alias',
        },
        inputText: 'Convert to uppercase',
        sessionId: 'test-session',
        actionGroup: 'sample-actions',
        apiPath: '/process-text',
        httpMethod: 'POST',
        requestBody: {
          content: {
            'application/json': {
              text: 'hello world',
              operation: 'to_uppercase',
            },
          },
        },
      };

      const response = await handler(event, mockContext);

      expect(response.response.httpStatusCode).toBe(200);
      
      const responseBody = JSON.parse(response.response.responseBody['application/json'].body);
      expect(responseBody.result).toBe('HELLO WORLD');
      expect(responseBody.originalText).toBe('hello world');
      expect(responseBody.operation).toBe('to_uppercase');
    });

    it('should handle invalid operation', async () => {
      const event = {
        messageVersion: '1.0',
        agent: {
          name: 'test-agent',
          version: '1',
          id: 'test-id',
          alias: 'test-alias',
        },
        inputText: 'Invalid operation',
        sessionId: 'test-session',
        actionGroup: 'sample-actions',
        apiPath: '/process-text',
        httpMethod: 'POST',
        requestBody: {
          content: {
            'application/json': {
              text: 'test text',
              operation: 'invalid_operation',
            },
          },
        },
      };

      const response = await handler(event, mockContext);

      expect(response.response.httpStatusCode).toBe(400);
      
      const responseBody = JSON.parse(response.response.responseBody['application/json'].body);
      expect(responseBody.error).toContain('Unsupported operation');
    });
  });

  describe('Error handling', () => {
    it('should handle unsupported API path', async () => {
      const event = {
        messageVersion: '1.0',
        agent: {
          name: 'test-agent',
          version: '1',
          id: 'test-id',
          alias: 'test-alias',
        },
        inputText: 'Unsupported path',
        sessionId: 'test-session',
        actionGroup: 'sample-actions',
        apiPath: '/unsupported-path',
        httpMethod: 'GET',
      };

      const response = await handler(event, mockContext);

      expect(response.response.httpStatusCode).toBe(400);
      
      const responseBody = JSON.parse(response.response.responseBody['application/json'].body);
      expect(responseBody.error).toContain('Unsupported API path');
    });
  });
});