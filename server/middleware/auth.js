/**
 * Authentication and Authorization Middleware
 * Handles user authentication and permission checks for comics
 */

const Comic = require('../models/Comic');

/**
 * Placeholder authentication middleware
 * In production, replace with your actual auth implementation (JWT, sessions, etc.)
 */
const authenticate = (req, res, next) => {
  try {
    // Example: Extract user from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No authorization header provided',
      });
    }

    // Parse token (example for JWT: Bearer <token>)
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    // TODO: Verify token and extract user ID
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = { id: decoded.userId, ... };

    // Placeholder: Extract user ID from query or body for development
    req.user = {
      id: req.query.userId || req.body.userId,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: error.message,
    });
  }
};

/**
 * Check if user is the creator of the comic
 */
const isComicCreator = async (req, res, next) => {
  try {
    const { id, comicId } = req.params;
    const targetId = id || comicId;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const comic = await Comic.findById(targetId);

    if (!comic) {
      return res.status(404).json({
        success: false,
        error: 'Comic not found',
      });
    }

    if (comic.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only the creator can perform this action.',
      });
    }

    req.comic = comic;
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authorization check failed',
      message: error.message,
    });
  }
};

/**
 * Check if user is the creator or a collaborator with edit rights
 */
const canEditComic = async (req, res, next) => {
  try {
    const { id, comicId } = req.params;
    const targetId = id || comicId;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const comic = await Comic.findById(targetId);

    if (!comic) {
      return res.status(404).json({
        success: false,
        error: 'Comic not found',
      });
    }

    // Check if user is creator
    const isCreator = comic.creator.toString() === req.user.id;

    // Check if user is collaborator with edit rights
    const collaborator = comic.collaborators.find(
      (c) => c.userId.toString() === req.user.id
    );
    const hasEditRights =
      collaborator &&
      ['co-author', 'editor', 'artist'].includes(collaborator.role);

    if (!isCreator && !hasEditRights) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You do not have edit permissions.',
      });
    }

    req.comic = comic;
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authorization check failed',
      message: error.message,
    });
  }
};

/**
 * Check if user can view the comic based on visibility settings
 */
const canViewComic = async (req, res, next) => {
  try {
    const { slug, id, comicId } = req.params;
    const targetId = id || comicId;

    let comic;
    if (slug) {
      comic = await Comic.findOne({ slug });
    } else {
      comic = await Comic.findById(targetId);
    }

    if (!comic) {
      return res.status(404).json({
        success: false,
        error: 'Comic not found',
      });
    }

    // Public comics can be viewed by anyone
    if (comic.visibility === 'public' && comic.status === 'published') {
      req.comic = comic;
      return next();
    }

    // Unlisted comics can be viewed by anyone with the link
    if (comic.visibility === 'unlisted') {
      req.comic = comic;
      return next();
    }

    // Private comics require authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required to view this comic',
      });
    }

    // Check if user is creator or collaborator
    const isCreator = comic.creator.toString() === req.user.id;
    const isCollaborator = comic.collaborators.some(
      (c) => c.userId.toString() === req.user.id
    );

    if (!isCreator && !isCollaborator) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. This comic is private.',
      });
    }

    req.comic = comic;
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authorization check failed',
      message: error.message,
    });
  }
};

/**
 * Optional authentication - attach user if token is present, but don't require it
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(' ')[1];

      if (token) {
        // TODO: Verify token and extract user ID
        // const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // req.user = { id: decoded.userId, ... };

        // Placeholder for development
        req.user = {
          id: req.query.userId || req.body.userId,
        };
      }
    }

    next();
  } catch (error) {
    // Don't fail if optional auth fails
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth,
  isComicCreator,
  canEditComic,
  canViewComic,
};
