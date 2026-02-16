import { NextRequest, NextResponse } from 'next/server';

import { find, findOne, createObjectId } from '@/lib/db';
import { generateContentCustom, GROQ_MODELS } from '@/lib/groq-service';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      storyId,
      content,
      keywords,
      genre,
      limit = 5,
      model = GROQ_MODELS.RECOMMENDATIONS,
      apiKey,
    } = body;
    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      );
    }
    if (!content && !keywords && !genre) {
      return NextResponse.json(
        {
          error:
            'At least one of content, keywords, or genre is required for recommendations',
        },
        { status: 400 }
      );
    }
    // First, gather stories from the database (excluding the current story)
    const storyCollection = 'stories';
    const dbStories = await find(storyCollection, {
      _id: { $ne: createObjectId(storyId) },
      isPublished: true,
    });
    // If we have less than 5 stories, just return all available stories
    if (dbStories.length <= limit) {
      return NextResponse.json({
        success: true,
        recommendations: dbStories,
      });
    }
    // If we have many stories, use Groq to find the best matches
    const promptParts = [];
    if (content) {
      promptParts.push(`The story content: "${content.substring(0, 1000)}..."`);
    }
    if (keywords && keywords.length > 0) {
      promptParts.push(`Keywords: ${keywords.join(', ')}`);
    }
    if (genre) {
      promptParts.push(`Genre: ${genre}`);
    }
    // Create a simplified list of available stories to choose from
    const availableStories = dbStories.map((story: any) => ({
      id: story._id.toString(),
      title: story.title,
      summary: story.summary,
      genre: story.genre,
    }));
    const prompt = `
      I need recommendations for stories similar to one with these characteristics:
      ${promptParts.join('\n')}
      Please analyze the available stories and select the top ${limit} most relevant recommendations
      from the following list:
      ${JSON.stringify(availableStories, null, 2)}
      Return your answer as a JSON array containing only the story IDs of the recommended stories,
      in order of relevance:
      ["id1", "id2", "id3", ...]
    `;
    const recommendationResult = await generateContentCustom(prompt, {
      model,
      temperature: 0.3,
      maxTokens: 1000,
      apiKey,
    });
    // Parse the JSON response
    const jsonMatch = recommendationResult.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response as JSON');
    }
    const recommendedIds = JSON.parse(jsonMatch[0]);
    // If recommendations couldn't be generated properly, return random stories
    if (!Array.isArray(recommendedIds) || recommendedIds.length === 0) {
      // Shuffle array and take first `limit` items
      const shuffled = [...dbStories].sort(() => 0.5 - Math.random());
      return NextResponse.json({
        success: true,
        recommendations: shuffled.slice(0, limit),
        method: 'random',
      });
    }
    // Get the full details of recommended stories from database
    const recommendedStories: any[] = [];
    for (const id of recommendedIds.slice(0, limit)) {
      try {
        const story = dbStories.find((s: any) => s._id.toString() === id);
        if (story) {
          recommendedStories.push(story);
        }
      } catch (error) {
        console.error(`Error finding story with ID ${id}:`, error);
      }
    }
    // If we couldn't get enough recommendations, add some random ones
    if (recommendedStories.length < limit) {
      const remainingStories = dbStories.filter(
        (story: any) =>
          !recommendedStories.some(
            (rec: any) => rec._id.toString() === story._id.toString()
          )
      );
      const shuffled = [...remainingStories].sort(() => 0.5 - Math.random());
      recommendedStories.push(
        ...shuffled.slice(0, limit - recommendedStories.length)
      );
    }
    return NextResponse.json({
      success: true,
      recommendations: recommendedStories,
      method: 'ai',
    });
  } catch (error: any) {
    console.error('Story recommendations error:', error);
    return NextResponse.json(
      {
        error:
          error.message || 'An error occurred while processing your request',
      },
      { status: 500 }
    );
  }
}
