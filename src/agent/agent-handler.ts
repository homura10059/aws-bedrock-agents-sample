import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
  InvokeAgentCommandInput,
} from '@aws-sdk/client-bedrock-agent-runtime';
import {
  AgentConfiguration,
  InvokeAgentRequest,
  InvokeAgentResponse,
  InvokeAgentResponseChunk
} from './types';

export class BedrockAgentHandler {
  private client: BedrockAgentRuntimeClient;
  private config: AgentConfiguration;

  constructor(config: AgentConfiguration) {
    this.config = config;
    this.client = new BedrockAgentRuntimeClient({
      region: config.region,
    });
  }

  async invokeAgent(request: InvokeAgentRequest): Promise<string> {
    const command = new InvokeAgentCommand({
      agentId: request.agentId,
      agentAliasId: request.agentAliasId,
      sessionId: request.sessionId,
      inputText: request.inputText,
      sessionState: request.sessionState,
    });

    try {
      const response = await this.client.send(command);
      
      if (!response.completion) {
        throw new Error('No completion received from agent');
      }

      let fullResponse = '';
      
      // Process the streaming response
      for await (const chunk of response.completion) {
        if (chunk.chunk?.bytes) {
          const chunkText = new TextDecoder().decode(chunk.chunk.bytes);
          fullResponse += chunkText;
        }
      }

      return fullResponse;
    } catch (error) {
      console.error('Error invoking Bedrock Agent:', error);
      throw error;
    }
  }

  async askQuestion(question: string, sessionId?: string): Promise<string> {
    const request: InvokeAgentRequest = {
      inputText: question,
      sessionId: sessionId || this.generateSessionId(),
      agentId: this.config.agentId,
      agentAliasId: this.config.agentAliasId,
    };

    return this.invokeAgent(request);
  }

  async processText(text: string, operation: 'count_words' | 'count_characters' | 'to_uppercase' | 'to_lowercase', sessionId?: string): Promise<string> {
    const question = `Please process the following text with the operation "${operation}": "${text}". Use the process-text action to perform this operation.`;
    
    const request: InvokeAgentRequest = {
      inputText: question,
      sessionId: sessionId || this.generateSessionId(),
      agentId: this.config.agentId,
      agentAliasId: this.config.agentAliasId,
    };

    return this.invokeAgent(request);
  }

  async getCurrentTime(sessionId?: string): Promise<string> {
    const question = 'What is the current time? Please use the get-current-time action to retrieve this information.';
    
    const request: InvokeAgentRequest = {
      inputText: question,
      sessionId: sessionId || this.generateSessionId(),
      agentId: this.config.agentId,
      agentAliasId: this.config.agentAliasId,
    };

    return this.invokeAgent(request);
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Example usage function
export async function exampleUsage() {
  // Configuration - these values would come from CDK outputs
  const config: AgentConfiguration = {
    agentId: 'YOUR_AGENT_ID', // Replace with actual agent ID from CDK output
    agentAliasId: 'YOUR_AGENT_ALIAS_ID', // Replace with actual alias ID from CDK output
    region: 'us-east-1',
  };

  const agentHandler = new BedrockAgentHandler(config);
  const sessionId = `example-session-${Date.now()}`;

  try {
    // Example 1: Ask a general question
    console.log('=== General Question ===');
    const answer1 = await agentHandler.askQuestion(
      'Hello! Can you tell me what you can help me with?',
      sessionId
    );
    console.log('Response:', answer1);

    // Example 2: Get current time
    console.log('\\n=== Get Current Time ===');
    const timeResponse = await agentHandler.getCurrentTime(sessionId);
    console.log('Time Response:', timeResponse);

    // Example 3: Process text - count words
    console.log('\\n=== Process Text - Count Words ===');
    const wordCountResponse = await agentHandler.processText(
      'This is a sample text to count words.',
      'count_words',
      sessionId
    );
    console.log('Word count response:', wordCountResponse);

    // Example 4: Process text - convert to uppercase
    console.log('\\n=== Process Text - Uppercase ===');
    const uppercaseResponse = await agentHandler.processText(
      'convert this text to uppercase',
      'to_uppercase',
      sessionId
    );
    console.log('Uppercase response:', uppercaseResponse);

  } catch (error) {
    console.error('Error in example usage:', error);
  }
}

// Uncomment the following line to run the example
// exampleUsage();