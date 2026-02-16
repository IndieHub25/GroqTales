import { NextResponse } from 'next/server';
import { createAgent } from './create-agent';

interface AgentResponse {
  status: number;
  data?: any;
}

/**
 * Handles POST requests to interact with the AgentKit-powered AI agent.
 * Returns the agent response in JSON format.
 */
export async function POST(req: Request): Promise<NextResponse<AgentResponse>> {
  try {
    await createAgent(); // Initialize agent (placeholder)
    const requestBody = await req.json();
    const response = requestBody.userMessage || requestBody.input || '';
    return NextResponse.json({ status: 200, data: { response } });
  } catch (error) {
    console.error('Error processing agent request:', error);
    return NextResponse.json({
      status: 500,
      data: { error: 'Internal server error' },
    });
  }
}
