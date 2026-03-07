/**
 * Bug Condition Exploration Test
 * Backend Server Crash and CORS Fix
 *
 * **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bugs exist
 * **Property 1: Fault Condition** - Server Startup and CORS Failures
 *
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**
 *
 * This test encodes the expected behavior:
 * - Server startup should successfully load stories.js without ReferenceError
 * - Cross-origin requests from allowed origins should receive proper CORS headers
 * - Requests with no origin header should be allowed through
 *
 * When run on UNFIXED code, this test will FAIL (proving bugs exist)
 * When run on FIXED code, this test will PASS (proving bugs are resolved)
 */

const request = require('supertest');
const express = require('express');
const cors = require('cors');

describe('Bug Condition Exploration: Server Startup and CORS', () => {
  describe('Property 1: Server Startup - stories.js Module Loading', () => {
    test('should load stories.js module without ReferenceError', () => {
      // **EXPECTED OUTCOME ON UNFIXED CODE**: This will throw ReferenceError
      // "Cannot access 'fileUploadOptions' before initialization" at line 221

      expect(() => {
        // Attempt to require the stories.js module
        // This will fail on unfixed code due to temporal dead zone error
        require('../../server/routes/stories');
      }).not.toThrow();

      // If we reach here without throwing, the module loaded successfully
      // This means fileUploadOptions is declared before its first usage
    });
  });

  describe('Property 1: CORS Configuration - sdk-server.js Multi-Origin Support', () => {
    let app;

    beforeEach(() => {
      // Create a minimal Express app using shared CORS configuration
      app = express();
      const { corsOriginCallback } = require('../../server/config/cors');

      app.use(
        cors({
          origin: corsOriginCallback,
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

      app.get('/sdk/health', (req, res) => {
        res.json({ status: 'healthy' });
      });
    });

    test('should allow cross-origin requests from localhost:3001', async () => {
      // **EXPECTED OUTCOME ON UNFIXED CODE**: This will FAIL
      // The current single-origin CORS config rejects this origin

      const response = await request(app)
        .get('/sdk/health')
        .set('Origin', 'http://localhost:3001');

      // Expected behavior: CORS headers should be present
      expect(response.headers['access-control-allow-origin']).toBe(
        'http://localhost:3001'
      );
      expect(response.headers['access-control-allow-credentials']).toBe('true');
      expect(response.status).toBe(200);
    });

    test('should allow cross-origin requests from groqtales.vercel.app', async () => {
      // **EXPECTED OUTCOME ON UNFIXED CODE**: This will FAIL
      // The current single-origin CORS config rejects this origin

      const response = await request(app)
        .get('/sdk/health')
        .set('Origin', 'https://groqtales.vercel.app');

      // Expected behavior: CORS headers should be present
      expect(response.headers['access-control-allow-origin']).toBe(
        'https://groqtales.vercel.app'
      );
      expect(response.headers['access-control-allow-credentials']).toBe('true');
      expect(response.status).toBe(200);
    });

    test('should allow requests with no origin header (Swagger UI, curl)', async () => {
      // **EXPECTED OUTCOME ON UNFIXED CODE**: This might PASS or FAIL
      // Depends on how the single-origin CORS handles missing origin

      const response = await request(app).get('/sdk/health');
      // No Origin header set

      // Expected behavior: Request should succeed
      expect(response.status).toBe(200);
      // Note: When no origin is present, CORS headers may not be set
      // but the request should still be allowed through
    });

    test('should allow cross-origin requests from localhost:3000', async () => {
      // **EXPECTED OUTCOME ON UNFIXED CODE**: This will FAIL
      // The current single-origin CORS config rejects this origin

      const response = await request(app)
        .get('/sdk/health')
        .set('Origin', 'http://localhost:3000');

      // Expected behavior: CORS headers should be present
      expect(response.headers['access-control-allow-origin']).toBe(
        'http://localhost:3000'
      );
      expect(response.headers['access-control-allow-credentials']).toBe('true');
      expect(response.status).toBe(200);
    });

    test('should allow cross-origin requests from groqtales.xyz', async () => {
      // **EXPECTED OUTCOME ON UNFIXED CODE**: This might PASS
      // This is the default origin in the current config

      const response = await request(app)
        .get('/sdk/health')
        .set('Origin', 'https://groqtales.xyz');

      // Expected behavior: CORS headers should be present
      expect(response.headers['access-control-allow-origin']).toBe(
        'https://groqtales.xyz'
      );
      expect(response.headers['access-control-allow-credentials']).toBe('true');
      expect(response.status).toBe(200);
    });
  });
});
