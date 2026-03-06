/**
 * GroqTales Background Worker
 *
 * Handles background data pipeline tasks:
 * 1. Story Analytics — trending computation, genre distribution
 * 2. Content Quality — validates stories meet quality thresholds
 * 3. Usage Metrics — tracks Groq API usage for cost monitoring
 * 4. Data Cleanup — archives old drafts, prunes orphaned records
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

let supabaseAdmin;
try {
  const supabaseConfig = require('./config/supabase');
  supabaseAdmin = supabaseConfig.supabaseAdmin;
} catch {
  console.warn(
    '[Worker] Supabase config not available — running in limited mode'
  );
}

const app = express();
const PORT = process.env.PORT || 3003;

// CORS configuration — allow multiple origins
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'https://groqtales-backend-api.onrender.com',
  'https://groqtales.vercel.app',
  'https://groqtales-git-main-indie-hub25s-projects.vercel.app',
  'https://www.groqtales.xyz',
  'https://groqtales.xyz',
  'https://groqtales.pages.dev',
  'https://groqtales.netlify.app',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Swagger UI, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Check if origin matches any allowed origin
      const isAllowed = allowedOrigins.some((allowed) => {
        try {
          const originUrl = new URL(origin);
          const originHostname = originUrl.hostname;

          try {
            const allowedUrl = new URL(allowed);
            const allowedHost = allowedUrl.hostname;

            // Exact hostname match
            if (originHostname === allowedHost) return true;
            // Subdomain match (e.g., preview.groqtales.xyz matches *.groqtales.xyz)
            if (originHostname.endsWith('.' + allowedHost)) return true;
          } catch {
            // allowed is not a valid URL, skip
          }

          // Vercel preview: allow *.vercel.app
          if (
            originHostname === 'vercel.app' ||
            originHostname.endsWith('.vercel.app')
          )
            return true;
          // Cloudflare Pages preview: allow *.pages.dev
          if (
            originHostname === 'pages.dev' ||
            originHostname.endsWith('.pages.dev')
          )
            return true;

          return false;
        } catch {
          // Invalid origin URL, reject
          return false;
        }
      });

      if (isAllowed) {
        return callback(null, true);
      }

      console.warn(`[CORS] Blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-API-Key',
      'X-Request-ID',
    ],
  })
);

app.use(express.json());

// ---------------------------------------------------------------------------
// In-memory metrics store
// ---------------------------------------------------------------------------
const metrics = {
  groqRequests: 0,
  groqTokensUsed: 0,
  groqErrors: 0,
  storiesProcessed: 0,
  lastRun: null,
  trending: [],
  genreDistribution: {},
};

let isProcessing = false;

// ---------------------------------------------------------------------------
// Pipeline: Story Analytics
// ---------------------------------------------------------------------------
async function computeStoryAnalytics() {
  if (!supabaseAdmin) {
    console.log('[Analytics] Supabase not configured, skipping');
    return;
  }

  try {
    // Compute trending stories (most views in last 7 days)
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    const { data: trending, error: trendingErr } = await supabaseAdmin
      .from('stories')
      .select('id, title, genre, views, created_at')
      .gte('created_at', sevenDaysAgo)
      .order('views', { ascending: false })
      .limit(20);

    if (!trendingErr && trending) {
      metrics.trending = trending.map((s) => ({
        id: s.id,
        title: s.title,
        views: s.views,
      }));
    }

    // Compute genre distribution
    const { data: allStories, error: genreErr } = await supabaseAdmin
      .from('stories')
      .select('genre');

    if (!genreErr && allStories) {
      const distribution = {};
      for (const story of allStories) {
        const genre = (story.genre || 'unknown').toLowerCase();
        distribution[genre] = (distribution[genre] || 0) + 1;
      }
      metrics.genreDistribution = distribution;
    }

    console.log(
      `[Analytics] Computed: ${metrics.trending.length} trending, ${Object.keys(metrics.genreDistribution).length} genres`
    );
  } catch (err) {
    console.error('[Analytics] Error:', err.message);
  }
}

// ---------------------------------------------------------------------------
// Pipeline: Content Quality Checks
// ---------------------------------------------------------------------------
async function runContentQualityChecks() {
  if (!supabaseAdmin) return;

  try {
    // Find stories with very short content (possible low quality)
    const { data: shortStories, error } = await supabaseAdmin
      .from('stories')
      .select('id, title, content')
      .is('is_verified', false)
      .limit(50);

    if (error || !shortStories) return;

    let flagged = 0;
    for (const story of shortStories) {
      const wordCount = (story.content || '').split(/\s+/).length;

      // Flag stories under 50 words as low quality
      if (wordCount < 50) {
        flagged++;
        // Could update a quality_flag column if it exists
        console.log(
          `[Quality] Flagged story ${story.id} (${story.title}): only ${wordCount} words`
        );
      }
    }

    metrics.storiesProcessed += shortStories.length;
    console.log(
      `[Quality] Checked ${shortStories.length} stories, flagged ${flagged}`
    );
  } catch (err) {
    console.error('[Quality] Error:', err.message);
  }
}

// ---------------------------------------------------------------------------
// Pipeline: Data Cleanup
// ---------------------------------------------------------------------------
async function runDataCleanup() {
  if (!supabaseAdmin) return;

  try {
    // Find stale unverified stories (> 90 days old with no updates)
    const ninetyDaysAgo = new Date(
      Date.now() - 90 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: staleStories, error } = await supabaseAdmin
      .from('stories')
      .select('id')
      .is('is_verified', false)
      .lt('updated_at', ninetyDaysAgo)
      .limit(100);

    if (!error && staleStories && staleStories.length > 0) {
      console.log(
        `[Cleanup] Found ${staleStories.length} stale unverified stories older than 90 days`
      );
      // Log for now — actual archival would move to an archive table
    }
  } catch (err) {
    console.error('[Cleanup] Error:', err.message);
  }
}

// ---------------------------------------------------------------------------
// Main Job Runner
// ---------------------------------------------------------------------------
async function processJobs() {
  if (isProcessing) {
    console.log(
      `[Worker] Skipping pipeline run at ${new Date().toISOString()} — previous run still in progress`
    );
    return { skipped: true, lastRun: metrics.lastRun };
  }

  isProcessing = true;
  const startTime = Date.now();
  console.log(`[Worker] Starting pipeline run at ${new Date().toISOString()}`);

  try {
    await computeStoryAnalytics();
    await runContentQualityChecks();
    await runDataCleanup();

    metrics.lastRun = new Date().toISOString();
    const duration = Date.now() - startTime;
    console.log(`[Worker] Pipeline run completed in ${duration}ms`);
    return { skipped: false, lastRun: metrics.lastRun, duration };
  } catch (err) {
    console.error('[Worker] Pipeline run failed:', err.message);
    throw err;
  } finally {
    isProcessing = false;
  }
}

// ---------------------------------------------------------------------------
// API Endpoints
// ---------------------------------------------------------------------------

// Worker health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'GroqTales Worker',
    timestamp: new Date().toISOString(),
    lastPipelineRun: metrics.lastRun,
    stats: {
      storiesProcessed: metrics.storiesProcessed,
      trendingCount: metrics.trending.length,
      genreCount: Object.keys(metrics.genreDistribution).length,
    },
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json(metrics);
});

// Trending stories endpoint
app.get('/trending', (req, res) => {
  res.json({
    trending: metrics.trending,
    updatedAt: metrics.lastRun,
  });
});

// Genre distribution endpoint
app.get('/genres', (req, res) => {
  res.json({
    distribution: metrics.genreDistribution,
    updatedAt: metrics.lastRun,
  });
});

// Shared-secret auth for internal worker endpoints
function workerAuth(req, res, next) {
  const secret = process.env.WORKER_SECRET;
  if (!secret) return next(); // If no secret configured, allow (dev mode)
  const provided = req.headers['x-worker-secret'] || req.query.secret;
  if (provided !== secret) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

// Manual trigger for pipeline (for testing)
app.post('/run', workerAuth, async (req, res) => {
  try {
    const result = await processJobs();
    if (result?.skipped) {
      return res
        .status(202)
        .json({
          message: 'Pipeline run skipped: already in progress',
          lastRun: metrics.lastRun,
        });
    }
    return res.json({
      message: 'Pipeline run completed',
      lastRun: metrics.lastRun,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: 'Pipeline run failed', message: err.message });
  }
});

// Record Groq API usage (called by the main backend)
app.post('/track-usage', express.json(), workerAuth, (req, res) => {
  const { tokens, error } = req.body;
  metrics.groqRequests++;
  if (typeof tokens === 'number' && Number.isFinite(tokens) && tokens > 0) {
    metrics.groqTokensUsed += tokens;
  }
  if (error) metrics.groqErrors++;
  res.json({ received: true });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

// Run pipeline immediately on start, then every 5 minutes
processJobs().catch((err) => {
  console.error('[Worker] Initial pipeline run failed:', err.message);
});
setInterval(
  () => {
    processJobs().catch((err) => {
      console.error('[Worker] Scheduled pipeline run failed:', err.message);
    });
  },
  5 * 60 * 1000
);

app.listen(PORT, () => {
  console.log(`⚙️ GroqTales Worker service running on port ${PORT}`);
  console.log('🔄 Background pipeline runs every 5 minutes');
});
