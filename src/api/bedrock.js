import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";

// Initialize Bedrock Agent client with AWS credentials
const bedrockAgentClient = new BedrockAgentRuntimeClient({
    region: import.meta.env.VITE_BEDROCK_ZONE || 'ap-southeast-1',
    credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
    }
});

// Agent configuration from environment
const AGENT_ID = import.meta.env.VITE_BEDROCK_AGENT_ID;
const AGENT_ALIAS_ID = import.meta.env.VITE_BEDROCK_AGENT_ALIAS_ID;

/**
 * Chat with Amazon Bedrock Agent
 * @param {string} userMessage - The user's message
 * @param {string} sessionId - Session ID for conversation continuity
 * @returns {Promise<string>} - The AI response
 */
export async function chatWithBedrock(userMessage, sessionId = null) {
    try {
        // Generate session ID if not provided
        const session = sessionId || `session-${Date.now()}`;

        const command = new InvokeAgentCommand({
            agentId: AGENT_ID,
            agentAliasId: AGENT_ALIAS_ID,
            sessionId: session,
            inputText: userMessage
        });

        const response = await bedrockAgentClient.send(command);

        // Parse streaming response
        let fullResponse = '';

        if (response.completion) {
            for await (const event of response.completion) {
                if (event.chunk && event.chunk.bytes) {
                    const text = new TextDecoder().decode(event.chunk.bytes);
                    fullResponse += text;
                }
            }
        }

        return fullResponse || 'Không có phản hồi từ trợ lý.';
    } catch (error) {
        console.error("Bedrock Agent error:", error);
        throw error;
    }
}

/**
 * Chat with conversation history (using session)
 * @param {string} userMessage - The user's message  
 * @param {string} sessionId - Session ID for conversation continuity
 * @returns {Promise<string>} - The AI response
 */
export async function chatWithHistory(userMessage, sessionId) {
    return chatWithBedrock(userMessage, sessionId);
}

export default bedrockAgentClient;
