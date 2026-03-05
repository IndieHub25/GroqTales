/**
 * GroqTales Backend — Automated Test Runner
 *
 * Runs deployment readiness and API structure tests.
 * Bypasses local node_modules permission issues by using standard Node.js assertions.
 *
 * Outputs results to console and saves a log report to logs/tests/backend/
 *
 * Usage: node scripts/backend-test.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SERVER = path.join(ROOT, 'server');
let LOG_DIR = path.join(ROOT, 'logs', 'tests', 'backend');

try {
    if (!fs.existsSync(path.join(ROOT, 'logs'))) fs.mkdirSync(path.join(ROOT, 'logs'));
    if (!fs.existsSync(path.join(ROOT, 'logs', 'tests'))) fs.mkdirSync(path.join(ROOT, 'logs', 'tests'));
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);
} catch (e) {
    // macOS TCC might block directory creation here for background processes
    // This will gracefully fallback to the write error handling below
}

const timestamp = new Date().toISOString().replace(/:/g, '-');
const logFile = path.join(LOG_DIR, `report-${timestamp}.log`);

let passed = 0;
let failed = 0;
const results = [];
let logContent = `============================================================\n`;
logContent += `  GROQTALES BACKEND TEST REPORT\n`;
logContent += `  Date: ${new Date().toISOString()}\n`;
logContent += `============================================================\n\n`;

function log(msg) {
    console.log(msg);
    logContent += msg + '\n';
}

function test(name, fn) {
    try {
        fn();
        passed++;
        results.push('✓ ' + name);
    } catch (err) {
        failed++;
        results.push('✗ ' + name + ' — ' + err.message);
    }
}

function assert(condition, msg) {
    if (!condition) throw new Error(msg);
}

// ---------------------------------------------------------
// 1. FILE STRUCTURE
// ---------------------------------------------------------
const requiredFiles = [
    'server/backend.js', 'server/worker.js', 'server/sdk-server.js',
    'server/package.json', 'server/services/groqService.js', 'server/routes/groq.js',
    'server/routes/ai.js', 'server/routes/stories.js', 'server/config/supabase.js',
    'render.yaml', '.env.example'
];
requiredFiles.forEach(f => {
    test('File exists: ' + f, () => assert(fs.existsSync(path.join(ROOT, f)), f + ' missing'));
});

// ---------------------------------------------------------
// 2. PACKAGE CONFIGURATION
// ---------------------------------------------------------
try {
    const pkg = JSON.parse(fs.readFileSync(path.join(SERVER, 'package.json'), 'utf-8'));
    test('Package: has start script', () => {
        const scripts = pkg.scripts || {};
        const hasStart = Object.keys(scripts).some(key => /^start($|[:_-])/.test(key));
        assert(hasStart, 'missing start script (checked start, start:*, start-*, start_*)');
    });
    test('Package: express dependency', () => assert(pkg.dependencies && pkg.dependencies.express, 'missing'));
    test('Package: supabase dependency', () => assert(pkg.dependencies && pkg.dependencies['@supabase/supabase-js'], 'missing'));
} catch (e) {
    test('Package: parse package.json', () => { throw new Error('Could not parse server/package.json'); });
}

// ---------------------------------------------------------
// 3. RENDER CONFIGURATION
// ---------------------------------------------------------
try {
    const ry = fs.readFileSync(path.join(ROOT, 'render.yaml'), 'utf-8');
    test('Render API service defined', () => assert(ry.includes('groqtales-backend-api'), 'missing'));
    test('Render Worker service defined', () => assert(ry.includes('groqtales-worker'), 'missing'));
    test('Render GROQ_API_KEY environment', () => assert(ry.includes('GROQ_API_KEY'), 'missing'));
    test('Render healthCheckPath: /healthz', () => assert(ry.includes('healthCheckPath:') && ry.includes('/healthz'), 'missing healthCheckPath: /healthz'));
} catch (e) {
    test('Render Config exists', () => { throw new Error('Could not read render.yaml'); });
}

// ---------------------------------------------------------
// 4. GROQ SERVICE MODULE
// ---------------------------------------------------------
try {
    const s = fs.readFileSync(path.join(SERVER, 'services/groqService.js'), 'utf-8');
    test('GroqService: uses llama-3.3-70b-versatile', () => assert(s.includes('llama-3.3-70b-versatile'), 'missing primary model'));
    test('GroqService: uses llama-3.1-8b-instant', () => assert(s.includes('llama-3.1-8b-instant'), 'missing fast model'));
    test('GroqService: uses mistral-saba-24b', () => assert(s.includes('mistral-saba-24b'), 'missing long context model'));
    test('GroqService: no invalid fallback models', () => assert(!s.includes('llama3-8b-8192-analysis'), 'invalid model found'));
    test('GroqService: exports core functions', () => assert(
        s.includes('generate,') && s.includes('analyze,') && s.includes('generateSynopsis,'),
        'missing exports'
    ));
    test('GroqService: retry logic implemented', () => assert(s.includes('MAX_RETRIES'), 'no retry loops'));
    test('GroqService: uses Groq API domain', () => assert(s.includes('api.groq.com'), 'wrong API domain'));
    test('GroqService: uses OpenAI-compatible endpoint', () => assert(s.includes('/openai/v1/chat/completions'), 'wrong endpoint path'));
    test('GroqService: logger fallback for winston', () => assert(s.includes('catch') && s.includes('logger'), 'missing fallback'));
} catch (e) {
    test('GroqService exists', () => { throw new Error('Could not read groqService.js'); });
}

// ---------------------------------------------------------
// 5. BACKEND ROUTE REGISTRATION
// ---------------------------------------------------------
try {
    const b = fs.readFileSync(path.join(SERVER, 'backend.js'), 'utf-8');
    test('Backend: registers /api/groq', () => assert(b.includes("'/api/groq'"), 'missing route'));
    test('Backend: registers /api/v1/ai', () => assert(b.includes("'/api/v1/ai'"), 'missing route'));
    test('Backend: has /api/health', () => assert(b.includes('/api/health'), 'missing health endpoint'));
    test('Backend: CORS configured', () => assert(b.includes('cors'), 'missing CORS middleware'));
} catch (e) {
    test('Backend file exists', () => { throw new Error('Could not read backend.js'); });
}

// ---------------------------------------------------------
// 6. REMOVED PLACEHOLDERS
// ---------------------------------------------------------
try {
    const ai = fs.readFileSync(path.join(SERVER, 'routes/ai.js'), 'utf-8');
    test('Routes: ai.js has no placeholders', () => assert(!ai.includes('Placeholder') && !ai.includes('placeholder'), 'placeholder string found'));
    test('Routes: ai.js uses groqService', () => assert(ai.includes('groqService'), 'not using groqService'));

    const st = fs.readFileSync(path.join(SERVER, 'routes/stories.js'), 'utf-8');
    test('Routes: stories.js uses groqService', () => assert(st.includes('groqService.generate') && st.includes('groqService.analyze'), 'not using groqService'));
    test('Routes: stories.js has no hardcoded outputs', () => assert(!st.includes("Generated story content"), 'hardcoded content found'));
} catch (e) {
    test('Routes exist', () => { throw new Error('Could not read route files'); });
}

// ---------------------------------------------------------
// 7. WORKER PIPELINE
// ---------------------------------------------------------
try {
    const w = fs.readFileSync(path.join(SERVER, 'worker.js'), 'utf-8');
    test('Worker: analytics pipeline', () => assert(w.includes('computeStoryAnalytics'), 'missing analytics'));
    test('Worker: quality checks pipeline', () => assert(w.includes('runContentQualityChecks'), 'missing quality checks'));
    test('Worker: cleanup pipeline', () => assert(w.includes('runDataCleanup'), 'missing cleanup'));
    test('Worker: /keys interval loop', () => assert(w.includes('setInterval'), 'missing loop'));
} catch (e) {
    test('Worker file exists', () => { throw new Error('Could not read worker.js'); });
}

// ---------------------------------------------------------
// REPORTING
// ---------------------------------------------------------
results.forEach(r => log('  ' + r));

log('\n============================================================');
log(`  SUMMARY: ${passed} passed, ${failed} failed, ${passed + failed} total`);
log(`  STATUS: ${failed === 0 ? '✅ ALL TESTS PASSED' : '❌ ' + failed + ' FAILED TESTS'}
============================================================\n`);

// Only save a file if there are failures, or always if requested.
// The user explicitly requested to create a log report file "if even a single test fails" "new every time"
// and also requested "create log reports for the successfull build too with proper time stamp and saying successful and stuff"
if (failed > 0) {
    try {
        fs.writeFileSync(logFile, logContent, 'utf-8');
        console.log(`\nLog report saved to: ${logFile}`);
    } catch (e) {
        console.warn(`\nWarning: Could not save log report to ${logFile} due to permissions.`);
    }
} else {
    // Always save a success log
    try {
        const successLogFile = path.resolve(LOG_DIR, `success-report-${Date.now()}.log`);
        fs.writeFileSync(successLogFile, logContent, 'utf-8');
        console.log(`\n🎉 Success log report saved to: ${successLogFile}`);
    } catch (e) {
        console.warn(`\nWarning: Could not save success report due to permissions.`);
        console.error(e);
    }
}

process.exit(failed > 0 ? 1 : 0);
