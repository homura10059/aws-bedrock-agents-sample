import { Context } from 'aws-lambda';

interface BedrockAgentEvent {
  messageVersion: string;
  agent: {
    name: string;
    version: string;
    id: string;
    alias: string;
  };
  inputText: string;
  sessionId: string;
  actionGroup: string;
  apiPath: string;
  httpMethod: string;
  parameters?: Array<{
    name: string;
    type: string;
    value: string;
  }>;
  requestBody?: {
    content: {
      [key: string]: any;
    };
  };
}

interface BedrockAgentResponse {
  messageVersion: string;
  response: {
    actionGroup: string;
    apiPath: string;
    httpMethod: string;
    httpStatusCode: number;
    responseBody: {
      [contentType: string]: {
        body: string;
      };
    };
    sessionAttributes?: {
      [key: string]: string;
    };
    promptSessionAttributes?: {
      [key: string]: string;
    };
  };
}

export const handler = async (
  event: BedrockAgentEvent,
  context: Context
): Promise<BedrockAgentResponse> => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  const { apiPath, httpMethod, requestBody } = event;
  
  let responseBody: any;
  let httpStatusCode = 200;
  
  try {
    switch (apiPath) {
      case '/get-current-time':
        if (httpMethod === 'GET') {
          responseBody = {
            currentTime: new Date().toISOString(),
          };
        } else {
          throw new Error(`Unsupported method ${httpMethod} for ${apiPath}`);
        }
        break;
        
      case '/process-text':
        if (httpMethod === 'POST') {
          const { text, operation } = requestBody?.content?.['application/json'] || {};
          
          if (!text || !operation) {
            throw new Error('Missing required parameters: text and operation');
          }
          
          let result: string;
          
          switch (operation) {
            case 'count_words':
              const wordCount = text.trim().split(/\s+/).filter((word: string) => word.length > 0).length;
              result = `Word count: ${wordCount}`;
              break;
              
            case 'count_characters':
              result = `Character count: ${text.length}`;
              break;
              
            case 'to_uppercase':
              result = text.toUpperCase();
              break;
              
            case 'to_lowercase':
              result = text.toLowerCase();
              break;
              
            default:
              throw new Error(`Unsupported operation: ${operation}`);
          }
          
          responseBody = {
            result,
            originalText: text,
            operation,
          };
        } else {
          throw new Error(`Unsupported method ${httpMethod} for ${apiPath}`);
        }
        break;
        
      default:
        throw new Error(`Unsupported API path: ${apiPath}`);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    httpStatusCode = 400;
    responseBody = {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
  
  const response: BedrockAgentResponse = {
    messageVersion: event.messageVersion,
    response: {
      actionGroup: event.actionGroup,
      apiPath: event.apiPath,
      httpMethod: event.httpMethod,
      httpStatusCode,
      responseBody: {
        'application/json': {
          body: JSON.stringify(responseBody),
        },
      },
    },
  };
  
  console.log('Sending response:', JSON.stringify(response, null, 2));
  return response;
};