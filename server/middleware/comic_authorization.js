const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Comic = require('../models/Comic');

/**
 * Check if user is the creator of the comic
 */
const isComicCreator = async (req, res, next) => {
  try {
    const { id, comicId } = req.params;
    const targetId = id || comicId;
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ success: false, error: 'Authentication required' });
    }
    if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid comic id' });
    }
    const comic = await Comic.findById(targetId);
    if (!comic) {
      return res.status(404).json({ success: false, error: 'Comic not found' });
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
      return res
        .status(401)
        .json({ success: false, error: 'Authentication required' });
    }
    if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid comic id' });
    }
    const comic = await Comic.findById(targetId);
    if (!comic) {
      return res.status(404).json({ success: false, error: 'Comic not found' });
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
      if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
        return res
          .status(400)
          .json({ success: false, error: 'Invalid comic id' });
      }
      comic = await Comic.findById(targetId);
    }
    if (!comic) {
      return res.status(404).json({ success: false, error: 'Comic not found' });
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
        if (
          process.env.NODE_ENV === 'development' &&
          req.headers['x-dev-auth'] === 'true'
        ) {
          const devUserId = req.query.userId || req.body.userId;
          if (devUserId) {
            req.user = { id: devUserId };
          }
        } else if (jwt && process.env.JWT_SECRET) {
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
          } catch (err) {
            // Ignore invalid token for optional auth
          }
        }
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  isComicCreator,
  canEditComic,
  canViewComic,
  optionalAuth,
};
