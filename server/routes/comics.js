/**
 * Comics API Routes
 * Handles comic creation, management, and publishing endpoints
 */

const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/auth');
const {
  optionalAuth,
  isComicCreator,
  canEditComic,
  canViewComic,
} = require('../middleware/comic_authorization');
const multer = require('multer');
const Comic = require('../models/Comic');
const ComicPage = require('../models/ComicPage');
const {
  validateComicInput,
  validatePageInput,
  sanitizeSlug,
} = require('../utils/validation');
const {
  processAndUploadPageImage,
  uploadBufferToIPFS,
  getGatewayURL,
} = require('../services/comicAssetService');
const {
  runPreflightChecks,
  publishComic,
  unpublishComic,
} = require('../services/comicPublishService');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'
        )
      );
    }
  },
});

// ============================================================================
// COMIC CRUD OPERATIONS
// ============================================================================

/**
 * GET /api/v1/comics
 * List comics with filters and pagination
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      visibility,
      creator,
      genre,
      tag,
      search,
      sort = '-createdAt',
    } = req.query;

    const query = {};

    // Build query filters
    if (status) query.status = status;
    if (visibility) query.visibility = visibility;
    if (creator) query.creator = creator;
    if (genre) query.genres = genre;
    if (tag) query.tags = tag;

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const comics = await Comic.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort)
      .populate('creator', 'firstName lastName email')
      .lean()
      .exec();

    const count = await Comic.countDocuments(query);

    res.json({
      success: true,
      data: comics,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching comics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comics',
      message: error.message,
    });
  }
});

// ============================================================================
// SEARCH (must be before /:slug to avoid capture)
// ============================================================================

/**
 * GET /api/v1/comics/search/text
 * Search comics by text
 */
router.get('/search/text', async (req, res) => {
  try {
    const { q, genres, tags, creator, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters',
      });
    }

    const query = {
      $text: { $search: q },
      status: 'published',
      visibility: 'public',
    };

    if (genres)
      query.genres = { $in: Array.isArray(genres) ? genres : [genres] };
    if (tags) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (creator) query.creator = creator;

    const comics = await Comic.find(query, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit))
      .populate('creator', 'firstName lastName')
      .lean();

    res.json({
      success: true,
      data: comics,
      count: comics.length,
    });
  } catch (error) {
    console.error('Error searching comics:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/comics/:slug
 * Get a single comic by slug
 */
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;

    const comic = await Comic.findOne({ slug })
      .populate('creator', 'firstName lastName email')
      .populate('collaborators.userId', 'firstName lastName email')
      .lean();

    if (!comic) {
      return res.status(404).json({
        success: false,
        error: 'Comic not found',
      });
    }

    // Visibility checks
    if (comic.visibility === 'private') {
      // Only creator and collaborators can view private comics
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }
      const hasAccess =
        comic.creator._id.toString() === userId ||
        comic.collaborators.some((c) => c.userId._id.toString() === userId);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
        });
      }
    }

    // Increment view count for published comics
    if (comic.status === 'published') {
      await Comic.findByIdAndUpdate(comic._id, { $inc: { views: 1 } });
    }

    res.json({
      success: true,
      data: comic,
    });
  } catch (error) {
    console.error('Error fetching comic:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comic',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/comics
 * Create a new comic (draft)
 */
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      genres,
      tags,
      language,
      visibility,
      readingDirection,
      ageRating,
      creator,
    } = req.body;

    // Validate input
    const validation = validateComicInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors,
      });
    }

    // Generate slug if not provided
    const slug = req.body.slug || sanitizeSlug(title);

    // Check for duplicate slug
    const existingComic = await Comic.findOne({ slug });
    if (existingComic) {
      return res.status(409).json({
        success: false,
        error: 'A comic with this slug already exists',
        slug,
      });
    }

    const comic = await Comic.create({
      title,
      slug,
      description,
      genres: Array.isArray(genres) ? genres : [genres],
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
      language: language || 'en',
      visibility: visibility || 'private',
      readingDirection: readingDirection || 'ltr',
      ageRating: ageRating || 'everyone',
      creator,
      status: 'draft',
    });

    res.status(201).json({
      success: true,
      data: comic,
    });
  } catch (error) {
    console.error('Error creating comic:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create comic',
      message: error.message,
    });
  }
});

