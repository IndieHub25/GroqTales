import { NextRequest, NextResponse } from 'next/server';
import { generateStorySchema } from '@/lib/schemas';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { headers } from 'next/headers';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
});

export async function POST(req: NextRequest) {
  try {
    const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
    
    const { success, limit, reset, remaining } = await ratelimit.limit(`story_gen_${ip}`);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { 
          status: 429, 
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          } 
        }
      );
    }

    const body = await req.json();
    const parseResult = generateStorySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { prompt, genre, tone } = parseResult.data;

    const systemPrompt = `You are a creative storyteller. 
    Genre: ${genre}
    Tone: ${tone || 'neutral'}
    Create a unique, engaging story based on the user's prompt. 
    Keep it under 500 words. Format with clear paragraphs.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      model: "llama3-70b-8192",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const generatedStory = completion.choices[0]?.message?.content || "";

    if (!generatedStory) {
      throw new Error("Groq returned an empty response");
    }

    return NextResponse.json({ 
      success: true, 
      story: generatedStory,
      meta: {
        genre,
        tone,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Story Generation Error:", error);
    
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to generate story" }, 
      { status: 500 }
    );
  }
}