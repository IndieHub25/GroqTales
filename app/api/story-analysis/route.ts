import { NextRequest, NextResponse } from 'next/server';

import { analyzeStoryContentCustom, GROQ_MODELS } from '@/lib/groq-service';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      content,
      title,
      genre,
      analysisType = 'standard',
      model = GROQ_MODELS.STORY_ANALYSIS,
      apiKey,
    } = body;
    if (!content) {
      return NextResponse.json(
        { error: 'Story content is required' },
        { status: 400 }
      );
    }
    let prompt = '';
    let systemPrompt = '';
    switch (analysisType.toLowerCase()) {
      case 'standard':
        systemPrompt =
          'You are a literary analyst with expertise in story structure, character development, and thematic analysis.';
        prompt = `
          Analyze the following ${genre || 'story'} titled "${
            title || 'Untitled Story'
          }" and provide a detailed analysis, including:
          1. Plot Structure: Identify the introduction, rising action, climax, falling action, and resolution
          2. Character Analysis: Analyze the main characters, their motivations, and development
          3. Theme Analysis: Identify and explain major themes and motifs
          4. Stylistic Elements: Comment on the writing style, tone, and use of literary devices
          5. Strengths: Highlight the strongest aspects of the story
          6. Areas for Improvement: Suggest potential improvements or areas for development
          Format your analysis as a JSON object with these six sections clearly delineated.
          Story:
          ${content.substring(0, 8000)}
        `;
        break;
      case 'critique':
        systemPrompt =
          'You are an experienced literary critic with a keen eye for both strengths and weaknesses in creative writing.';
        prompt = `
          Provide a constructive critique of the following ${
            genre || 'story'
          } titled "${title || 'Untitled Story'}", covering:
          1. Overall Impression: Your general assessment of the story's quality and impact
          2. Strongest Elements: What works well in this story (be specific)
          3. Areas for Improvement: Identify weaknesses or opportunities to strengthen the story
          4. Writing Mechanics: Comment on grammar, syntax, pacing, dialog, etc.
          5. Reader Engagement: Assess how effectively the story might engage readers
          6. Specific Recommendations: Provide 3-5 actionable suggestions for improving the story
          Format your critique as a JSON object with these sections, maintaining a balanced, constructive tone.
          Story:
          ${content.substring(0, 8000)}
        `;
        break;
      case 'audience':
        systemPrompt =
          'You are a market research specialist in the publishing industry with expertise in audience demographics and reader preferences.';
        prompt = `
          Analyze the following ${genre || 'story'} titled "${
            title || 'Untitled Story'
          }" and provide an audience analysis:
          1. Target Demographics: Age range, interests, and reading preferences of the likely target audience
          2. Market Positioning: How this story fits within current market trends
          3. Reader Appeal: Specific elements that would appeal to different reader groups
          4. Comparisons: Similar published works that share audience overlap
          5. Marketing Angles: Potential selling points or marketing approaches
          6. Audience Expansion: Suggestions for broadening reader appeal
          Format your analysis as a JSON object with these sections.
          Story:
          ${content.substring(0, 8000)}
        `;
        break;
      case 'development':
        systemPrompt =
          'You are a developmental editor who helps writers refine and improve their work.';
        prompt = `
          Provide developmental editing feedback for the following ${
            genre || 'story'
          } titled "${title || 'Untitled Story'}":
          1. Story Structure: Assessment and recommendations for plot structure and pacing
          2. Character Development: Analysis of character arcs, consistency, and depth
          3. Setting & Worldbuilding: Evaluation of the story's setting and atmosphere
          4. Dialogue & Voice: Analysis of dialogue authenticity and narrative voice
          5. Tension & Conflict: Assessment of how well conflict is established and resolved
          6. Next Steps: Prioritized recommendations for the writer's revision process
          Format your feedback as a JSON object with these sections, providing specific examples from the text.
          Story:
          ${content.substring(0, 8000)}
        `;
        break;
      default:
        return NextResponse.json(
          {
            error:
              'Invalid analysis type. Supported types: standard, critique, audience, development',
          },
          { status: 400 }
        );
    }
    const analysisResult = await analyzeStoryContentCustom(content, {
      analysisType,
      model,
      systemPrompt,
      customPrompt: prompt,
      temperature: 0.2,
      maxTokens: 2000,
      apiKey,
    });
    // Parse the JSON response
    const jsonMatch = analysisResult.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // If we can't parse JSON, return the raw text
      return NextResponse.json({
        success: true,
        analysis: { rawText: analysisResult },
        format: 'text',
      });
    }
    try {
      const analysis = JSON.parse(jsonMatch[0]);
      return NextResponse.json({
        success: true,
        analysis,
        format: 'json',
        analysisType,
      });
    } catch (parseError) {
      // If JSON parsing fails, return the raw text
      return NextResponse.json({
        success: true,
        analysis: { rawText: analysisResult },
        format: 'text',
        analysisType,
      });
    }
  } catch (error: any) {
    console.error('Story analysis error:', error);
    return NextResponse.json(
      {
        error:
          error.message || 'An error occurred while processing your request',
      },
      { status: 500 }
    );
  }
}
