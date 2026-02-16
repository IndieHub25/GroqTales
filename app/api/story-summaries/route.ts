import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

interface StorySummary {
  _id?: ObjectId | string;
  storyId: ObjectId | string;
  originalContent: string;
  summary: string;
  keyPoints: string[];
  sentiment: string;
  keywords: string[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

import {
  findOne,
  find,
  insertOne,
  updateOne,
  deleteOne,
  createObjectId,
} from '@/lib/db';
import { generateContentCustom, GROQ_MODELS } from '@/lib/groq-service';
const COLLECTION_NAME = 'story_summaries';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      storyId,
      content,
      model = GROQ_MODELS.STORY_GENERATION,
      apiKey,
    } = body;
    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      );
    }
    if (!content) {
      return NextResponse.json(
        { error: 'Story content is required' },
        { status: 400 }
      );
    }
    // Check if summary already exists
    const existingSummary = await findOne(COLLECTION_NAME, {
      storyId: createObjectId(storyId),
    });
    if (existingSummary) {
      return NextResponse.json(
        {
          error: 'Summary already exists for this story',
          summary: existingSummary,
        },
        { status: 409 }
      );
    }
    // Generate the summary using Groq
    const prompt = `
      Analyze the following story and provide:
      1. A concise summary (max 3 paragraphs)
      2. 5 key points from the story
      3. Overall sentiment (positive, negative, mixed, neutral)
      4. 10 keywords or tags that represent the content
      Format your response as valid JSON with the following structure:
      {
        "summary": "The summary text here...",
        "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
        "sentiment": "positive/negative/mixed/neutral",
        "keywords": ["keyword1", "keyword2", ...]
}
      Story:
      ${content.substring(0, 6000)}
    `;
    const analysisResult = await generateContentCustom(prompt, {
      model,
      temperature: 0.3,
      maxTokens: 1000,
      apiKey,
    });
    // Parse the JSON response
    const jsonMatch = analysisResult.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response as JSON');
    }
    const analysis = JSON.parse(jsonMatch[0]);
    // Create summary document
    const summaryDoc: StorySummary = {
      storyId: createObjectId(storyId),
      originalContent: content.substring(0, 1000), // Store the first 1000 chars for reference
      summary: analysis.summary,
      keyPoints: analysis.keyPoints,
      sentiment: analysis.sentiment,
      keywords: analysis.keywords,
      model,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // Save to database
    const result = await insertOne(COLLECTION_NAME, summaryDoc);
    return NextResponse.json({
      success: true,
      message: 'Summary generated and stored successfully',
      summary: {
        ...summaryDoc,
        _id: result.insertedId,
      },
    });
  } catch (error: any) {
    console.error('Story summary generation error:', error);
    return NextResponse.json(
      {
        error:
          error.message || 'An error occurred while processing your request',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get('storyId');
    let query = {};
    if (storyId) {
      query = { storyId: createObjectId(storyId) };
    }
    const summaries = await find(COLLECTION_NAME, query);
    return NextResponse.json({
      success: true,
      summaries,
    });
  } catch (error: any) {
    console.error('Error fetching story summaries:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching summaries' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      content,
      regenerate,
      model = GROQ_MODELS.STORY_GENERATION,
      apiKey,
    } = body;
    if (!id) {
      return NextResponse.json(
        { error: 'Summary ID is required' },
        { status: 400 }
      );
    }
    // Find the existing summary
    const existingSummary = await findOne(COLLECTION_NAME, {
      _id: createObjectId(id),
    });
    if (!existingSummary) {
      return NextResponse.json(
        {
          error: 'Summary not found',
        },
        { status: 404 }
      );
    }
    let updatedSummary: Partial<StorySummary> = {
      updatedAt: new Date(),
    };
    // If content is provided and regenerate is true, create a new summary
    if (content && regenerate) {
      const prompt = `
        Analyze the following story and provide:
        1. A concise summary (max 3 paragraphs)
        2. 5 key points from the story
        3. Overall sentiment (positive, negative, mixed, neutral)
        4. 10 keywords or tags that represent the content
        Format your response as valid JSON with the following structure:
        {
          "summary": "The summary text here...",
          "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
          "sentiment": "positive/negative/mixed/neutral",
          "keywords": ["keyword1", "keyword2", ...]
}
        Story:
        ${content.substring(0, 6000)}
      `;
      const analysisResult = await generateContentCustom(prompt, {
        model,
        temperature: 0.3,
        maxTokens: 1000,
        apiKey,
      });
      // Parse the JSON response
      const jsonMatch = analysisResult.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response as JSON');
      }
      const analysis = JSON.parse(jsonMatch[0]);
      updatedSummary = {
        ...updatedSummary,
        originalContent: content.substring(0, 1000),
        summary: analysis.summary,
        keyPoints: analysis.keyPoints,
        sentiment: analysis.sentiment,
        keywords: analysis.keywords,
        model,
      };
    } else if (
      body.summary ||
      body.keyPoints ||
      body.sentiment ||
      body.keywords
    ) {
      // If no regeneration but manual updates are provided
      if (body.summary) updatedSummary.summary = body.summary;
      if (body.keyPoints) updatedSummary.keyPoints = body.keyPoints;
      if (body.sentiment) updatedSummary.sentiment = body.sentiment;
      if (body.keywords) updatedSummary.keywords = body.keywords;
    }
    // Update in database
    await updateOne(
      COLLECTION_NAME,
      { _id: createObjectId(id) },
      updatedSummary
    );
    return NextResponse.json({
      success: true,
      message: 'Summary updated successfully',
      summary: {
        ...existingSummary,
        ...updatedSummary,
      },
    });
  } catch (error: any) {
    console.error('Error updating story summary:', error);
    return NextResponse.json(
      {
        error: error.message || 'An error occurred while updating the summary',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Summary ID is required' },
        { status: 400 }
      );
    }
    const result = await deleteOne(COLLECTION_NAME, {
      _id: createObjectId(id),
    });
    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          error: 'Summary not found or already deleted',
        },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Summary deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting story summary:', error);
    return NextResponse.json(
      {
        error: error.message || 'An error occurred while deleting the summary',
      },
      { status: 500 }
    );
  }
}
