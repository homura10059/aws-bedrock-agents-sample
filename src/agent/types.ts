export interface AgentConfiguration {
  agentId: string;
  agentAliasId: string;
  region: string;
}

export interface InvokeAgentRequest {
  inputText: string;
  sessionId: string;
  agentId: string;
  agentAliasId: string;
  sessionState?: {
    sessionAttributes?: Record<string, string>;
    promptSessionAttributes?: Record<string, string>;
  };
}

export interface InvokeAgentResponse {
  completion: AsyncIterable<InvokeAgentResponseChunk>;
  sessionId: string;
}

export interface InvokeAgentResponseChunk {
  bytes?: Uint8Array;
  attribution?: {
    citations?: Array<{
      generatedResponsePart: {
        textResponsePart: {
          text: string;
          span: {
            start: number;
            end: number;
          };
        };
      };
      retrievedReferences: Array<{
        content: {
          text: string;
        };
        location: {
          type: string;
          s3Location?: {
            uri: string;
          };
        };
        metadata?: Record<string, any>;
      }>;
    }>;
  };
  chunk?: {
    bytes: Uint8Array;
  };
  trace?: {
    trace: {
      orchestrationTrace?: {
        invocationInput?: {
          invocationType: string;
          actionGroupInvocationInput?: {
            actionGroupName: string;
            verb: string;
            apiPath: string;
            parameters: Array<{
              name: string;
              type: string;
              value: string;
            }>;
            requestBody: {
              content: Record<string, any>;
            };
          };
        };
        modelInvocationInput?: {
          inferenceConfiguration: {
            maximumLength: number;
            stopSequences: string[];
            temperature: number;
            topK: number;
            topP: number;
          };
          text: string;
          type: string;
        };
        modelInvocationOutput?: {
          parsedResponse: {
            text: string;
          };
        };
        observation?: {
          actionGroupInvocationOutput?: {
            text: string;
          };
          finalResponse?: {
            text: string;
          };
          knowledgeBaseLookupOutput?: {
            retrievedReferences: Array<any>;
          };
          repromptResponse?: {
            text: string;
            source: string;
          };
        };
      };
    };
  };
}

export interface TextProcessingRequest {
  text: string;
  operation: 'count_words' | 'count_characters' | 'to_uppercase' | 'to_lowercase';
}

export interface TextProcessingResponse {
  result: string;
  originalText: string;
  operation: string;
}

export interface CurrentTimeResponse {
  currentTime: string;
}