/**
 * PATCH /api/v1/comics/:id
 * Update a comic
 */
router.patch('/:id', authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow direct status updates (use publish endpoint)
    delete updates.status;
    delete updates.publishedAt;

    const comic = await Comic.findById(id);
    if (!comic) {
      return res.status(404).json({
        success: false,
        error: 'Comic not found',
      });
    }
    if (comic.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }
    Object.assign(comic, updates);
    await comic.save();
    res.json({
      success: true,
      data: comic,
    });
  } catch (error) {
    console.error('Error updating comic:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update comic',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/v1/comics/:id
 * Delete a comic (only if in draft status)
 */
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const { id } = req.params;

    const comic = await Comic.findById(id);
    if (!comic) {
      return res.status(404).json({
        success: false,
        error: 'Comic not found',
      });
    }
    if (comic.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }
    // Only allow deletion of drafts
    if (comic.status === 'published') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete published comic. Unpublish it first.',
      });
    }

    // Delete all pages associated with the comic
    await ComicPage.deleteMany({ comicId: id });

    // Delete the comic
    await Comic.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Comic deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comic:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete comic',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/comics/:id/cover
 * Upload cover image for comic
 */
router.post(
  '/:id/cover',
  authRequired,
  upload.single('cover'),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
      }

      const comic = await Comic.findById(id);
      if (!comic) {
        return res.status(404).json({
          success: false,
          error: 'Comic not found',
        });
      }
      if (comic.creator.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
        });
      }

      // Upload cover to IPFS
      const cid = await uploadBufferToIPFS(
        req.file.buffer,
        req.file.originalname,
        {
          name: `${comic.slug}_cover`,
          keyvalues: {
            comicId: id,
            type: 'cover',
          },
        }
      );

      comic.coverImage = {
        cid,
        gatewayURL: getGatewayURL(cid),
      };

      await comic.save();

      res.json({
        success: true,
        data: comic.coverImage,
      });
    } catch (error) {
      console.error('Error uploading cover:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload cover',
        message: error.message,
      });
    }
  }
);

// ============================================================================
// COMIC PAGE OPERATIONS
// ============================================================================

/**
 * GET /api/v1/comics/:comicId/pages
 * Get all pages for a comic
 */
router.get('/:comicId/pages', async (req, res) => {
  try {
    const { comicId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const pages = await ComicPage.find({ comicId })
      .sort({ pageNumber: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean()
      .exec();

    const count = await ComicPage.countDocuments({ comicId });

    res.json({
      success: true,
      data: pages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pages',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/comics/:comicId/pages
 * Add a new page to a comic
 */
router.post(
  '/:comicId/pages',
  authRequired,
  upload.single('image'),
  async (req, res) => {
    try {
      const { comicId } = req.params;
      const { pageNumber, altText, transcript, captions, panelDescriptors } =
        req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image uploaded',
        });
      }

      // Validate page input
      const validation = validatePageInput({ ...req.body, comicId });
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors,
        });
      }

      // Check if comic exists
      const comic = await Comic.findById(comicId);
      if (!comic) {
        return res.status(404).json({
          success: false,
          error: 'Comic not found',
        });
      }

      // Process and upload image with variants
      const imageAsset = await processAndUploadPageImage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        { comicId, pageNumber }
      );

      // Atomic pageNumber assignment
      let assignedPageNumber = pageNumber;
      if (!assignedPageNumber) {
        const updatedComic = await Comic.findOneAndUpdate(
          { _id: comicId },
          { $inc: { nextPageNumber: 1 } },
          { new: true }
        );
        assignedPageNumber = updatedComic.nextPageNumber - 1;
      }

      // Safe JSON parsing helper
      function safeJsonParse(str, fallback = []) {
        if (!str) return fallback;
        try {
          return JSON.parse(str);
        } catch {
          return null;
        }
      }
      const parsedCaptions = safeJsonParse(captions, []);
      const parsedPanelDescriptors = safeJsonParse(panelDescriptors, []);
      if (captions && parsedCaptions === null) {
        return res.status(400).json({
          success: false,
          error: 'Invalid JSON in captions field',
        });
      }
      if (panelDescriptors && parsedPanelDescriptors === null) {
        return res.status(400).json({
          success: false,
          error: 'Invalid JSON in panelDescriptors field',
        });
      }

      // Create page
      const page = await ComicPage.create({
        comicId,
        pageNumber: assignedPageNumber,
        imageAsset,
        altText,
        transcript: transcript || '',
        captions: parsedCaptions,
        panelDescriptors: parsedPanelDescriptors,
        isPinned: true,
        pinnedAt: new Date(),
      });

      res.status(201).json({
        success: true,
        data: page,
      });
    } catch (error) {
      console.error('Error adding page:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add page',
        message: error.message,
      });
    }
  }
);

