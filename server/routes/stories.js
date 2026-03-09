/**
 * Stories API Routes — Supabase
 * Handles story CRUD and AI generation via Supabase PostgreSQL
 */

const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { authRequired } = require('../middleware/auth');
const groqService = require('../services/groqService');
const { normalizeParam } = require('../utils/paramNormalizer');
const multer = require('multer');

// Configure multer for file uploads
const fileUploadOptions = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

/**
 * @swagger
 * /api/v1/stories:
 *   get:
 *     tags:
 *       - Stories
 *     summary: Get stories list
 *     description: Returns a paginated list of stories with optional filtering by genre and author.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of stories per page.
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter stories by genre.
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter stories by author UUID.
 *     responses:
 *       200:
 *         description: Stories retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: Internal server error.
 */
router.get('/', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { genre, author } = req.query;

    let query = supabaseAdmin.from('stories').select('*, profiles!author_id(username, avatar_url, display_name)', { count: 'exact' });

    if (genre) query = query.eq('genre', genre);
    if (author) query = query.eq('author_id', author);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: stories, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({
      data: stories || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/stories/create:
 *   post:
 *     tags:
 *       - Stories
 *     summary: Create a new story
 *     description: Creates a new story in Supabase and returns the created story object.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - genre
 *             properties:
 *               title:
 *                 type: string
 *                 example: "The Last Algorithm"
 *               content:
 *                 type: string
 *                 example: "Once upon a time in a digital world..."
 *               genre:
 *                 type: string
 *                 enum: [fantasy, sci-fi, mystery, adventure, horror, romance, other]
 *                 example: sci-fi
 *     responses:
 *       201:
 *         description: Story created successfully.
 *       400:
 *         description: Missing required fields.
 *       500:
 *         description: Internal server error.
 */
router.post('/create', authRequired, async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    const { title, content, genre, description, coverImage } = req.body;

    if (!title || !content || !genre || !description) {
      return res.status(400).json({ error: 'title, content, genre, and description are required' });
    }

    // Get author's display name
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('username, display_name')
      .eq('id', req.user.id)
      .single();

    const { data: story, error } = await supabaseAdmin
      .from('stories')
      .insert({
        title,
        description,
        cover_image: coverImage || null,
        content,
        genre: genre.toLowerCase(),
        author_id: req.user.id,
        author_name: profile?.display_name || profile?.username || 'Anonymous',
      })
      .select()
      .single();

    if (error) {
      console.error('Story creation error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(story);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/stories/upload:
 *   post:
 *     tags:
 *       - Stories
 *     summary: Upload a manual user story
 *     description: Creates a new user-uploaded story with rich metadata.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               content:
 *                 type: string
 *               genre:
 *                 type: string
 *               twists:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               coverImageUrl:
 *                 type: string
 *               imageUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Story uploaded successfully.
 */
// POST /api/v1/stories/upload - Upload user story (Live Writer)
router.post('/upload', authRequired, fileUploadOptions.fields([{ name: 'coverImage', maxCount: 1 }]), async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    const { title, description, content, genre, twists, tags, imageUrls, formatType, characterSetting } = req.body;
    const coverImage = req.files?.coverImage?.[0];

    // Validate minimum requirements
    if (!title || !content || !genre || !coverImage) {
      return res.status(400).json({ error: 'Title, content, genre, and Cover Image are required.' });
    }

    let validTags = [];
    try {
      validTags = tags ? JSON.parse(tags) : [];
    } catch (e) {
      validTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : [];
    }

    const validTwists = Array.isArray(twists) ? twists : [];
    const validImageUrls = Array.isArray(imageUrls) ? imageUrls : [];

    // Upload Cover Image to Supabase Storage
    const coverExt = coverImage.originalname.split('.').pop() || 'png';
    const coverName = `${req.user.id}/cover_${Date.now()}_${Math.random().toString(36).substring(7)}.${coverExt}`;

    // Upload to 'covers' bucket
    const { error: coverUploadError } = await supabaseAdmin
      .storage
      .from('covers')
      .upload(coverName, coverImage.buffer, {
        contentType: coverImage.mimetype,
        upsert: false
      });

    if (coverUploadError) {
      console.warn("Cover image upload warning:", coverUploadError);
    }

    const { data: publicCoverUrlData } = supabaseAdmin.storage.from('covers').getPublicUrl(coverName);
    const coverUrl = coverUploadError ? null : publicCoverUrlData.publicUrl;

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('username, display_name')
      .eq('id', req.user.id)
      .single();

    const { data: story, error: dbError } = await supabaseAdmin
      .from('stories')
      .insert({
        title: title.slice(0, 100),
        description: characterSetting ? `${description ? description.slice(0, 500) : ''}\n\nCharacter Focus: ${characterSetting}` : description ? description.slice(0, 500) : '',
        content,
        genre: genre.toLowerCase(),
        tags: validTags,
        format_type: formatType || 'Storybook',
        cover_image: coverUrl,
        source: 'uploaded',
        author_id: req.user.id,
        author_name: profile?.display_name || profile?.username || 'Anonymous',
        is_verified: true,
        is_minted: false
      })
      .select()
      .single();

    if (dbError) {
      return res.status(500).json({ error: dbError.message });
    }

    return res.status(201).json({ success: true, data: story });
  } catch (error) {
    console.error('Story upload error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/stories/search/{id}:
 *   get:
 *     tags:
 *       - Stories
 *     summary: Get story by ID
 *     description: Returns a single story by its UUID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the story.
 *     responses:
 *       200:
 *         description: Story retrieved successfully.
 *       404:
 *         description: Story not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/search/:id', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    const { data: story, error } = await supabaseAdmin
      .from('stories')
      .select('*, profiles!author_id(username, avatar_url, display_name)')
      .eq('id', req.params.id)
      .single();

    if (error || !story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Increment view count
    await supabaseAdmin
      .from('stories')
      .update({ views: (story.views || 0) + 1 })
      .eq('id', req.params.id);

    return res.json(story);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/stories/generate:
 *   post:
 *     tags:
 *       - Stories
 *     summary: Generate story with AI
 *     description: Generates a story using AI based on the given prompt (placeholder).
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *               genre:
 *                 type: string
 *               length:
 *                 type: string
 *               style:
 *                 type: string
 *     responses:
 *       200:
 *         description: Story generated successfully.
 *       500:
 *         description: Internal server error.
 */
router.post('/generate', authRequired, async (req, res) => {
  try {
    const { prompt, genre, length, style, theme, characters, setting, formatType } = req.body;

    if (!prompt && !theme) {
      return res.status(400).json({ error: 'prompt or theme is required' });
    }

    // Normalize all string parameters to prevent type confusion
    const normalizedPrompt = normalizeParam(prompt, 'prompt');
    const normalizedGenre = normalizeParam(genre, 'genre');
    const normalizedLength = normalizeParam(length, 'length');
    const normalizedStyle = normalizeParam(style, 'style');
    const normalizedTheme = normalizeParam(theme, 'theme');
    const normalizedCharacters = normalizeParam(characters, 'characters');
    const normalizedSetting = normalizeParam(setting, 'setting');
    const normalizedFormatType = normalizeParam(formatType, 'formatType');

    const result = await groqService.generate({
      prompt: normalizedPrompt,
      genre: normalizedGenre,
      theme: normalizedTheme,
      length: normalizedLength || 'medium',
      tone: normalizedStyle,
      characters: normalizedCharacters,
      setting: normalizedSetting,
      formatType: normalizedFormatType || 'story',
    });

    const generatedStory = {
      id: require('crypto').randomUUID(),
      title: `AI Generated ${((normalizedFormatType || 'Story').charAt(0).toUpperCase() + (normalizedFormatType || 'story').slice(1))}`,
      content: result.content,
      genre: normalizedGenre,
      metadata: {
        prompt: normalizedPrompt,
        length: normalizedLength,
        style: normalizedStyle,
        model: result.model,
        tokensUsed: result.tokensUsed,
        generatedAt: new Date().toISOString(),
      },
    };

    return res.json(generatedStory);
  } catch (error) {
    console.error('Story generation error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/stories/{id}/analyze:
 *   post:
 *     tags:
 *       - Stories
 *     summary: Analyze story content
 *     description: Analyzes a story and returns sentiment, themes, and readability (placeholder).
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Analysis completed.
 *       500:
 *         description: Internal server error.
 */
router.post('/:id/analyze', authRequired, async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch story content from database
    const { data: story, error: fetchError } = await supabaseAdmin
      .from('stories')
      .select('content, title, genre')
      .eq('id', id)
      .single();

    if (fetchError || !story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const result = await groqService.analyze({ content: story.content });

    return res.json({
      storyId: id,
      ...result.content,
      tokensUsed: result.tokensUsed,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Story analysis error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/stories/:id/moderate - Moderate a story (admin only)
router.patch('/:id/moderate', authRequired, async (req, res) => {
  try {
    // Check if user is admin
    const user = await require('../models/User').findById(req.user.id).lean();
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status, notes } = req.body;
    // Coerce status to string and validate against an allowlist to prevent NoSQL injection
    const sanitizedStatus = typeof status === 'string' ? status : String(status);
    if (!['approved', 'rejected'].includes(sanitizedStatus)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    // Coerce notes to string to prevent NoSQL injection via object payloads
    const sanitizedNotes = typeof notes === 'string' ? notes.slice(0, 2000) : '';

    const story = await Story.findByIdAndUpdate(
      req.params.id,
      {
        moderationStatus: sanitizedStatus,
        moderatorId: req.user.id,
        moderationNotes: sanitizedNotes,
      },
      { new: true }
    ).lean();

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    return res.json({ success: true, data: story });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

let pdfParse;
let mammoth;
try {
  pdfParse = require('pdf-parse');
  mammoth = require('mammoth');
} catch (e) {
  console.warn("pdf-parse or mammoth not installed locally.");
}

/**
 * @swagger
 * /api/v1/stories/upload-file:
 *   post:
 *     tags:
 *       - Stories
 *     summary: Upload a large file (PDF/DOCX/TXT/MD) to story pipeline
 *     description: Parses the file, extracts text, calls Groq AI for synopsis, and stores in database.
 *     security:
 *       - BearerAuth: []
 */
router.post('/upload-file', authRequired, fileUploadOptions.fields([{ name: 'file', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    const { title, genre, formatType, tags, description, characterSetting } = req.body;
    const file = req.files?.file?.[0];
    const coverImage = req.files?.coverImage?.[0];

    if (!file) {
      return res.status(400).json({ error: 'File is required (up to 50MB).' });
    }
    if (!coverImage) {
      return res.status(400).json({ error: 'Cover Image is required.' });
    }
    if (!title || !genre || !formatType) {
      return res.status(400).json({ error: 'Title, genre, and formatType are required.' });
    }

    let validTags = [];
    try {
      validTags = tags ? JSON.parse(tags) : [];
    } catch (e) {
      validTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : [];
    }

    // 1. Upload Document File to Supabase Storage
    const fileExt = file.originalname.split('.').pop() || 'tmp';
    const fileName = `${req.user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Ensure 'documents' bucket exists or just upload. 
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('documents')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.warn("Storage upload warning:", uploadError);
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from('documents').getPublicUrl(fileName);
    const fileUrl = uploadError ? null : publicUrlData.publicUrl;

    // 1b. Upload Cover Image to Supabase Storage
    const coverExt = coverImage.originalname.split('.').pop() || 'png';
    const coverName = `${req.user.id}/cover_${Date.now()}_${Math.random().toString(36).substring(7)}.${coverExt}`;

    // Upload to 'covers' bucket (we'll ensure it exists or use 'stories' / 'documents')
    const { error: coverUploadError } = await supabaseAdmin
      .storage
      .from('covers')  // Using covers bucket
      .upload(coverName, coverImage.buffer, {
        contentType: coverImage.mimetype,
        upsert: false
      });

    if (coverUploadError) {
      console.warn("Cover image upload warning:", coverUploadError);
    }

    const { data: publicCoverUrlData } = supabaseAdmin.storage.from('covers').getPublicUrl(coverName);
    const coverUrl = coverUploadError ? null : publicCoverUrlData.publicUrl;

    // 2. Extract Text
    let extractedText = '';
    try {
      if (file.mimetype === 'application/pdf' || fileExt.toLowerCase() === 'pdf') {
        if (pdfParse) {
          const pdfData = await pdfParse(file.buffer);
          extractedText = pdfData.text;
        } else {
          extractedText = 'PDF parsing lib missing.';
        }
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileExt.toLowerCase() === 'docx') {
        if (mammoth) {
          const docxData = await mammoth.extractRawText({ buffer: file.buffer });
          extractedText = docxData.value;
        } else {
          extractedText = 'DOCX parsing lib missing.';
        }
      } else if (file.mimetype === 'text/plain' || file.mimetype === 'text/markdown' || fileExt.toLowerCase() === 'txt' || fileExt.toLowerCase() === 'md') {
        extractedText = file.buffer.toString('utf8');
      } else {
        return res.status(400).json({ error: 'Unsupported file type. Please upload PDF, DOCX, TXT, or MD.' });
      }
    } catch (extractErr) {
      console.error('Extraction error:', extractErr);
      extractedText = 'Could not extract text from the file.';
    }

    const previewText = extractedText.substring(0, 1500);

    // 3. Generate Synopsis via Groq AI
    let synopsis = `An intriguing ${formatType} exploring themes of ${genre}. Based on the provided file, this story unravels unique concepts and interesting character dynamics.`;
    if (previewText.length > 50) {
      if (process.env.GROQ_API_KEY) {
        try {
          const synopsisResult = await groqService.generateSynopsis({
            content: previewText,
            genre,
            formatType,
          });
          synopsis = synopsisResult.content;
        } catch (groqErr) {
          console.error('Groq AI Synopsis Error:', groqErr);
          synopsis = `An engaging ${formatType} set in the ${genre} genre. The opening reveals a captivating narrative starting with: "${previewText.substring(0, 100).replace(/\n/g, ' ')}...".`;
        }
      } else {
        synopsis = `An engaging ${formatType} set in the ${genre} genre. The opening reveals a captivating narrative starting with: "${previewText.substring(0, 100).replace(/\n/g, ' ')}...".`;
      }
    }

    // 4. Save to Database
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('username, display_name')
      .eq('id', req.user.id)
      .single();

    const { data: story, error: dbError } = await supabaseAdmin
      .from('stories')
      .insert({
        title: title.slice(0, 100),
        description: characterSetting ? `${synopsis}\n\nCharacter Focus: ${characterSetting}` : synopsis,
        content: title + ' - ' + synopsis + (characterSetting ? `\n\nCharacter Focus: ${characterSetting}` : ''),
        genre: genre.toLowerCase(),
        format_type: formatType,
        tags: validTags,
        file_url: fileUrl,
        cover_image: coverUrl,
        is_verified: true,
        author_id: req.user.id,
        author_name: profile?.display_name || profile?.username || 'Anonymous',
        is_minted: false
      })
      .select()
      .single();

    if (dbError) {
      return res.status(500).json({ error: dbError.message });
    }

    return res.status(201).json({ success: true, data: story });
  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({ error: error.message });
  }
});


// ─── Cover Image Upload ────────────────────────────────────────────────────
/**
 * POST /api/v1/stories/upload-cover
 * Upload a cover image to Supabase Storage and return the public URL.
 */
router.post('/upload-cover', authRequired, fileUploadOptions.single('coverImage'), async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'coverImage file is required' });
    }

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. PNG, JPG, WEBP only.' });
    }
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large. Max 5MB.' });
    }

    const ext = file.originalname.split('.').pop() || 'jpg';
    const coverName = `${req.user.id}/cover_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

    const { error: uploadError } = await supabaseAdmin
      .storage
      .from('covers')
      .upload(coverName, file.buffer, { contentType: file.mimetype, upsert: false });

    if (uploadError) {
      console.error('Cover upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload cover image' });
    }

    const { data: urlData } = supabaseAdmin.storage.from('covers').getPublicUrl(coverName);
    return res.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error('Upload cover error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// ─── Publish VedaScript Story ─────────────────────────────────────────────
/**
 * POST /api/v1/stories/publish-vedascript
 * Publishes a VedaScript-generated story. Accepts chapters, genres, tags, parameters, and optional cover URL.
 */
router.post('/publish-vedascript', authRequired, async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    const {
      draftKey,
      title,
      genres,
      chapters,
      parameters,
      selectedParameters,
      tags,
      coverImageUrl,
      compiledContent,
    } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'title is required' });
    }
    if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
      return res.status(400).json({ error: 'chapters array is required' });
    }
    const hasContent = chapters.some(c => c.content && c.content.trim());
    if (!hasContent) {
      return res.status(400).json({ error: 'At least one chapter must have content' });
    }

    // Build compiled content if not provided
    const content = compiledContent || chapters
      .sort((a, b) => (a.index || 0) - (b.index || 0))
      .map(c => `## ${c.title || 'Chapter'}\n\n${c.content || ''}`)
      .join('\n\n---\n\n');

    // Get author profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('username, display_name')
      .eq('id', req.user.id)
      .single();

    const primaryGenre = Array.isArray(genres) && genres.length > 0 ? genres[0].toLowerCase() : 'fantasy';
    const validTags = Array.isArray(tags) ? tags.filter(t => typeof t === 'string' && t.trim()).map(t => t.trim().toLowerCase()) : [];

    const { data: story, error } = await supabaseAdmin
      .from('stories')
      .insert({
        title: title.trim().slice(0, 150),
        description: `A VedaScript-generated story across ${chapters.length} chapter${chapters.length !== 1 ? 's' : ''}.`,
        content,
        genre: primaryGenre,
        genres: Array.isArray(genres) ? genres : [primaryGenre],
        tags: validTags,
        chapters: chapters,
        parameters: parameters || {},
        cover_image: coverImageUrl || null,
        source: 'vedascript',
        status: 'published',
        author_id: req.user.id,
        author_name: profile?.display_name || profile?.username || 'Anonymous',
        is_verified: true,
        is_minted: false,
      })
      .select()
      .single();

    if (error) {
      console.error('publish-vedascript DB error:', error);
      // If genres/chapters/parameters columns don't exist, try minimal insert
      if (error.message?.includes('column') || error.code === '42703') {
        const { data: minimalStory, error: minError } = await supabaseAdmin
          .from('stories')
          .insert({
            title: title.trim().slice(0, 150),
            description: `A VedaScript-generated story across ${chapters.length} chapter${chapters.length !== 1 ? 's' : ''}.`,
            content,
            genre: primaryGenre,
            tags: validTags,
            cover_image: coverImageUrl || null,
            source: 'vedascript',
            author_id: req.user.id,
            author_name: profile?.display_name || profile?.username || 'Anonymous',
            is_verified: true,
            is_minted: false,
          })
          .select()
          .single();

        if (minError) {
          return res.status(500).json({ error: minError.message });
        }
        return res.status(201).json({ success: true, ...minimalStory, id: minimalStory.id, data: minimalStory });
      }
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ success: true, ...story, id: story.id, data: story });
  } catch (error) {
    console.error('publish-vedascript error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// ─── Get My Stories ───────────────────────────────────────────────────────
/**
 * GET /api/v1/stories/mine
 * Returns all stories for the authenticated user.
 */
router.get('/mine', authRequired, async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    const { limit = 50, offset = 0, status } = req.query;

    let query = supabaseAdmin
      .from('stories')
      .select('*')
      .eq('author_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status && ['draft', 'published'].includes(String(status))) {
      query = query.eq('status', String(status));
    }

    const { data: stories, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({
      success: true,
      data: stories || [],
      count: count || (stories || []).length,
    });
  } catch (error) {
    console.error('get-mine error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/stories/:id — alias for /search/:id for BFF consistency
router.get('/:id', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    const { data: story, error } = await supabaseAdmin
      .from('stories')
      .select('*, profiles!author_id(username, avatar_url, display_name)')
      .eq('id', req.params.id)
      .single();

    if (error || !story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Increment view count
    await supabaseAdmin
      .from('stories')
      .update({ views: (story.views || 0) + 1 })
      .eq('id', req.params.id);

    return res.json(story);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
