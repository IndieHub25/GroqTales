/**
 * Input validation utilities for comics API
 */

const validateComicInput = (data) => {
  const errors = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (data.title.length > 200) {
    errors.push('Title cannot exceed 200 characters');
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push('Description is required');
  } else if (data.description.length > 2000) {
    errors.push('Description cannot exceed 2000 characters');
  }

  if (!data.genres || !Array.isArray(data.genres) || data.genres.length === 0) {
    errors.push('At least one genre is required');
  } else if (data.genres.length > 5) {
    errors.push('Maximum 5 genres allowed');
  }

  const validGenres = [
    'fantasy',
    'sci-fi',
    'mystery',
    'adventure',
    'horror',
    'romance',
    'superhero',
    'slice-of-life',
    'comedy',
    'drama',
    'action',
    'thriller',
    'historical',
    'other',
  ];

  const invalidGenres = data.genres?.filter((g) => !validGenres.includes(g));
  if (invalidGenres && invalidGenres.length > 0) {
    errors.push(`Invalid genres: ${invalidGenres.join(', ')}`);
  }

  if (data.tags) {
    if (!Array.isArray(data.tags)) {
      errors.push('Tags must be an array');
    } else if (data.tags.length > 20) {
      errors.push('Maximum 20 tags allowed');
    }
  }

  if (
    data.visibility &&
    !['private', 'unlisted', 'public'].includes(data.visibility)
  ) {
    errors.push('Visibility must be one of: private, unlisted, public');
  }

  if (
    data.readingDirection &&
    !['ltr', 'rtl', 'ttb'].includes(data.readingDirection)
  ) {
    errors.push('Reading direction must be one of: ltr, rtl, ttb');
  }

  if (
    data.ageRating &&
    !['everyone', 'teen', 'mature', 'explicit'].includes(data.ageRating)
  ) {
    errors.push('Age rating must be one of: everyone, teen, mature, explicit');
  }

  if (!data.creator) {
    errors.push('Creator ID is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

const validatePageInput = (data) => {
  const errors = [];

  if (!data.comicId) {
    errors.push('Comic ID is required');
  }

  if (data.pageNumber !== undefined) {
    const num = Number(data.pageNumber);
    if (!Number.isInteger(num) || num < 1) {
      errors.push('Page number must be a positive integer');
    }
  }

  if (!data.altText || data.altText.trim().length === 0) {
    errors.push('Alt text is required for accessibility');
  } else if (data.altText.length > 500) {
    errors.push('Alt text cannot exceed 500 characters');
  }

  if (data.transcript && data.transcript.length > 5000) {
    errors.push('Transcript cannot exceed 5000 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

const sanitizeSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100)
    .replace(/^-|-$/g, '');
};

module.exports = {
  validateComicInput,
  validatePageInput,
  sanitizeSlug,
};