/**
 * PATCH /api/v1/comics/:comicId/pages/:pageId
 * Update a comic page
 */
router.patch('/:comicId/pages/:pageId', authRequired, async (req, res) => {
  try {
    const { comicId, pageId } = req.params;
    const updates = req.body;

    // Don't allow updating the image or CIDs directly
    delete updates.imageAsset;

    const page = await ComicPage.findOneAndUpdate(
      { _id: pageId, comicId },
      updates,
      { new: true, runValidators: true }
    );

    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Page not found',
      });
    }

    res.json({
      success: true,
      data: page,
    });
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update page',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/v1/comics/:comicId/pages/:pageId
 * Delete a comic page
 */
router.delete('/:comicId/pages/:pageId', authRequired, async (req, res) => {
  try {
    const { comicId, pageId } = req.params;

    const page = await ComicPage.findOneAndDelete({ _id: pageId, comicId });

    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Page not found',
      });
    }

    res.json({
      success: true,
      message: 'Page deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete page',
      message: error.message,
    });
  }
});

// ============================================================================
// PUBLISHING WORKFLOW
// ============================================================================

/**
 * POST /api/v1/comics/:id/preflight
 * Run preflight checks before publishing
 */
router.post('/:id/preflight', authRequired, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await runPreflightChecks(id);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error running preflight:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run preflight checks',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/comics/:id/publish
 * Publish a comic
 */
router.post('/:id/publish', authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    const { mintNFT = false, network = 'polygon' } = req.body;

    const result = await publishComic(id, { mintNFT, network });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Publishing failed',
        details: result,
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error publishing comic:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to publish comic',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/comics/:id/unpublish
 * Unpublish a comic (revert to draft)
 */
router.post('/:id/unpublish', authRequired, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await unpublishComic(id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      message: 'Comic unpublished successfully',
    });
  } catch (error) {
    console.error('Error unpublishing comic:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unpublish comic',
      message: error.message,
    });
  }
});

// ============================================================================
// SEARCH (must be before /:slug to avoid capture)
// ============================================================================

/**
 * GET /api/v1/comics/search
 * Search comics by text
 */
router.get('/search/text', async (req, res) => {
  try {
    const { q, genres, tags, creator, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters',
      });
    }

    const query = {
      $text: { $search: q },
      status: 'published',
      visibility: 'public',
    };

    if (genres)
      query.genres = { $in: Array.isArray(genres) ? genres : [genres] };
    if (tags) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (creator) query.creator = creator;

    const comics = await Comic.find(query, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit))
      .populate('creator', 'firstName lastName')
      .lean();

    res.json({
      success: true,
      data: comics,
      count: comics.length,
    });
  } catch (error) {
    console.error('Error searching comics:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message,
    });
  }
});

module.exports = router;
