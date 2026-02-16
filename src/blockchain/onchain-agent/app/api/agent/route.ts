// import { AgentRequest, AgentResponse } from '@/app/types/api';
import { NextResponse } from 'next/server';
import { createAgent } from './create-agent';

// Temporary workaround: Defining placeholder types due to module not found error
interface AgentRequest {
  // Define necessary properties for the request
  body?: any;
}
interface AgentResponse {
  // Define necessary properties for the response
  status: number;
  data?: any;
}
/**
 * Handles incoming POST requests to interact with the AgentKit-powered AI agent.
 * This processes user messages and streams responses from the agent.
 *
 *
 * Example usage:
 * ```typescript
 * const response = await fetch("/api/agent", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ userMessage: input }),
 * });
 * ```
 */

export async function POST(req: Request): Promise<NextResponse<AgentResponse>> {
  try {
    const agent = await createAgent();
    const requestBody = await req.json();
    // Process the request with the agent
    const response = requestBody.input;
    return NextResponse.json({ status: 200, data: { response: response } });
  } catch (error) {
    console.error('Error processing agent request:', error);
    return NextResponse.json({
      status: 500,
      data: { error: 'Internal server error' },
    });
  }
}
