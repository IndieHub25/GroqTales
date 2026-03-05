/**
 * GroqTales Backend — Render Deployment Readiness Tests
 *
 * Validates that all required files, configuration, and modules
 * are properly set up for successful Render deployment.
 *
 * Run: npx jest tests/backend/render-deployment.test.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../');
const SERVER = path.join(ROOT, 'server');

// ============================================================================
// FILE STRUCTURE CHECKS
// ============================================================================

describe('Render Deployment Readiness', () => {
    describe('Required Server Files', () => {
        const requiredFiles = [
            'server/backend.js',
            'server/worker.js',
            'server/sdk-server.js',
            'server/package.json',
            'server/services/groqService.js',
            'server/routes/groq.js',
            'server/routes/ai.js',
            'server/routes/stories.js',
            'server/routes/comics.js',
            'server/routes/auth.js',
            'server/routes/drafts.js',
            'server/routes/sdk.js',
            'server/config/supabase.js',
            'server/middleware/auth.js',
            'render.yaml',
        ];

        test.each(requiredFiles)('%s exists', (filePath) => {
            expect(fs.existsSync(path.join(ROOT, filePath))).toBe(true);
        });
    });

    describe('Package Configuration', () => {
        let serverPkg;

        beforeAll(() => {
            serverPkg = JSON.parse(fs.readFileSync(path.join(SERVER, 'package.json'), 'utf-8'));
        });

        test('server package.json has start script', () => {
            expect(serverPkg.scripts).toBeDefined();
            expect(serverPkg.scripts.start || serverPkg.scripts['start:prod']).toBeDefined();
        });

        test('server package.json lists express dependency', () => {
            expect(serverPkg.dependencies).toBeDefined();
            expect(serverPkg.dependencies.express).toBeDefined();
        });

        test('server package.json lists @supabase/supabase-js dependency', () => {
            expect(serverPkg.dependencies['@supabase/supabase-js']).toBeDefined();
        });

        test('server package.json has required deps for all routes', () => {
            const requiredDeps = ['express', 'cors', 'helmet', 'compression', '@supabase/supabase-js'];
            for (const dep of requiredDeps) {
                expect(serverPkg.dependencies[dep]).toBeDefined();
            }
        });
    });

    describe('Render Configuration', () => {
        let renderConfig;

        beforeAll(() => {
            const renderYaml = fs.readFileSync(path.join(ROOT, 'render.yaml'), 'utf-8');
            // Simple YAML parsing for key fields
            renderConfig = renderYaml;
        });

        test('render.yaml defines backend API service', () => {
            expect(renderConfig).toContain('groqtales-backend-api');
        });

        test('render.yaml defines worker service', () => {
            expect(renderConfig).toContain('groqtales-worker');
        });

        test('render.yaml references GROQ_API_KEY env var', () => {
            expect(renderConfig).toContain('GROQ_API_KEY');
        });

        test('render.yaml has build command for server', () => {
            expect(renderConfig).toContain('npm install');
        });
    });

    describe('Groq Service Module Structure', () => {
        let serviceSource;

        beforeAll(() => {
            serviceSource = fs.readFileSync(
                path.join(SERVER, 'services/groqService.js'),
                'utf-8'
            );
        });

        test('exports MODELS with valid Groq identifiers', () => {
            expect(serviceSource).toContain('llama-3.3-70b-versatile');
            expect(serviceSource).toContain('llama-3.1-8b-instant');
            expect(serviceSource).toContain('mistral-saba-24b');
        });

        test('does NOT reference invalid model names', () => {
            expect(serviceSource).not.toContain('llama3-8b-8192-analysis');
            expect(serviceSource).not.toContain('llama3-8b-8192-recommendations');
            expect(serviceSource).not.toContain('llama3-70b-8192');
        });

        test('exports generate, analyze, generateIdeas, improve, generateSynopsis', () => {
            expect(serviceSource).toContain('module.exports');
            expect(serviceSource).toContain('generate,');
            expect(serviceSource).toContain('analyze,');
            expect(serviceSource).toContain('generateIdeas,');
            expect(serviceSource).toContain('improve,');
            expect(serviceSource).toContain('generateSynopsis,');
        });

        test('calls Groq API at correct endpoint', () => {
            expect(serviceSource).toContain('https://api.groq.com/openai/v1/chat/completions');
        });

        test('has retry logic for 5xx errors', () => {
            expect(serviceSource).toContain('MAX_RETRIES');
            expect(serviceSource).toContain('attempt');
        });

        test('has logger fallback for missing winston', () => {
            expect(serviceSource).toContain('try {');
            expect(serviceSource).toContain("require('../utils/logger')");
        });
    });

    describe('Route Registration', () => {
        let backendSource;

        beforeAll(() => {
            backendSource = fs.readFileSync(path.join(SERVER, 'backend.js'), 'utf-8');
        });

        test('backend.js registers /api/groq route', () => {
            expect(backendSource).toContain("app.use('/api/groq'");
            expect(backendSource).toContain("require('./routes/groq')");
        });

        test('backend.js registers /api/v1/ai route', () => {
            expect(backendSource).toContain("app.use('/api/v1/ai'");
            expect(backendSource).toContain("require('./routes/ai')");
        });

        test('backend.js registers /api/v1/stories route', () => {
            expect(backendSource).toContain("require('./routes/stories')");
        });

        test('backend.js has health check endpoint', () => {
            expect(backendSource).toContain('/api/health');
        });

        test('backend.js has CORS configuration', () => {
            expect(backendSource).toContain('cors');
        });

        test('backend.js has rate limiting', () => {
            expect(backendSource).toContain('rateLimit');
        });
    });

    describe('AI Routes — No Placeholder Code', () => {
        test('ai.js does NOT contain placeholder responses', () => {
            const aiSource = fs.readFileSync(path.join(SERVER, 'routes/ai.js'), 'utf-8');
            expect(aiSource).not.toContain('Placeholder');
            expect(aiSource).not.toContain('placeholder');
            expect(aiSource).toContain('groqService');
        });

        test('stories.js generate route uses groqService', () => {
            const storiesSource = fs.readFileSync(path.join(SERVER, 'routes/stories.js'), 'utf-8');
            expect(storiesSource).toContain('groqService');
            expect(storiesSource).not.toContain("content: 'Generated story content based on prompt...'");
        });

        test('stories.js analyze route fetches from database', () => {
            const storiesSource = fs.readFileSync(path.join(SERVER, 'routes/stories.js'), 'utf-8');
            expect(storiesSource).toContain('supabaseAdmin');
            expect(storiesSource).toContain('groqService.analyze');
        });
    });

    describe('Worker Pipeline', () => {
        let workerSource;

        beforeAll(() => {
            workerSource = fs.readFileSync(path.join(SERVER, 'worker.js'), 'utf-8');
        });

        test('worker.js has health endpoint', () => {
            expect(workerSource).toContain('/health');
        });

        test('worker.js has analytics pipeline', () => {
            expect(workerSource).toContain('computeStoryAnalytics');
        });

        test('worker.js has quality checks pipeline', () => {
            expect(workerSource).toContain('runContentQualityChecks');
        });

        test('worker.js has data cleanup pipeline', () => {
            expect(workerSource).toContain('runDataCleanup');
        });

        test('worker.js has metrics endpoint', () => {
            expect(workerSource).toContain('/metrics');
        });

        test('worker.js runs pipeline on interval', () => {
            expect(workerSource).toContain('setInterval');
        });
    });

    describe('Environment Variables', () => {
        test('.env.example documents GROQ_API_KEY', () => {
            const envExample = fs.readFileSync(path.join(ROOT, '.env.example'), 'utf-8');
            expect(envExample).toContain('GROQ_API_KEY');
        });

        test('.env.example documents GROQ_API_URL', () => {
            const envExample = fs.readFileSync(path.join(ROOT, '.env.example'), 'utf-8');
            expect(envExample).toContain('GROQ_API_URL');
        });

        test('render.yaml references required env vars', () => {
            const renderYaml = fs.readFileSync(path.join(ROOT, 'render.yaml'), 'utf-8');
            expect(renderYaml).toContain('GROQ_API_KEY');
            expect(renderYaml).toContain('NODE_ENV');
        });
    });

    describe('Frontend Model Consistency', () => {
        test('lib/groq-service.ts uses valid model names matching backend', () => {
            const frontendService = fs.readFileSync(
                path.join(ROOT, 'lib/groq-service.ts'),
                'utf-8'
            );
            expect(frontendService).toContain('llama-3.3-70b-versatile');
            expect(frontendService).toContain('llama-3.1-8b-instant');
            expect(frontendService).not.toContain('llama3-70b-8192');
            expect(frontendService).not.toContain('llama3-8b-8192-analysis');
        });
    });
});
